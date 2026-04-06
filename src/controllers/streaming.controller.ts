import { NextResponse } from "next/server";
import {
  getAllStreamingNodes,
  createStreamingNode,
  getStreamingNodeById,
  updateStreamingNode,
  toggleStreamingNodeStatus,
} from "@/services/streaming.service";
import {
  createStreamingNodeSchema,
  updateStreamingNodeSchema,
} from "@/validations/streaming.validation";
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

  return NextResponse.redirect(
    buildUrlFromRequest(request, "/dashboard"),
    303
  );
}

export async function getStreamingNodesController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const nodes = await getAllStreamingNodes();

    return NextResponse.json({ ok: true, nodes }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener servidores";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function createStreamingNodeController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const contentType = request.headers.get("content-type") || "";

    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();

      rawData = {
        nombre: formData.get("nombre"),
        tipo: formData.get("tipo"),
        urlBase: formData.get("urlBase"),
        host: formData.get("host"),
        puerto: formData.get("puerto"),
        localidad: formData.get("localidad"),
        prioridad: formData.get("prioridad"),
        estado: formData.get("estado"),
        observaciones: formData.get("observaciones"),
      };
    }

    const parsed = createStreamingNodeSchema.safeParse(rawData);

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
        buildUrlFromRequest(
          request,
          "/configuracion/streaming/new?error=datos-invalidos"
        ),
        303
      );
    }

    const node = await createStreamingNode(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "STREAMING_NODE_CREATE",
      message: "Se creó un servidor de streaming",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: node._id,
      targetName: node.nombre,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: true, message: "Servidor creado correctamente", node },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/streaming?success=node-created"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear servidor";

    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/streaming/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getStreamingNodeByIdController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const node = await getStreamingNodeById(params.id);

    return NextResponse.json({ ok: true, node }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener servidor";

    return NextResponse.json({ ok: false, message }, { status: 404 });
  }
}

export async function updateStreamingNodeController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const formData = await request.formData();

    const rawData = {
      nombre: formData.get("nombre"),
      tipo: formData.get("tipo"),
      urlBase: formData.get("urlBase"),
      host: formData.get("host"),
      puerto: formData.get("puerto"),
      localidad: formData.get("localidad"),
      prioridad: formData.get("prioridad"),
      estado: formData.get("estado"),
      observaciones: formData.get("observaciones"),
    };

    const parsed = updateStreamingNodeSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        buildUrlFromRequest(
          request,
          `/configuracion/streaming/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const currentUser = await requireAdminFromRequest(request);
    const updatedNode = await updateStreamingNode(params.id, parsed.data);

    await createSystemLog({
      action: "STREAMING_NODE_UPDATE",
      message: "Se actualizó un servidor de streaming",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedNode._id,
      targetName: updatedNode.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/streaming?success=node-updated"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar servidor";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/streaming/${params.id}/edit?error=${encodeURIComponent(
          message
        )}`
      ),
      303
    );
  }
}

export async function toggleStreamingNodeStatusController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const currentUser = await requireAdminFromRequest(request);
    const updatedNode = await toggleStreamingNodeStatus(params.id);

    await createSystemLog({
      action: "STREAMING_NODE_STATUS_UPDATE",
      message: `Se cambió el estado del servidor a ${updatedNode.estado}`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedNode._id,
      targetName: updatedNode.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/streaming?success=status-updated"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar el estado";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/streaming?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}