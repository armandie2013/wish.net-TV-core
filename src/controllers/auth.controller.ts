import { NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { loginUser } from "@/services/auth.service";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { updateUserPasswordSchema } from "@/validations/user.validation";
import { updateUserPassword } from "@/services/user.service";
import { buildUrlFromRequest } from "@/lib/request-url";
import { createSystemLog } from "@/services/system-log.service";

export async function loginController(request: Request) {
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
      return NextResponse.redirect(
        buildUrlFromRequest(request, "/login?error=datos-invalidos"),
        303
      );
    }

    const result = await loginUser(parsed.data);

    await createSystemLog({
      action: "AUTH_LOGIN",
      message: "Inicio de sesión exitoso",
      actorId: result.user._id,
      actorName: result.user.nombre,
      actorEmail: result.user.email,
    });

    const destination = result.mustChangePassword
      ? "/change-password"
      : "/dashboard";

    const response = NextResponse.redirect(
      buildUrlFromRequest(request, destination),
      303
    );

    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.redirect(
      buildUrlFromRequest(request, "/login?error=credenciales"),
      303
    );
  }
}

export async function meController(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch?.[1];

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

    await connectDB();

    const user = await User.findById(payload.sub).select(
      "nombre email rol localidad estado mustChangePassword"
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function changeOwnPasswordController(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.redirect(
        buildUrlFromRequest(request, "/login"),
        303
      );
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return NextResponse.redirect(
        buildUrlFromRequest(request, "/login"),
        303
      );
    }

    const formData = await request.formData();

    const rawData = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = updateUserPasswordSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        buildUrlFromRequest(request, "/change-password?error=datos-invalidos"),
        303
      );
    }

    const updatedUser = await updateUserPassword(payload.sub, parsed.data);

    await createSystemLog({
      action: "AUTH_CHANGE_OWN_PASSWORD",
      message: "El usuario cambió su contraseña",
      actorId: updatedUser._id,
      actorName: updatedUser.nombre,
      actorEmail: updatedUser.email,
    });

    const response = NextResponse.redirect(
      buildUrlFromRequest(request, "/login?success=password-changed"),
      303
    );

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar contraseña";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/change-password?error=${encodeURIComponent(message)}`
      ),
      303
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
          _id: appUser._id,
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