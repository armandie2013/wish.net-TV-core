import { NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { loginUser } from "@/services/auth.service";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

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
        new URL("/login?error=datos-invalidos", request.url),
        303
      );
    }

    const result = await loginUser(parsed.data);

    const response = NextResponse.redirect(
      new URL("/dashboard", request.url),
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
      new URL("/login?error=credenciales", request.url),
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
      "nombre email rol localidad estado"
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