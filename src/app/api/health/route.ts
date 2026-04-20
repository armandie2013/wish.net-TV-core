import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const nodeType = process.env.NODE_TYPE || "backend";
    const nodeName = process.env.NODE_NAME || "wish.net-TV-core";
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || "";

    return NextResponse.json({
      ok: true,
      nodeType,
      nodeName,
      publicBaseUrl,
      timestamp: new Date().toISOString(),
      message: "Servicio operativo",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo conectar a MongoDB";

    return NextResponse.json(
      {
        ok: false,
        nodeType: process.env.NODE_TYPE || "backend",
        nodeName: process.env.NODE_NAME || "wish.net-TV-core",
        timestamp: new Date().toISOString(),
        message,
      },
      { status: 500 }
    );
  }
}