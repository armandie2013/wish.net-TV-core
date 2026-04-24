import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth";
import {
  getClientIp,
  getDeviceId,
  renewActiveConnection,
} from "@/services/active-connection.service";

function getAuthTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);

  return tokenMatch?.[1] ? decodeURIComponent(tokenMatch[1]) : null;
}

async function getUserFromRequest(request: Request) {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload?.sub) {
    return null;
  }

  return User.findById(payload.sub);
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "No autorizado.",
        },
        { status: 401 }
      );
    }

    if (user.estado !== "activo") {
      return NextResponse.json(
        {
          ok: false,
          message: "Usuario no activo.",
        },
        { status: 403 }
      );
    }

    const userId = user._id.toString();
    const deviceId = getDeviceId(request, userId);
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    await User.findByIdAndUpdate(userId, {
      lastSeen: new Date(),
    });

    await renewActiveConnection({
      userId,
      deviceId,
      ip,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      message: "Presencia actualizada.",
      deviceId,
    });
  } catch (error) {
    console.error("[PRESENCE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error actualizando presencia.",
      },
      { status: 500 }
    );
  }
}