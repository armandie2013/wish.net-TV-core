import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import {
  buildPlaylistForUser,
  buildPlaylistForUserByToken,
} from "@/services/playlist.service";
import { createSystemLog } from "@/services/system-log.service";

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  return tokenMatch?.[1] || "";
}

function buildPlaylistResponse(result: Awaited<ReturnType<typeof buildPlaylistForUser>>) {
  return new NextResponse(result.content, {
    status: 200,
    headers: {
      "Content-Type": "audio/x-mpegurl; charset=utf-8",
      "Content-Disposition": `inline; filename="${result.filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function getOwnPlaylistController(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    if (payload.mustChangePassword) {
      return new NextResponse(
        "Debés cambiar tu contraseña antes de acceder a la playlist",
        { status: 403 }
      );
    }

    const result = await buildPlaylistForUser(payload.sub);

    await createSystemLog({
      action: "PLAYLIST_DOWNLOAD",
      message: `El usuario descargó su playlist (${result.totalChannels} canales)`,
      actorId: result.user._id,
      actorName: result.user.nombre,
      actorEmail: result.user.email,
      targetId: result.plan._id,
      targetName: result.plan.nombre,
      meta: {
        totalChannels: result.totalChannels,
        localidad: result.user.localidad,
        mode: "session",
      },
    });

    return buildPlaylistResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar la playlist";

    return new NextResponse(message, { status: 400 });
  }
}

export async function getPlaylistByTokenController(
  _request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const result = await buildPlaylistForUserByToken(params.token);

    await createSystemLog({
      action: "PLAYLIST_DOWNLOAD",
      message: `Se descargó playlist por token (${result.totalChannels} canales)`,
      actorId: result.user._id,
      actorName: result.user.nombre,
      actorEmail: result.user.email,
      targetId: result.plan._id,
      targetName: result.plan.nombre,
      meta: {
        totalChannels: result.totalChannels,
        localidad: result.user.localidad,
        mode: "token",
      },
    });

    return buildPlaylistResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar la playlist";

    return new NextResponse(message, { status: 400 });
  }
}