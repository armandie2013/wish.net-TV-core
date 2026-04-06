import { NextResponse } from "next/server";
import { GuardError, requireAdminFromRequest } from "@/lib/auth-guards";
import { buildUrlFromRequest } from "@/lib/request-url";
import {
  ensureUserPlaylistToken,
  regenerateUserPlaylistToken,
} from "@/services/playlist-token.service";
import { createSystemLog } from "@/services/system-log.service";

function isJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";

  return (
    contentType.includes("application/json") ||
    accept.includes("application/json")
  );
}

function handleGuardError(request: Request, error: unknown) {
  if (!(error instanceof GuardError)) {
    return null;
  }

  if (isJsonRequest(request)) {
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    if (error.code === "PASSWORD_CHANGE_REQUIRED") {
      return NextResponse.json(
        { ok: false, message: "Debés cambiar tu contraseña antes de continuar" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "No autorizado" },
      { status: 403 }
    );
  }

  if (error.code === "UNAUTHORIZED") {
    return NextResponse.redirect(buildUrlFromRequest(request, "/login"), 303);
  }

  if (error.code === "PASSWORD_CHANGE_REQUIRED") {
    return NextResponse.redirect(
      buildUrlFromRequest(request, "/change-password"),
      303
    );
  }

  return NextResponse.redirect(
    buildUrlFromRequest(request, "/dashboard"),
    303
  );
}

export async function ensureUserPlaylistTokenController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const currentUser = await requireAdminFromRequest(request);
    const result = await ensureUserPlaylistToken(params.id);

    await createSystemLog({
      action: "USER_PLAYLIST_TOKEN_ENSURE",
      message: "Se generó o consultó el token IPTV de un usuario",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: result._id,
      targetName: result.nombre,
      targetEmail: result.email,
    });

    return NextResponse.json(
      {
        ok: true,
        user: result,
        playlistUrl: `${new URL(request.url).origin}/api/playlist/${result.playlistToken}`,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener token IPTV";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function regenerateUserPlaylistTokenController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const currentUser = await requireAdminFromRequest(request);
    const result = await regenerateUserPlaylistToken(params.id);

    await createSystemLog({
      action: "USER_PLAYLIST_TOKEN_REGENERATE",
      message: "Se regeneró el token IPTV de un usuario",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: result._id,
      targetName: result.nombre,
      targetEmail: result.email,
    });

    return NextResponse.json(
      {
        ok: true,
        user: result,
        playlistUrl: `${new URL(request.url).origin}/api/playlist/${result.playlistToken}`,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al regenerar token IPTV";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}