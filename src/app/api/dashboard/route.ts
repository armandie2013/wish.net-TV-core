import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";
import { requireAdminFromRequest } from "@/lib/auth-guards";

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);

    const stats = await getDashboardStats();

    return NextResponse.json(
      {
        ok: true,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No autorizado";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 401 }
    );
  }
}