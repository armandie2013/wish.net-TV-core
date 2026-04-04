import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export type CurrentUser = {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  mustChangePassword: boolean;
  localidad?: string;
  conexionesPermitidas?: number;
};

export class GuardError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "PASSWORD_CHANGE_REQUIRED";

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN" | "PASSWORD_CHANGE_REQUIRED") {
    super(code);
    this.code = code;
  }
}

function getTokenFromCookieHeader(cookieHeader: string) {
  const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function getAuthenticatedUserFromRequest(
  request: Request
): Promise<CurrentUser | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getTokenFromCookieHeader(cookieHeader);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload?.sub) {
    return null;
  }

  await connectDB();

  const user = await User.findById(payload.sub)
    .select(
      "nombre email rol estado localidad conexionesPermitidas mustChangePassword"
    )
    .lean();

  if (!user) {
    return null;
  }

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    localidad: user.localidad,
    conexionesPermitidas: user.conexionesPermitidas,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function requireAdminFromRequest(request: Request) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    throw new GuardError("UNAUTHORIZED");
  }

  if (user.estado !== "activo") {
    throw new GuardError("FORBIDDEN");
  }

  if (user.mustChangePassword) {
    throw new GuardError("PASSWORD_CHANGE_REQUIRED");
  }

  if (user.rol !== "admin") {
    throw new GuardError("FORBIDDEN");
  }

  return user;
}

export async function requireAdminPageAccess() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  if (!payload?.sub) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(payload.sub)
    .select(
      "nombre email rol estado localidad conexionesPermitidas mustChangePassword"
    )
    .lean();

  if (!user) {
    redirect("/login");
  }

  if (user.estado !== "activo") {
    redirect("/login?error=usuario-suspendido");
  }

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  if (user.rol !== "admin") {
    redirect("/dashboard");
  }

  return {
    _id: String(user._id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    estado: user.estado,
    localidad: user.localidad,
    conexionesPermitidas: user.conexionesPermitidas,
    mustChangePassword: user.mustChangePassword,
  };
}