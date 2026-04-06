import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import User from "@/models/User";
import "@/models/Plan";
import { connectDB } from "@/lib/db";
import { generateTemporaryPassword } from "@/lib/password";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from "@/validations/user.validation";


export async function getAllUsers() {
  await connectDB();

  const users = await User.find({})
    .populate("planId", "nombre")
    .select(
      "nombre email rol estado localidad conexionesPermitidas createdAt mustChangePassword planId"
    )
    .sort({ createdAt: -1 })
    .lean();

  return users.map((user: any) => ({
    ...user,
    _id: String(user._id),
    planId: user.planId
      ? {
          _id: String(user.planId._id),
          nombre: user.planId.nombre,
        }
      : null,
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

  const user = await User.create({
    nombre: data.nombre,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    rol: data.rol,
    estado: data.estado,
    localidad: data.localidad,
    conexionesPermitidas: data.conexionesPermitidas,
    mustChangePassword: true,
    planId: data.planId || null,
  });

  const populatedUser = await User.findById(user._id)
    .populate("planId", "nombre")
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
      planId: (populatedUser as any)!.planId
        ? {
            _id: String((populatedUser as any)!.planId._id),
            nombre: (populatedUser as any)!.planId.nombre,
          }
        : null,
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
    .select(
      "nombre email rol estado localidad conexionesPermitidas mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    ...(user as any),
    _id: String((user as any)._id),
    planId: (user as any).planId
      ? {
          _id: String((user as any).planId._id),
          nombre: (user as any).planId.nombre,
        }
      : null,
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

  const user = await User.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      email: data.email.toLowerCase(),
      rol: data.rol,
      estado: data.estado,
      localidad: data.localidad,
      conexionesPermitidas: data.conexionesPermitidas,
      planId: data.planId || null,
    },
    { new: true, runValidators: true }
  )
    .populate("planId", "nombre")
    .select(
      "nombre email rol estado localidad conexionesPermitidas mustChangePassword planId"
    )
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    ...(user as any),
    _id: String((user as any)._id),
    planId: (user as any).planId
      ? {
          _id: String((user as any).planId._id),
          nombre: (user as any).planId.nombre,
        }
      : null,
  };
}

export async function toggleUserStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de usuario inválido");
  }

  const user = await User.findById(id).populate("planId", "nombre");

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
    planId: user.planId
      ? {
          _id: String((user.planId as any)._id),
          nombre: (user.planId as any).nombre,
        }
      : null,
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