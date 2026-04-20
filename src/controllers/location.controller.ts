import { NextResponse } from "next/server";
import {
  getAllLocations,
  createLocation,
  getLocationById,
  updateLocation,
  toggleLocationStatus,
} from "@/services/location.service";
import {
  createLocationSchema,
  updateLocationSchema,
} from "@/validations/location.validation";
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

function buildLocationRawDataFromForm(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    streamingNodeId: String(formData.get("streamingNodeId") ?? ""),
    fallbackStreamingNodeId: String(formData.get("fallbackStreamingNodeId") ?? ""),
    estado: String(formData.get("estado") ?? ""),
  };
}

function getBackTarget(request: Request, id: string, success: string) {
  const referer = request.headers.get("referer") || "";

  if (referer.includes(`/configuracion/localidades/${id}/edit`)) {
    return `/configuracion/localidades/${id}/edit?success=${encodeURIComponent(
      success
    )}`;
  }

  return `/configuracion/localidades?success=${encodeURIComponent(success)}`;
}

function getBackErrorTarget(request: Request, id: string, error: string) {
  const referer = request.headers.get("referer") || "";

  if (referer.includes(`/configuracion/localidades/${id}/edit`)) {
    return `/configuracion/localidades/${id}/edit?error=${encodeURIComponent(
      error
    )}`;
  }

  return `/configuracion/localidades?error=${encodeURIComponent(error)}`;
}

export async function getLocationsController(request: Request) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const locations = await getAllLocations();

    return NextResponse.json({ ok: true, locations }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener localidades";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function createLocationController(request: Request) {
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
      rawData = buildLocationRawDataFromForm(formData);
    }

    const parsed = createLocationSchema.safeParse(rawData);

    if (!parsed.success) {
      console.log("[LOCATION CREATE] validation error:", parsed.error.flatten());

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
          "/configuracion/localidades/new?error=datos-invalidos"
        ),
        303
      );
    }

    const location = await createLocation(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "LOCATION_CREATE",
      message: "Se creó una localidad",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: location._id,
      targetName: location.nombre,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        { ok: true, message: "Localidad creada correctamente", location },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/localidades?success=location-created"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear localidad";

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/localidades/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getLocationByIdController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const location = await getLocationById(params.id);

    return NextResponse.json({ ok: true, location }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener localidad";

    return NextResponse.json({ ok: false, message }, { status: 404 });
  }
}

export async function updateLocationController(
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
      rawData = buildLocationRawDataFromForm(formData);
    }

    const parsed = updateLocationSchema.safeParse(rawData);

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
          `/configuracion/localidades/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const location = await updateLocation(params.id, parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "LOCATION_UPDATE",
      message: "Se actualizó una localidad",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: location._id,
      targetName: location.nombre,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        { ok: true, message: "Localidad actualizada correctamente", location },
        { status: 200 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/localidades?success=location-updated"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar localidad";

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/localidades/${params.id}/edit?error=${encodeURIComponent(
          message
        )}`
      ),
      303
    );
  }
}

export async function toggleLocationStatusController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const location = await toggleLocationStatus(params.id);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "LOCATION_TOGGLE_STATUS",
      message: "Se cambió el estado de una localidad",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: location._id,
      targetName: location.nombre,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        { ok: true, message: "Estado actualizado correctamente", location },
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