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

export async function loginUser(email: string, password: string) {
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Contraseña incorrecta");

  // 🔥 AGREGAR ACA
  console.log("[JWT SECRET LOGIN]", process.env.JWT_SECRET);

  const token = jwt.sign(
    {
      sub: user._id,
      email: user.email,
      rol: user.rol,
      localidad: user.localidad,
      mustChangePassword: user.mustChangePassword,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

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

export async function createInitialAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: "admin@wishnet.local" });

  if (existing) {
    return existing;
  }

  const hashedPassword = await bcrypt.hash("Admin123456!", 10);

  return User.create({
    nombre: "Administrador",
    email: "admin@wishnet.local",
    password: hashedPassword,
    rol: "admin",
    estado: "activo",
    localidad: "principal",
    conexionesPermitidas: 3,
    mustChangePassword: false,
    planId: null,
  });
}