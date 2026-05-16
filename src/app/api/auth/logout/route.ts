import { NextResponse } from "next/server";
import { buildUrlFromRequest } from "@/lib/request-url";
import { verifyAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteActiveConnectionsByUser } from "@/services/active-connection.service";

function getAuthTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);

  return tokenMatch?.[1] ? decodeURIComponent(tokenMatch[1]) : null;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const token = getAuthTokenFromRequest(request);

    if (token) {
      const payload = verifyAuthToken(token);

      if (payload?.sub) {
        await deleteActiveConnectionsByUser(payload.sub);
      }
    }
  } catch (error) {
    console.error("[LOGOUT_CLEANUP_ERROR]", error);
  }

  const response = NextResponse.redirect(
    buildUrlFromRequest(request, "/login"),
    303
  );

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}