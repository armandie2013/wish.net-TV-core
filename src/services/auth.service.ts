import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import type { LoginInput } from "@/validations/auth.validation";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export async function loginUser({ email, password }: LoginInput) {
  await connectDB();

  console.log("=== LOGIN ATTEMPT ===");
  console.log("[LOGIN] email ingresado:", email);
  console.log("[LOGIN] password ingresada:", password);

  const user = await User.findOne({ email });

  console.log("[LOGIN] user encontrado:", Boolean(user));

  if (!user) throw new Error("Usuario no encontrado");

  console.log("[LOGIN] password en DB:", user.password);

  const match = await bcrypt.compare(password, user.password);

  console.log("[LOGIN] password match:", match);

  if (!match) throw new Error("Contraseña incorrecta");

  console.log("[JWT SECRET LOGIN]", process.env.JWT_SECRET);

  const token = jwt.sign(
    {
      sub: user._id,
      email: user.email,
      rol: user.rol,
      localidad: user.localidad,
      mustChangePassword: user.mustChangePassword,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  console.log("[LOGIN] token generado:", token.slice(0, 30) + "...");

  return {
    ok: true,
    token,
    mustChangePassword: user.mustChangePassword,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
      localidad: user.localidad,
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
};

export async function createInitialAdmin(options: CreateAdminOptions = {}) {
  await connectDB();

  const nombre = (options.nombre || "Administrador").trim();
  const email = (options.email || "admin@wishnet.local").trim().toLowerCase();
  const password = options.password || "Admin123456!";
  const localidad = (options.localidad || "principal").trim();
  const conexionesPermitidas =
    Number(options.conexionesPermitidas || 3) > 0
      ? Number(options.conexionesPermitidas || 3)
      : 3;
  const mustChangePassword = Boolean(options.mustChangePassword ?? false);

  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`[ADMIN] ya existe un usuario con email ${email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`[ADMIN] creando admin ${email}`);
  console.log(`[ADMIN] password inicial: ${password}`);

  return User.create({
    nombre,
    email,
    password: hashedPassword,
    rol: "admin",
    estado: "activo",
    localidad,
    localidadId: null,
    conexionesPermitidas,
    mustChangePassword,
    planId: null,
  });
}