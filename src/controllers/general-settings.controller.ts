import { NextResponse } from "next/server";
import { GuardError, requireAdminFromRequest } from "@/lib/auth-guards";
import { buildUrlFromRequest } from "@/lib/request-url";
import { createSystemLog } from "@/services/system-log.service";
import {
  getGeneralSettings,
  updateGeneralSettings,
} from "@/services/general-settings.service";
import { updateGeneralSettingsSchema } from "@/validations/general-settings.validation";

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

function buildRawDataFromForm(formData: FormData) {
  return {
    nombreEmpresa: String(formData.get("nombreEmpresa") ?? ""),
  };
}

export async function getGeneralSettingsController(request: Request) {
  try {
    const guardResult = await requireAdminFromRequest(request).catch(
      (error) => error
    );
    const guardResponse = handleGuardError(request, guardResult);

    if (guardResponse) return guardResponse;

    const settings = await getGeneralSettings();

    return NextResponse.json({ ok: true, settings }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener la configuración general";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function updateGeneralSettingsController(request: Request) {
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
      rawData = buildRawDataFromForm(formData);
    }

    const parsed = updateGeneralSettingsSchema.safeParse(rawData);

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
          "/configuracion/general?error=datos-invalidos"
        ),
        303
      );
    }

    const settings = await updateGeneralSettings(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "GENERAL_SETTINGS_UPDATE",
      message: "Se actualizó la configuración general",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetName: settings.nombreEmpresa,
    });

    if (isJsonRequest(request)) {
      return NextResponse.json(
        {
          ok: true,
          message: "Configuración general actualizada correctamente",
          settings,
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        "/configuracion/general?success=general-settings-updated"
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar la configuración general";

    if (isJsonRequest(request)) {
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/configuracion/general?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}