import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}