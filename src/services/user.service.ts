import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User from "@/models/User";
import LocationNode from "@/models/LocationNode";
import "@/models/Plan";
import "@/models/LocationNode";
import { connectDB } from "@/lib/db";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from "@/validations/user.validation";

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
      "nombre email rol estado localidad localidadId conexionesPermitidas createdAt mustChangePassword planId"
    )
    .sort({ createdAt: -1 })
    .lean();

  return users.map((user: any) => ({
    ...user,
    _id: String(user._id),
    planId: mapPlan(user.planId),
    localidadId: mapLocation(user.localidadId),
  }));
}

export async function createUser(data: CreateUserInput) {
  await connectDB();

  const existingUser = await User.findOne({
    email: data.email.toLowerCase(),
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
    email: data.email.toLowerCase(),
    password: hashedPassword,
    rol: data.rol,
    estado: data.estado,
    localidad: localidadNombre,
    localidadId: data.localidadId || null,
    conexionesPermitidas: data.conexionesPermitidas,
    mustChangePassword: true,
    planId: data.planId || null,
  });

  const populatedUser = await User.findById(user._id)
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .lean();

  return {
    user: {
      _id: String((populatedUser as any)!._id),
      nombre: (populatedUser as any)!.nombre,
      email: (populatedUser as any)!.email,
      rol: (populatedUser as any)!.rol,
      estado: (populatedUser as any)!.estado,
      localidad: (populatedUser as any)!.localidad,
      conexionesPermitidas: (populatedUser as any)!.conexionesPermitidas,
      mustChangePassword: (populatedUser as any)!.mustChangePassword,
      planId: mapPlan((populatedUser as any)!.planId),
      localidadId: mapLocation((populatedUser as any)!.localidadId),
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
      "nombre email rol estado localidad localidadId conexionesPermitidas mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    ...(user as any),
    _id: String((user as any)._id),
    planId: mapPlan((user as any).planId),
    localidadId: mapLocation((user as any).localidadId),
  };
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const existingUser = await User.findOne({
    email: data.email.toLowerCase(),
    _id: { $ne: id },
  });

  if (existingUser) {
    throw new Error("Ya existe otro usuario con ese email");
  }

  const localidadNombre = await resolveLocalidadNombre(
    data.localidadId,
    data.localidad
  );

  const user = await User.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      email: data.email.toLowerCase(),
      rol: data.rol,
      estado: data.estado,
      localidad: localidadNombre,
      localidadId: data.localidadId || null,
      conexionesPermitidas: data.conexionesPermitidas,
      planId: data.planId || null,
    },
    { new: true, runValidators: true }
  )
    .populate("planId", "nombre")
    .populate("localidadId", "nombre codigo estado")
    .select(
      "nombre email rol estado localidad localidadId conexionesPermitidas mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    ...(user as any),
    _id: String((user as any)._id),
    planId: mapPlan((user as any).planId),
    localidadId: mapLocation((user as any).localidadId),
  };
}

export async function toggleUserStatus(id: string) {
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

  user.estado = user.estado === "activo" ? "suspendido" : "activo";
  await user.save();

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    localidad: user.localidad,
    conexionesPermitidas: user.conexionesPermitidas,
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
    localidad: user.localidad,
  };
}

export async function resetUserPassword(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

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
    },
    temporaryPassword,
  };
}