import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import type { LoginInput } from "@/validations/auth.validation";
import {
  normalizeTokenExpiresIn,
  tokenExpiresInToSeconds,
} from "@/validations/user.validation";

export const PROTECTED_ADMIN_EMAILS = [
  "admin@wishnet.local",
  "armandie2018@gmail.com",
];

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export function normalizeEmail(email?: string | null) {
  return String(email || "").trim().toLowerCase();
}

export function isProtectedAdminEmail(email?: string | null) {
  return PROTECTED_ADMIN_EMAILS.includes(normalizeEmail(email));
}

export async function loginUser({ email, password }: LoginInput) {
  await connectDB();

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error("Usuario no encontrado");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Contraseña incorrecta");

  const tokenExpiresIn = normalizeTokenExpiresIn(
    user.tokenExpiresIn,
    user.rol
  );

  const tokenOptions: SignOptions = {
    expiresIn: tokenExpiresIn as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      rol: user.rol,
      localidad: user.localidad,
      mustChangePassword: user.mustChangePassword,
      isProtected: Boolean(user.isProtected),
    },
    JWT_SECRET,
    tokenOptions
  );

  return {
    ok: true,
    token,
    tokenExpiresIn,
    tokenMaxAgeSeconds: tokenExpiresInToSeconds(tokenExpiresIn),
    mustChangePassword: user.mustChangePassword,
    user: {
      id: String(user._id),
      _id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
      localidad: user.localidad,
      tokenExpiresIn,
      isProtected: Boolean(user.isProtected),
    },
  };
}

type CreateAdminOptions = {
  nombre?: string;
  email?: string;
  password?: string;
  localidad?: string;
  conexionesPermitidas?: number;
  mustChangePassword?: boolean;
  isProtected?: boolean;
};

export async function createInitialAdmin(options: CreateAdminOptions = {}) {
  await connectDB();

  const nombre = (options.nombre || "Administrador").trim();
  const email = normalizeEmail(options.email || "admin@wishnet.local");
  const password = options.password || "Admin123456!";
  const localidad = (options.localidad || "principal").trim();
  const conexionesPermitidas =
    Number(options.conexionesPermitidas || 3) > 0
      ? Number(options.conexionesPermitidas || 3)
      : 3;
  const mustChangePassword = Boolean(options.mustChangePassword ?? false);
  const isProtected =
    typeof options.isProtected === "boolean"
      ? options.isProtected
      : isProtectedAdminEmail(email);

  const existing = await User.findOne({ email });

  if (existing) {
    let changed = false;

    if (isProtected && !existing.isProtected) {
      existing.isProtected = true;
      changed = true;
    }

    if (isProtected && existing.rol !== "admin") {
      existing.rol = "admin";
      changed = true;
    }

    if (isProtected && existing.estado !== "activo") {
      existing.estado = "activo";
      changed = true;
    }

    if (changed) {
      await existing.save();
    }

    console.log(`[ADMIN] ya existe un usuario con email ${email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`[ADMIN] creando admin ${email}`);

  return User.create({
    nombre,
    email,
    password: hashedPassword,
    rol: "admin",
    estado: "activo",
    isProtected,
    localidad,
    localidadId: null,
    conexionesPermitidas,
    tokenExpiresIn: "8h",
    mustChangePassword,
    planId: null,
  });
}