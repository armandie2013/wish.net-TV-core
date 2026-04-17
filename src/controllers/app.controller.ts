import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import "@/models/Channel";
import "@/models/Plan";
import { resolveChannelStream } from "@/services/channel-play.service";
import { loginSchema } from "@/validations/auth.validation";
import { loginUser } from "@/services/auth.service";
import { updateUserPasswordSchema } from "@/validations/user.validation";
import { updateUserPassword } from "@/services/user.service";
import { createSystemLog } from "@/services/system-log.service";

type AppGridChannel = {
  numero: number;
  orden: number;
  id: string;
  name: string;
  logo: string;
  category: string;
  sourceName: string;
  enabled: boolean;
};

function getAuthTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  return tokenMatch?.[1];
}

function normalizeChannelDocument(channel: any) {
  if (!channel) return null;

  return {
    _id: String(channel._id),
    nombre: channel.nombre || "",
    categoria: channel.categoria || "General",
    logo: channel.logo || "",
    sourceName: channel.sourceName || "",
    estado: channel.estado || "activo",
    tvgId: channel.tvgId || "",
    urlOrigen: channel.urlOrigen || "",
  };
}

function buildGridFromPlan(plan: any): AppGridChannel[] {
  const rawGrid = Array.isArray(plan.grillaCanales) ? plan.grillaCanales : [];

  if (rawGrid.length > 0) {
    return rawGrid
      .map((item: any, index: number) => {
        const channel =
          item.channelId && typeof item.channelId === "object"
            ? normalizeChannelDocument(item.channelId)
            : null;

        if (!channel) return null;
        if (channel.estado !== "activo") return null;
        if (!item.habilitado) return null;

        return {
          numero: Number(item.numero || index + 1),
          orden: Number(item.orden || index + 1),
          id: String(channel._id),
          name: item.nombreVisible?.trim() || channel.nombre,
          logo: item.logo || channel.logo || "",
          category: item.categoria || channel.categoria || "General",
          sourceName: item.sourceName || channel.sourceName || "",
          enabled: true,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.orden - b.orden);
  }

  const fallbackChannels = Array.isArray(plan.canalesPermitidos)
    ? plan.canalesPermitidos
    : [];

  return fallbackChannels
    .map((channel: any, index: number) => {
      const normalized = normalizeChannelDocument(channel);

      if (!normalized) return null;
      if (normalized.estado !== "activo") return null;

      return {
        numero: index + 1,
        orden: index + 1,
        id: normalized._id,
        name: normalized.nombre,
        logo: normalized.logo || "",
        category: normalized.categoria || "General",
        sourceName: normalized.sourceName || "",
        enabled: true,
      };
    })
    .filter(Boolean) as AppGridChannel[];
}

async function getAuthenticatedUserWithPlan(request: Request) {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return {
      error: NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      ),
      user: null,
    };
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Token inválido" },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (payload.mustChangePassword) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          message: "Debés cambiar tu contraseña antes de continuar",
        },
        { status: 403 }
      ),
      user: null,
    };
  }

  await connectDB();

  const user = await User.findById(payload.sub)
    .populate({
      path: "planId",
      populate: [
        {
          path: "canalesPermitidos",
          model: "Channel",
        },
        {
          path: "grillaCanales.channelId",
          model: "Channel",
        },
      ],
    })
    .select("nombre email rol estado localidad conexionesPermitidas planId")
    .lean();

  if (!user) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      ),
      user: null,
    };
  }

  if ((user as any).estado !== "activo") {
    return {
      error: NextResponse.json(
        { ok: false, message: "Usuario inactivo" },
        { status: 403 }
      ),
      user: null,
    };
  }

  if (!(user as any).planId) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Usuario sin plan asignado" },
        { status: 400 }
      ),
      user: null,
    };
  }

  const plan = (user as any).planId;

  if (plan.estado && plan.estado !== "activo") {
    return {
      error: NextResponse.json(
        { ok: false, message: "Plan inactivo" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return {
    error: null,
    user,
  };
}

export async function getLiveController(request: Request) {
  try {
    const auth = await getAuthenticatedUserWithPlan(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user as any;
    const plan = user.planId;

    const grid = buildGridFromPlan(plan);

    return NextResponse.json(
      {
        ok: true,
        mode: "linear-tv",
        user: {
          id: String(user._id),
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          localidad: user.localidad || "principal",
        },
        plan: {
          id: String(plan._id),
          nombre: plan.nombre,
          estado: plan.estado,
        },
        summary: {
          totalChannels: grid.length,
        },
        grid,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 }
    );
  }
}

export async function getMeController(request: Request) {
  try {
    const auth = await getAuthenticatedUserWithPlan(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user as any;

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          estado: user.estado,
          localidad: user.localidad || "principal",
          conexionesPermitidas: user.conexionesPermitidas,
          plan: user.planId
            ? {
                id: String(user.planId._id),
                nombre: user.planId.nombre,
                estado: user.planId.estado,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 }
    );
  }
}

export async function getChannelPlayController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedUserWithPlan(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user as any;
    const plan = user.planId;

    const grid = buildGridFromPlan(plan);
    const gridItem = grid.find((item) => item.id === params.id) || null;

    const resolved = await resolveChannelStream(String(user._id), params.id);

    return NextResponse.json(
      {
        ok: true,
        strategy: resolved.strategy,
        fallbackUsed: resolved.fallbackUsed,
        user: resolved.user,
        location: resolved.location,
        node: resolved.node,
        channel: {
          ...resolved.channel,
          numero: gridItem?.numero ?? null,
          orden: gridItem?.orden ?? null,
          visibleName: gridItem?.name ?? resolved.channel.name,
          sourceName: gridItem?.sourceName ?? "",
        },
        playback: {
          mode: "resolved",
          streamUrl: resolved.streamUrl,
          directSourceUrl: resolved.directSourceUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno";

    const status =
      message === "El canal no está disponible para este usuario"
        ? 403
        : message === "Canal no encontrado"
        ? 404
        : message === "Canal inválido"
        ? 400
        : 500;

    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function getChannelStreamRedirectController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedUserWithPlan(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user as any;

    const resolved = await resolveChannelStream(String(user._id), params.id);

    return NextResponse.redirect(resolved.streamUrl, 302);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno";

    const status =
      message === "El canal no está disponible para este usuario"
        ? 403
        : message === "Canal no encontrado"
        ? 404
        : message === "Canal inválido"
        ? 400
        : message === "Usuario inactivo"
        ? 403
        : message === "Usuario sin plan asignado"
        ? 400
        : 500;

    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function appLoginController(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email ?? "";
      password = body.password ?? "";
    } else {
      const formData = await request.formData();
      email = String(formData.get("email") ?? "");
      password = String(formData.get("password") ?? "");
    }

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos" },
        { status: 400 }
      );
    }

    const result = await loginUser(parsed.data);
    const appUser = result.user as any;

    await createSystemLog({
      action: "AUTH_LOGIN_APP",
      message: "Inicio de sesión exitoso desde app",
      actorId: appUser._id,
      actorName: appUser.nombre,
      actorEmail: appUser.email,
    });

    return NextResponse.json(
      {
        ok: true,
        token: result.token,
        mustChangePassword: result.mustChangePassword,
        user: {
          id: String(appUser._id),
          nombre: appUser.nombre,
          email: appUser.email,
          rol: appUser.rol,
          estado: appUser.estado,
          localidad: appUser.localidad || "principal",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Credenciales inválidas";

    return NextResponse.json({ ok: false, message }, { status: 401 });
  }
}

export async function appChangePasswordController(request: Request) {
  try {
    const token = getAuthTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return NextResponse.json(
        { ok: false, message: "Token inválido" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = updateUserPasswordSchema.safeParse({
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserPassword(payload.sub, parsed.data.password);

    await createSystemLog({
      action: "AUTH_CHANGE_PASSWORD_APP",
      message: "Cambio de contraseña exitoso desde app",
      actorId: updatedUser._id,
      actorName: updatedUser.nombre,
      actorEmail: updatedUser.email,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Contraseña actualizada correctamente",
        user: {
          id: String(updatedUser._id),
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          rol: updatedUser.rol,
          estado: updatedUser.estado,
          localidad: updatedUser.localidad || "principal",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar la contraseña";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}