import { NextResponse } from "next/server";
import {
  getAllM3uSources,
  createM3uSource,
  getM3uSourceById,
  updateM3uSource,
  toggleM3uSourceStatus,
} from "@/services/m3u-source.service";
import {
  createM3uSourceSchema,
  updateM3uSourceSchema,
} from "@/validations/m3u-source.validation";
import { GuardError, requireAdminFromRequest } from "@/lib/auth-guards";
import { buildUrlFromRequest } from "@/lib/request-url";
import { createSystemLog } from "@/services/system-log.service";
import { importM3uSourceNow } from "@/services/m3u-import.service";

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

export async function getM3uSourcesController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const sources = await getAllM3uSources();

    return NextResponse.json({ ok: true, sources }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener fuentes";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function createM3uSourceController(request: Request) {
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
        descripcion: formData.get("descripcion"),
        tipoEntrada: formData.get("tipoEntrada"),
        urlFuente: formData.get("urlFuente"),
        estado: formData.get("estado"),
        prioridad: formData.get("prioridad"),
        localidad: formData.get("localidad"),
        importacionAutomatica: formData.get("importacionAutomatica") === "on",
        intervaloMinutos: formData.get("intervaloMinutos"),
      };
    }

    const parsed = createM3uSourceSchema.safeParse(rawData);

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
        buildUrlFromRequest(request, "/configuracion/m3u-sources/new?error=datos-invalidos"),
        303
      );
    }

    const source = await createM3uSource(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "M3U_SOURCE_CREATE",
      message: "Se creó una nueva fuente M3U",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: source._id,
      targetName: source.nombre,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: true, message: "Fuente creada correctamente", source },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/configuracion/m3u-sources?success=source-created"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear fuente";

    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/m3u-sources/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getM3uSourceByIdController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) return guardResponse;

    const source = await getM3uSourceById(params.id);

    return NextResponse.json({ ok: true, source }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener fuente";

    return NextResponse.json({ ok: false, message }, { status: 404 });
  }
}

export async function updateM3uSourceController(
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
      descripcion: formData.get("descripcion"),
      tipoEntrada: formData.get("tipoEntrada"),
      urlFuente: formData.get("urlFuente"),
      estado: formData.get("estado"),
      prioridad: formData.get("prioridad"),
      localidad: formData.get("localidad"),
      importacionAutomatica: formData.get("importacionAutomatica") === "on",
      intervaloMinutos: formData.get("intervaloMinutos"),
    };

    const parsed = updateM3uSourceSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        buildUrlFromRequest(
          request,
          `/configuracion/m3u-sources/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const currentUser = await requireAdminFromRequest(request);
    const updatedSource = await updateM3uSource(params.id, parsed.data);

    let importResult: Awaited<ReturnType<typeof importM3uSourceNow>> | null =
      null;

    if (updatedSource.estado === "activo") {
      importResult = await importM3uSourceNow(params.id);
    }

    await createSystemLog({
      action: "M3U_SOURCE_UPDATE",
      message: importResult
        ? `Se actualizó una fuente M3U y se sincronizó la base de canales (${importResult.created} nuevos, ${importResult.updated} actualizados, ${importResult.obsoleteSuspended} suspendidos)`
        : "Se actualizó una fuente M3U",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedSource._id,
      targetName: updatedSource.nombre,
      meta: importResult
        ? {
            totalDetected: importResult.totalDetected,
            created: importResult.created,
            updated: importResult.updated,
            skipped: importResult.skipped,
            obsoleteSuspended: importResult.obsoleteSuspended,
            plansSynced: importResult.plansSynced,
          }
        : undefined,
    });

    if (importResult) {
      return NextResponse.redirect(
        buildUrlFromRequest(
          request,
          `/configuracion/m3u-sources?success=import-completed&created=${importResult.created}&updated=${importResult.updated}&detected=${importResult.totalDetected}`
        ),
        303
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/m3u-sources?success=source-updated"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar fuente";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/m3u-sources/${params.id}/edit?error=${encodeURIComponent(
          message
        )}`
      ),
      303
    );
  }
}

export async function toggleM3uSourceStatusController(
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
    const updatedSource = await toggleM3uSourceStatus(params.id);

    await createSystemLog({
      action: "M3U_SOURCE_STATUS_UPDATE",
      message: `Se cambió el estado de la fuente a ${updatedSource.estado}`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedSource._id,
      targetName: updatedSource.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/configuracion/m3u-sources?success=status-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar el estado de la fuente";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/m3u-sources?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function importM3uSourceNowController(
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
    const result = await importM3uSourceNow(params.id);

    await createSystemLog({
      action: "M3U_SOURCE_IMPORT",
      message: `Se importó la fuente M3U (${result.created} nuevos, ${result.updated} actualizados)`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: result.source._id,
      targetName: result.source.nombre,
      meta: {
        totalDetected: result.totalDetected,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
      },
    });

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/m3u-sources?success=import-completed&created=${result.created}&updated=${result.updated}&detected=${result.totalDetected}`
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al importar la fuente";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/m3u-sources?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}