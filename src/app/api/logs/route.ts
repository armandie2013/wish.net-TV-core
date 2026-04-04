import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth-guards";
import { getRecentSystemLogs } from "@/services/system-log.service";

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);

    const logs = await getRecentSystemLogs(50);

    return NextResponse.json(
      {
        ok: true,
        logs,
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