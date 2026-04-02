import { NextRequest, NextResponse } from "next/server";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/api/users")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isLoginPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isProtected = isProtectedPath(pathname);
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthApi = pathname.startsWith("/api/auth");

  // Todo lo que no sea auth ni rutas protegidas, pasa
  if (!isProtected && !isLoginPage && !isChangePasswordPage && !isAuthApi) {
    return NextResponse.next();
  }

  // Sin token:
  // - login sí
  // - api/auth sí
  // - change-password no
  // - rutas protegidas no
  if (!token) {
    if (isLoginPage || isAuthApi) {
      return NextResponse.next();
    }

    if (isApiRoute) {
      return NextResponse.json(
        { ok: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Con token:
  // dejamos pasar.
  // La validación real de token/rol/estado se hace
  // en páginas server y controllers.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/api/users/:path*",
    "/login",
    "/change-password",
    "/api/auth/:path*",
  ],
};