import { NextResponse } from "next/server";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus,
  updateUserPassword,
} from "@/services/user.service";
import {
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
} from "@/validations/user.validation";

export async function getUsersController() {
  try {
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
    const contentType = request.headers.get("content-type") || "";

    let rawData: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();

      rawData = {
        nombre: formData.get("nombre"),
        email: formData.get("email"),
        rol: formData.get("rol"),
        estado: formData.get("estado"),
        localidad: formData.get("localidad"),
        conexionesPermitidas: formData.get("conexionesPermitidas"),
      };
    }

    const parsed = createUserSchema.safeParse(rawData);

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
        new URL("/users/new?error=datos-invalidos", request.url),
        303
      );
    }

    const result = await createUser(parsed.data);

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
      new URL(
        `/users?success=user-created&email=${encodeURIComponent(
          result.user.email
        )}&tempPassword=${encodeURIComponent(result.temporaryPassword)}`,
        request.url
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
      new URL(`/users/new?error=${encodeURIComponent(message)}`, request.url),
      303
    );
  }
}

export async function getUserByIdController(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const formData = await request.formData();

    const rawData = {
      nombre: formData.get("nombre"),
      email: formData.get("email"),
      rol: formData.get("rol"),
      estado: formData.get("estado"),
      localidad: formData.get("localidad"),
      conexionesPermitidas: formData.get("conexionesPermitidas"),
    };

    const parsed = updateUserSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        new URL(`/users/${params.id}/edit?error=datos-invalidos`, request.url),
        303
      );
    }

    await updateUser(params.id, parsed.data);

    return NextResponse.redirect(
      new URL("/users?success=user-updated", request.url),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar usuario";

    return NextResponse.redirect(
      new URL(
        `/users/${params.id}/edit?error=${encodeURIComponent(message)}`,
        request.url
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
    await toggleUserStatus(params.id);

    return NextResponse.redirect(
      new URL("/users?success=status-updated", request.url),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cambiar el estado";

    return NextResponse.redirect(
      new URL(`/users?error=${encodeURIComponent(message)}`, request.url),
      303
    );
  }
}

export async function updateUserPasswordController(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();

    const rawData = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = updateUserPasswordSchema.safeParse(rawData);

    if (!parsed.success) {
      return NextResponse.redirect(
        new URL(
          `/users/${params.id}/password?error=datos-invalidos`,
          request.url
        ),
        303
      );
    }

    await updateUserPassword(params.id, parsed.data);

    return NextResponse.redirect(
      new URL("/users?success=password-updated", request.url),
      303
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar contraseña";

    return NextResponse.redirect(
      new URL(
        `/users/${params.id}/password?error=${encodeURIComponent(message)}`,
        request.url
      ),
      303
    );
  }
}