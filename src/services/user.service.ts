import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User from "@/models/User";
import LocationNode from "@/models/LocationNode";
import "@/models/Plan";
import "@/models/LocationNode";
import { connectDB } from "@/lib/db";
import {
  normalizeTokenExpiresIn,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateUserPasswordInput,
} from "@/validations/user.validation";
import {
  isProtectedAdminEmail,
  normalizeEmail,
} from "@/services/auth.service";
import type { CurrentUser } from "@/lib/auth-guards";

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-8);
}

function mapLocation(location: any) {
  if (!location) return null;

  return {
    _id: String(location._id),
    nombre: location.nombre,
    codigo: location.codigo,
    estado: location.estado,
  };
}

function mapPlan(plan: any) {
  if (!plan) return null;

  return {
    _id: String(plan._id),
    nombre: plan.nombre,
  };
}

function isProtectedUser(user: any) {
  return Boolean(user?.isProtected) || isProtectedAdminEmail(user?.email);
}

function isProtectedActor(actor?: CurrentUser | null) {
  return Boolean(actor?.isProtected) || isProtectedAdminEmail(actor?.email);
}

function isSameUser(actor: CurrentUser | undefined | null, user: any) {
  if (!actor || !user) return false;

  return String(actor._id) === String(user._id);
}

function ensureCanEditUser(actor: CurrentUser, targetUser: any) {
  if (!targetUser) {
    throw new Error("Usuario no encontrado");
  }

  if (isProtectedUser(targetUser) && !isProtectedActor(actor)) {
    throw new Error(
      "No tenés permisos para modificar un administrador protegido"
    );
  }
}

function ensureCanToggleUser(actor: CurrentUser, targetUser: any) {
  if (!targetUser) {
    throw new Error("Usuario no encontrado");
  }

  if (isProtectedUser(targetUser)) {
    throw new Error("No se puede suspender o activar un administrador protegido");
  }

  if (isSameUser(actor, targetUser)) {
    throw new Error("No podés suspender tu propia cuenta");
  }
}

function ensureCanResetPassword(actor: CurrentUser, targetUser: any) {
  if (!targetUser) {
    throw new Error("Usuario no encontrado");
  }

  if (isSameUser(actor, targetUser)) {
    throw new Error(
      "No podés restablecer tu propia contraseña desde el CRUD de usuarios"
    );
  }

  if (isProtectedUser(targetUser) && !isProtectedActor(actor)) {
    throw new Error(
      "Solo un administrador protegido puede restablecer la contraseña de otro administrador protegido"
    );
  }
}

function ensureCanDeleteUser(actor: CurrentUser, targetUser: any) {
  if (!targetUser) {
    throw new Error("Usuario no encontrado");
  }

  if (isProtectedUser(targetUser)) {
    throw new Error("No se puede borrar un administrador protegido");
  }

  if (isSameUser(actor, targetUser)) {
    throw new Error("No podés borrar tu propia cuenta");
  }
}

function mapUser(user: any) {
  return {
    ...user,
    _id: String(user._id),
    tokenExpiresIn: normalizeTokenExpiresIn(user.tokenExpiresIn, user.rol),
    isProtected: Boolean(user.isProtected) || isProtectedAdminEmail(user.email),
    planId: mapPlan(user.planId),
    localidadId: mapLocation(user.localidadId),
  };
}

async function resolveLocalidadNombre(
  localidadId?: string,
  localidadTexto?: string
) {
  if (localidadId && Types.ObjectId.isValid(localidadId)) {
    const location = await LocationNode.findById(localidadId)
      .select("nombre")
      .lean();

    if (location) {
      return location.nombre;
    }
  }

  return (localidadTexto || "").trim();
}

export async function getAllUsers() {
  await connectDB();

  const users = await User.find({})
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .select(
      "nombre email rol estado isProtected localidad localidadId conexionesPermitidas tokenExpiresIn createdAt mustChangePassword planId"
    )
    .sort({ createdAt: -1 })
    .lean();

  return users.map(mapUser);
}

