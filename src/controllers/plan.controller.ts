import { NextResponse } from "next/server";
import {
  getAllPlans,
  createPlan,
  getPlanById,
  updatePlan,
  togglePlanStatus,
} from "@/services/plan.service";
import {
  createPlanSchema,
  updatePlanSchema,
} from "@/validations/plan.validation";
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

export async function getPlansController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const plans = await getAllPlans();

    return NextResponse.json(
      {
        ok: true,
        plans,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener planes";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function createPlanController(request: Request) {
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
  precio: formData.get("precio"),
  conexionesPermitidas: formData.get("conexionesPermitidas"),
  estado: formData.get("estado"),
  canalesPermitidos: formData.getAll("canalesPermitidos"),
};
    }

    const parsed = createPlanSchema.safeParse(rawData);

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
        buildUrlFromRequest(request, "/planes/new?error=datos-invalidos"),
        303
      );
    }

    const plan = await createPlan(parsed.data);
    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "PLAN_CREATE",
      message: "Se creó un nuevo plan",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: plan._id,
      targetName: plan.nombre,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        {
          ok: true,
          message: "Plan creado correctamente",
          plan,
        },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/planes?success=plan-created"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear plan";

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
        `/planes/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getPlanByIdController(
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

    const plan = await getPlanById(params.id);

    return NextResponse.json(
      {
        ok: true,
        plan,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener plan";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 404 }
    );
  }
}

export async function updatePlanController(
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
  precio: formData.get("precio"),
  conexionesPermitidas: formData.get("conexionesPermitidas"),
  estado: formData.get("estado"),
  canalesPermitidos: formData.getAll("canalesPermitidos"),
};

    const parsed = updatePlanSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        buildUrlFromRequest(
          request,
          `/planes/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const currentUser = await requireAdminFromRequest(request);
    const updatedPlan = await updatePlan(params.id, parsed.data);

    await createSystemLog({
      action: "PLAN_UPDATE",
      message: "Se actualizó un plan",
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedPlan._id,
      targetName: updatedPlan.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/planes?success=plan-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar plan";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/planes/${params.id}/edit?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function togglePlanStatusController(
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
    const updatedPlan = await togglePlanStatus(params.id);

    await createSystemLog({
      action: "PLAN_STATUS_UPDATE",
      message: `Se cambió el estado del plan a ${updatedPlan.estado}`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: updatedPlan._id,
      targetName: updatedPlan.nombre,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/planes?success=status-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar el estado del plan";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/planes?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}