import { NextResponse } from "next/server";
import {
  getAllStreamingNodes,
  createStreamingNode,
  getStreamingNodeById,
  updateStreamingNode,
  toggleStreamingNodeStatus,
} from "@/services/streaming.service";
import { refreshStreamingNodeHealthById } from "@/services/streaming-node-health.service";
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

function buildStreamingRawDataFromForm(formData: FormData) {
  const habilitadoRaw = String(formData.get("habilitado") ?? "false");

  return {
    nombre: String(formData.get("nombre") ?? ""),
    tipo: String(formData.get("tipo") ?? ""),
    urlBase: String(formData.get("urlBase") ?? ""),
    host: String(formData.get("host") ?? ""),
    puerto: String(formData.get("puerto") ?? ""),
    prioridad: String(formData.get("prioridad") ?? ""),
    estado: String(formData.get("estado") ?? ""),
    habilitado:
      habilitadoRaw === "true" ||
      habilitadoRaw === "on" ||
      habilitadoRaw === "1",
    healthCheckPath: String(formData.get("healthCheckPath") ?? ""),
    healthTimeoutMs: String(formData.get("healthTimeoutMs") ?? ""),
    observaciones: String(formData.get("observaciones") ?? ""),
  };
}

function getBackTarget(request: Request, id: string, success: string) {
  const referer = request.headers.get("referer") || "";

  if (referer.includes(`/configuracion/streaming/${id}/edit`)) {
    return `/configuracion/streaming/${id}/edit?success=${encodeURIComponent(
      success
    )}`;
  }

  return `/configuracion/streaming?success=${encodeURIComponent(success)}`;
}

function getBackErrorTarget(request: Request, id: string, error: string) {
  const referer = request.headers.get("referer") || "";

  if (referer.includes(`/configuracion/streaming/${id}/edit`)) {
    return `/configuracion/streaming/${id}/edit?error=${encodeURIComponent(
      error
    )}`;
  }

  return `/configuracion/streaming?error=${encodeURIComponent(error)}`;
}

export async function getStreamingNodesController(request: Request) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

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
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const contentType = request.headers.get("content-type") || "";
    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = buildStreamingRawDataFromForm(formData);
    }

    const parsed = createStreamingNodeSchema.safeParse(rawData);

    if (!parsed.success) {
      console.log("[STREAMING CREATE] validation error:", parsed.error.flatten());

      if (isJsonRequest(request)) {
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

    if (isJsonRequest(request)) {
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

    if (isJsonRequest(request)) {
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
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

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
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const contentType = request.headers.get("content-type") || "";
    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = buildStreamingRawDataFromForm(formData);
    }

    const parsed = updateStreamingNodeSchema.safeParse(rawData);

    if (!parsed.success) {
      if (isJsonRequest(request)) {
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
          `/configuracion/streaming/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const node = await updateStreamingNode(params.id, parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "STREAMING_NODE_UPDATE",
      message: "Se actualizó un servidor de streaming",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: node._id,
      targetName: node.nombre,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        { ok: true, message: "Servidor actualizado correctamente", node },
        { status: 200 }
      );
    }

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

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

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
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const node = await toggleStreamingNodeStatus(params.id);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "STREAMING_NODE_TOGGLE_STATUS",
      message: "Se cambió el estado de un servidor de streaming",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: node._id,
      targetName: node.nombre,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        { ok: true, message: "Estado actualizado correctamente", node },
        { status: 200 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        getBackTarget(request, params.id, "status-updated")
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar estado";

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        getBackErrorTarget(request, params.id, message)
      ),
      303
    );
  }
}

export async function refreshStreamingNodeHealthController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const node = await refreshStreamingNodeHealthById(params.id);

    if (isJsonRequest(request)) {
      return NextResponse.json(
        {
          ok: true,
          message: "Health check actualizado correctamente",
          node,
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        getBackTarget(request, params.id, "health-updated")
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al verificar el nodo";

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        getBackErrorTarget(request, params.id, message)
      ),
      303
    );
  }
}