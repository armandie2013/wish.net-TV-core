import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export type AuthTokenPayload = {
  sub: string;
  email: string;
  rol: string;
  localidad: string;
  mustChangePassword?: boolean;
  iat?: number;
  exp?: number;
};

export function verifyAuthToken(token: string) {
  try {
    // 🔥 AGREGAR ACA
    console.log("[JWT SECRET VERIFY]", process.env.JWT_SECRET);

    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error("[JWT VERIFY ERROR]", error);
    return null;
  }
}