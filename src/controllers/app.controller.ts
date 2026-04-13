import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Channel from "@/models/Channel";
import "@/models/Plan";
import { resolveChannelStream } from "@/services/channel-play.service";
import { loginSchema } from "@/validations/auth.validation";
import { loginUser } from "@/services/auth.service";
import { updateUserPasswordSchema } from "@/validations/user.validation";
import { updateUserPassword } from "@/services/user.service";
import { createSystemLog } from "@/services/system-log.service";

type AppChannel = {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
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
      populate: {
        path: "canalesPermitidos",
        model: "Channel",
      },
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

    const rawChannels = (plan.canalesPermitidos || []).filter(
      (channel: any) => channel && channel.estado === "activo"
    );

    const channels: AppChannel[] = rawChannels.map((ch: any) => ({
      id: String(ch._id),
      name: ch.nombre,
      logo: ch.logo || "",
      streamUrl: ch.urlOrigen,
      category: ch.categoria || "General",
    }));

    const groupedMap = new Map<string, AppChannel[]>();

    for (const channel of channels) {
      const key = channel.category || "General";

      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }

      groupedMap.get(key)!.push(channel);
    }

    const categories = Array.from(groupedMap.entries())
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([name, items]) => ({
        name,
        totalChannels: items.length,
        channels: items.sort((a, b) => a.name.localeCompare(b.name, "es")),
      }));

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          localidad: user.localidad || "principal",
          plan: plan.nombre,
        },
        summary: {
          totalCategories: categories.length,
          totalChannels: channels.length,
        },
        categories,
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

    const resolved = await resolveChannelStream(String(user._id), params.id);

    return NextResponse.json(
      {
        ok: true,
        strategy: resolved.strategy,
        fallbackUsed: resolved.fallbackUsed,
        user: resolved.user,
        location: resolved.location,
        node: resolved.node,
        channel: resolved.channel,
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

    return NextResponse.json(
      { ok: false, message },
      { status }
    );
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

    return NextResponse.json(
      { ok: false, message },
      { status }
    );
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

    return NextResponse.json(
      { ok: false, message },
      { status: 401 }
    );
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

    const updatedUser = await updateUserPassword(payload.sub, parsed.data);

    await createSystemLog({
      action: "AUTH_CHANGE_OWN_PASSWORD_APP",
      message: "El usuario cambió su contraseña desde la app",
      actorId: updatedUser._id,
      actorName: updatedUser.nombre,
      actorEmail: updatedUser.email,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Contraseña actualizada correctamente",
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar contraseña";

    return NextResponse.json(
      { ok: false, message },
      { status: 400 }
    );
  }
}