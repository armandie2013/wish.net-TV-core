import { NextResponse } from "next/server";
import {
  getAllChannels,
  createChannel,
  getChannelById,
  updateChannel,
  toggleChannelStatus,
  deleteChannel,
} from "@/services/channel.service";
import {
  createChannelSchema,
  updateChannelSchema,
} from "@/validations/channel.validation";
import { GuardError, requireAdminFromRequest } from "@/lib/auth-guards";
import { buildUrlFromRequest } from "@/lib/request-url";
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
        {
          ok: false,
          message: "Debés cambiar tu contraseña antes de continuar",
        },
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

  return NextResponse.redirect(buildUrlFromRequest(request, "/dashboard"), 303);
}

export async function getChannelsController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const channels = await getAllChannels();

    return NextResponse.json(
      {
        ok: true,
        channels,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener canales";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function createChannelController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const contentType = request.headers.get("content-type") || "";

    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();

      rawData = {
        nombre: formData.get("nombre"),
        descripcion: formData.get("descripcion"),
        categoria: formData.get("categoria"),
        logo: formData.get("logo"),
        urlOrigen: formData.get("urlOrigen"),
        estado: formData.get("estado"),
      };
    }

    const parsed = createChannelSchema.safeParse(rawData);

    if (!parsed.success) {
      if (contentType.includes("application/json")) {
        return NextResponse.json(
          {
            ok: false,
            message: "Datos inválidos",
            errors: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }

      return NextResponse.redirect(
        buildUrlFromRequest(request, "/canales/new?error=datos-invalidos"),
        303
      );
    }

    const channel = await createChannel(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "CHANNEL_CREATE",
      message: "Se creó un nuevo canal",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: channel._id,
      targetName: channel.nombre,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        {
          ok: true,
          message: "Canal creado correctamente",
          channel,
        },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/canales?success=channel-created"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear canal";

    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json(
        {
          ok: false,
          message,
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/canales/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getChannelByIdController(
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

    const channel = await getChannelById(params.id);

    return NextResponse.json(
      {
        ok: true,
        channel,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener canal";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 404 }
    );
  }
}

export async function updateChannelController(
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

    const formData = await request.formData();

    const rawData = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      categoria: formData.get("categoria"),
      logo: formData.get("logo"),
      urlOrigen: formData.get("urlOrigen"),
      estado: formData.get("estado"),
    };

    const parsed = updateChannelSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        buildUrlFromRequest(
          request,
          `/canales/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const currentUser = await requireAdminFromRequest(request);
    const updatedChannel = await updateChannel(params.id, parsed.data);

    await createSystemLog({
      action: "CHANNEL_UPDATE",
      message: "Se actualizó un canal",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedChannel._id,
      targetName: updatedChannel.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/canales?success=channel-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar canal";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/canales/${params.id}/edit?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function toggleChannelStatusController(
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
    const updatedChannel = await toggleChannelStatus(params.id);

    await createSystemLog({
      action: "CHANNEL_STATUS_UPDATE",
      message: `Se cambió el estado del canal a ${updatedChannel.estado}`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedChannel._id,
      targetName: updatedChannel.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/canales?success=status-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al cambiar el estado del canal";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/canales?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function deleteChannelController(
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
    const deletedChannel = await deleteChannel(params.id);

    await createSystemLog({
      action: "CHANNEL_DELETE",
      message:
        "Se eliminó un canal y se limpiaron sus referencias en los planes",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: deletedChannel._id,
      targetName: deletedChannel.nombre,
      meta: {
        categoria: deletedChannel.categoria,
        estado: deletedChannel.estado,
      },
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/canales?success=channel-deleted"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar canal";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/canales?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}