export async function createUser(data: CreateUserInput) {
  await connectDB();

  const email = normalizeEmail(data.email);

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("Ya existe un usuario con ese email");
  }

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const localidadNombre = await resolveLocalidadNombre(
    data.localidadId,
    data.localidad
  );

  const user = await User.create({
    nombre: data.nombre,
    email,
    password: hashedPassword,
    rol: data.rol,
    estado: data.estado,
    isProtected: false,
    localidad: localidadNombre,
    localidadId: data.localidadId || null,
    conexionesPermitidas: data.conexionesPermitidas,
    tokenExpiresIn: normalizeTokenExpiresIn(data.tokenExpiresIn, data.rol),
    mustChangePassword: true,
    planId: data.planId || null,
  });

  const populatedUser = await User.findById(user._id)
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .lean();

  const mappedUser = mapUser(populatedUser);

  return {
    user: {
      _id: mappedUser._id,
      nombre: mappedUser.nombre,
      email: mappedUser.email,
      rol: mappedUser.rol,
      estado: mappedUser.estado,
      localidad: mappedUser.localidad,
      conexionesPermitidas: mappedUser.conexionesPermitidas,
      tokenExpiresIn: mappedUser.tokenExpiresIn,
      mustChangePassword: mappedUser.mustChangePassword,
      isProtected: mappedUser.isProtected,
      planId: mappedUser.planId,
      localidadId: mappedUser.localidadId,
    },
    temporaryPassword,
  };
}

export async function getUserById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id)
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .select(
      "nombre email rol estado isProtected localidad localidadId conexionesPermitidas tokenExpiresIn mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return mapUser(user);
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  actor: CurrentUser
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const targetUser = await User.findById(id);

  if (!targetUser) {
    throw new Error("Usuario no encontrado");
  }

  ensureCanEditUser(actor, targetUser);

  const targetIsProtected = isProtectedUser(targetUser);

  const nextEmail = targetIsProtected
    ? targetUser.email
    : normalizeEmail(data.email);

  const existingUser = await User.findOne({
    email: nextEmail,
    _id: { $ne: id },
  });

  if (existingUser) {
    throw new Error("Ya existe otro usuario con ese email");
  }

  const localidadNombre = await resolveLocalidadNombre(
    data.localidadId,
    data.localidad
  );

  const updatePayload = {
    nombre: data.nombre,
    email: nextEmail,
    rol: targetIsProtected ? "admin" : data.rol,
    estado: targetIsProtected ? "activo" : data.estado,
    isProtected: targetIsProtected ? true : Boolean(targetUser.isProtected),
    localidad: localidadNombre,
    localidadId: data.localidadId || null,
    conexionesPermitidas: data.conexionesPermitidas,
    tokenExpiresIn: normalizeTokenExpiresIn(
      data.tokenExpiresIn,
      targetIsProtected ? "admin" : data.rol
    ),
    planId: data.planId || null,
  };

  const user = await User.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .select(
      "nombre email rol estado isProtected localidad localidadId conexionesPermitidas tokenExpiresIn mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return mapUser(user);
}

export async function toggleUserStatus(id: string, actor: CurrentUser) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id)
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado");

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  ensureCanToggleUser(actor, user);

  user.estado = user.estado === "activo" ? "suspendido" : "activo";
  await user.save();

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    isProtected: isProtectedUser(user),
    localidad: user.localidad,
    conexionesPermitidas: user.conexionesPermitidas,
    tokenExpiresIn: normalizeTokenExpiresIn(user.tokenExpiresIn, user.rol),
    mustChangePassword: user.mustChangePassword,
    planId: mapPlan(user.planId),
    localidadId: mapLocation(user.localidadId),
  };
}

export async function updateUserPassword(
  id: string,
  data: UpdateUserPasswordInput
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  user.password = hashedPassword;
  user.mustChangePassword = false;
  await user.save();

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    isProtected: isProtectedUser(user),
    localidad: user.localidad,
  };
}

export async function resetUserPassword(id: string, actor: CurrentUser) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  ensureCanResetPassword(actor, user);

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  user.password = hashedPassword;
  user.mustChangePassword = true;
  await user.save();

  return {
    user: {
      _id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      isProtected: isProtectedUser(user),
    },
    temporaryPassword,
  };
}

export async function deleteUser(id: string, actor: CurrentUser) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  ensureCanDeleteUser(actor, user);

  await User.findByIdAndDelete(user._id);

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    isProtected: isProtectedUser(user),
  };
}