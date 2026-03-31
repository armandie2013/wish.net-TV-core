import { NextResponse } from "next/server";
import { loginSchema } from "../validations/auth.validation";
import { loginUser } from "../services/auth.service";

export async function loginController(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Datos inválidos",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await loginUser(parsed.data);

    const response = NextResponse.json(
      {
        ok: true,
        message: "Login correcto",
        user: result.user,
      },
      { status: 200 }
    );

    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 401 }
    );
  }
}