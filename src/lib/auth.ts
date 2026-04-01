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
  iat?: number;
  exp?: number;
};

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}