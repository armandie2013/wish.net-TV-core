import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import StreamingNode from "@/models/StreamingNode";

type NodeLike = {
  _id: any;
  nombre: string;
  codigo?: string;
  tipo: "origin" | "edge";
  urlBase: string;
  estado: "activo" | "suspendido";
  habilitado?: boolean;
  healthCheckPath?: string;
  healthTimeoutMs?: number;
  healthStatus?: "unknown" | "online" | "offline";
  lastCheckAt?: Date | string | null;
  lastSeenAt?: Date | string | null;
  failureCount?: number;
  lastError?: string;
  prioridad?: number;
};

function normalizeBaseUrl(urlBase: string) {
  return urlBase.replace(/\/+$/, "");
}

function normalizeHealthPath(path?: string) {
  const value = (path || "/health").trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function buildHealthUrl(node: NodeLike) {
  const path = normalizeHealthPath(node.healthCheckPath);

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${normalizeBaseUrl(node.urlBase)}${path}`;
}

function isFresh(lastCheckAt: Date | string | null | undefined, ttlMs: number) {
  if (!lastCheckAt) return false;

  const value = new Date(lastCheckAt).getTime();
  if (Number.isNaN(value)) return false;

  return Date.now() - value <= ttlMs;
}

export async function checkStreamingNodeHealth(node: NodeLike) {
  const timeoutMs = Number(node.healthTimeoutMs || 2500);
  const healthUrl = buildHealthUrl(node);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    let body: any = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const ok = response.ok && (body?.ok !== false);

    return {
      ok,
      checkedUrl: healthUrl,
      error: ok
        ? ""
        : body?.message || `El nodo respondió con estado ${response.status}`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo verificar el nodo";

    return {
      ok: false,
      checkedUrl: healthUrl,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshStreamingNodeHealthById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de nodo inválido");
  }

  const node = await StreamingNode.findById(id);

  if (!node) {
    throw new Error("Nodo no encontrado");
  }

  if (node.estado !== "activo" || !node.habilitado) {
    node.healthStatus = "offline";
    node.lastCheckAt = new Date();
    node.lastError =
      node.estado !== "activo"
        ? "Nodo suspendido"
        : "Nodo deshabilitado manualmente";
    await node.save();

    return node.toObject();
  }

  const probe = await checkStreamingNodeHealth(node.toObject() as any);

  node.lastCheckAt = new Date();

  if (probe.ok) {
    node.healthStatus = "online";
    node.lastSeenAt = new Date();
    node.failureCount = 0;
    node.lastError = "";
  } else {
    node.healthStatus = "offline";
    node.failureCount = Number(node.failureCount || 0) + 1;
    node.lastError = probe.error;
  }

  await node.save();

  return node.toObject();
}

export async function getFreshStreamingNodeState(
  node: NodeLike | null,
  ttlMs = 30000
) {
  if (!node) return null;

  if (node.estado !== "activo" || node.habilitado === false) {
    return {
      ...node,
      healthStatus: "offline" as const,
    };
  }

  if (isFresh(node.lastCheckAt, ttlMs)) {
    return node;
  }

  const refreshed = await refreshStreamingNodeHealthById(String(node._id));
  return refreshed as any;
}

export async function getHealthyOriginNode(ttlMs = 30000) {
  await connectDB();

  const origins = await StreamingNode.find({
    tipo: "origin",
    estado: "activo",
    habilitado: true,
  })
    .sort({ prioridad: 1, createdAt: 1 })
    .lean();

  for (const origin of origins) {
    const fresh = await getFreshStreamingNodeState(origin as any, ttlMs);

    if (fresh && fresh.healthStatus === "online") {
      return fresh;
    }
  }

  return null;
}