import { NextResponse } from "next/server";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus,
  updateUserPassword,
  resetUserPassword,
} from "@/services/user.service";
import {
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
} from "@/validations/user.validation";
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

function buildUserRawDataFromForm(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    rol: String(formData.get("rol") ?? ""),
    estado: String(formData.get("estado") ?? ""),
    localidad: String(formData.get("localidad") ?? ""),
    localidadId: String(formData.get("localidadId") ?? ""),
    conexionesPermitidas: String(formData.get("conexionesPermitidas") ?? ""),
    planId: String(formData.get("planId") ?? ""),
  };
}

export async function getUsersController(request: Request) {
  try {
    const guardResponse = handleGuardError(
      request,
      await requireAdminFromRequest(request).catch((error) => error)
    );

    if (guardResponse) {
      return guardResponse;
    }

    const users = await getAllUsers();

    return NextResponse.json(
      {
        ok: true,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener usuarios";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function createUserController(request: Request) {
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
      rawData = buildUserRawDataFromForm(formData);
    }

    const parsed = createUserSchema.safeParse(rawData);

    if (!parsed.success) {
      console.log("[USER CREATE] validation error:", parsed.error.flatten());

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
        buildUrlFromRequest(request, "/users/new?error=datos-invalidos"),
        303
      );
    }

    const result = await createUser(parsed.data);

    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "USER_CREATE",
      message: `Se creó un nuevo usuario`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: result.user._id,
      targetName: result.user.nombre,
      targetEmail: result.user.email,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        {
          ok: true,
          message: "Usuario creado correctamente",
          user: result.user,
          temporaryPassword: result.temporaryPassword,
        },
        { status: 201 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/users?success=user-created&email=${encodeURIComponent(
          result.user.email
        )}&tempPassword=${encodeURIComponent(result.temporaryPassword)}`
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear usuario";

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
        `/users/new?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function getUserByIdController(
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

    const user = await getUserById(params.id);

    return NextResponse.json(
      {
        ok: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener usuario";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 404 }
    );
  }
}

export async function updateUserController(
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

    const contentType = request.headers.get("content-type") || "";

    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = buildUserRawDataFromForm(formData);
    }

    const parsed = updateUserSchema.safeParse(rawData);

    if (!parsed.success) {
      console.log("[USER UPDATE] validation error:", parsed.error.flatten());

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
          `/users/${params.id}/edit?error=datos-invalidos`
        ),
        303
      );
    }

    const user = await updateUser(params.id, parsed.data);

    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "USER_UPDATE",
      message: `Se actualizó un usuario`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: user._id,
      targetName: user.nombre,
      targetEmail: user.email,
    });

    if (contentType.includes("application/json")) {
      return NextResponse.json(
        {
          ok: true,
          message: "Usuario actualizado correctamente",
          user,
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(
      buildUrlFromRequest(request, `/users/${params.id}/edit?success=user-updated`),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar usuario";

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
        `/users/${params.id}/edit?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function toggleUserStatusController(
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

    const user = await toggleUserStatus(params.id);

    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "USER_TOGGLE_STATUS",
      message: `Se cambió el estado de un usuario`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: user._id,
      targetName: user.nombre,
      targetEmail: user.email,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(request, "/users?success=status-updated"),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar estado";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/users?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}

export async function updateUserPasswordController(
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

    const contentType = request.headers.get("content-type") || "";
    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = {
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      };
    }

    const parsed = updateUserPasswordSchema.safeParse(rawData);

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
          `/users/${params.id}/password?error=datos-invalidos`
        ),
        303
      );
    }

    const user = await updateUserPassword(params.id, parsed.data);

    return NextResponse.json(
      {
        ok: true,
        message: "Contraseña actualizada correctamente",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar contraseña";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function resetUserPasswordController(
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

    const result = await resetUserPassword(params.id);

    const currentUser = await requireAdminFromRequest(request);

    await createSystemLog({
      action: "USER_PASSWORD_RESET",
      message: `Se reseteó la contraseña de un usuario`,
      actorId: currentUser._id,
      actorName: currentUser.nombre,
      actorEmail: currentUser.email,
      targetId: result.user._id,
      targetName: result.user.nombre,
      targetEmail: result.user.email,
    });

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/users?success=password-reset&email=${encodeURIComponent(
          result.user.email
        )}&tempPassword=${encodeURIComponent(result.temporaryPassword)}`
      ),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al resetear contraseña";

    return NextResponse.redirect(
      buildUrlFromRequest(
        request,
        `/users?error=${encodeURIComponent(message)}`
      ),
      303
    );
  }
}