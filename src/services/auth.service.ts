import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { connectDB } from "../lib/db";
import type { LoginInput } from "../validations/auth.validation";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

export async function loginUser(data: LoginInput) {
  await connectDB();

  const user = await User.findOne({ email: data.email.toLowerCase() }).lean();

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  if (user.estado !== "activo") {
    throw new Error("Usuario suspendido");
  }

  const passwordOk = await bcrypt.compare(data.password, user.password);

  if (!passwordOk) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      rol: user.rol,
      localidad: user.localidad,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
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
  });
}