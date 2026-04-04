import { NextResponse } from "next/server";
import { buildUrlFromRequest } from "@/lib/request-url";

export async function POST(request: Request) {
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