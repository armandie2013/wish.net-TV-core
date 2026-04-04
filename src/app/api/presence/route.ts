import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth-guards";
import { touchUserPresence } from "@/services/presence.service";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    if (user.estado !== "activo") {
      return NextResponse.json(
        { ok: false, message: "Usuario no activo" },
        { status: 403 }
      );
    }

    await touchUserPresence(user._id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al registrar presencia";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}