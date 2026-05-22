// import { Types } from "mongoose";
// import { connectDB } from "@/lib/db";
// import StreamingNode from "@/models/StreamingNode";

// type NodeLike = {
//   _id: any;
//   nombre: string;
//   codigo?: string;
//   tipo: "origin" | "edge";
//   urlBase: string;
//   estado: "activo" | "suspendido";
//   habilitado?: boolean;
//   healthCheckPath?: string;
//   healthTimeoutMs?: number;
//   healthStatus?: "unknown" | "online" | "offline";
//   lastCheckAt?: Date | string | null;
//   lastSeenAt?: Date | string | null;
//   failureCount?: number;
//   lastError?: string;
//   prioridad?: number;
// };

// function normalizeBaseUrl(urlBase: string) {
//   return urlBase.replace(/\/+$/, "");
// }

// function normalizeHealthPath(path?: string) {
//   const value = (path || "/health").trim();

//   if (value.startsWith("http://") || value.startsWith("https://")) {
//     return value;
//   }

//   return value.startsWith("/") ? value : `/${value}`;
// }

// function buildHealthUrl(node: NodeLike) {
//   const path = normalizeHealthPath(node.healthCheckPath);

//   if (path.startsWith("http://") || path.startsWith("https://")) {
//     return path;
//   }

//   return `${normalizeBaseUrl(node.urlBase)}${path}`;
// }

// function isFresh(lastCheckAt: Date | string | null | undefined, ttlMs: number) {
//   if (!lastCheckAt) return false;

//   const value = new Date(lastCheckAt).getTime();
//   if (Number.isNaN(value)) return false;

//   return Date.now() - value <= ttlMs;
// }

// export async function checkStreamingNodeHealth(node: NodeLike) {
//   const timeoutMs = Number(node.healthTimeoutMs || 2500);
//   const healthUrl = buildHealthUrl(node);
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const response = await fetch(healthUrl, {
//       method: "GET",
//       cache: "no-store",
//       signal: controller.signal,
//       headers: {
//         Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
//       },
//     });

//     let body: any = null;
//     try {
//       body = await response.json();
//     } catch {
//       body = null;
//     }

//     const ok = response.ok && (body?.ok !== false);

//     return {
//       ok,
//       checkedUrl: healthUrl,
//       error: ok
//         ? ""
//         : body?.message || `El nodo respondió con estado ${response.status}`,
//     };
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "No se pudo verificar el nodo";

//     return {
//       ok: false,
//       checkedUrl: healthUrl,
//       error: message,
//     };
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// export async function refreshStreamingNodeHealthById(id: string) {
//   await connectDB();

//   if (!Types.ObjectId.isValid(id)) {
//     throw new Error("ID de nodo inválido");
//   }

//   const node = await StreamingNode.findById(id);

//   if (!node) {
//     throw new Error("Nodo no encontrado");
//   }

//   if (node.estado !== "activo" || !node.habilitado) {
//     node.healthStatus = "offline";
//     node.lastCheckAt = new Date();
//     node.lastError =
//       node.estado !== "activo"
//         ? "Nodo suspendido"
//         : "Nodo deshabilitado manualmente";
//     await node.save();

//     return node.toObject();
//   }

//   const probe = await checkStreamingNodeHealth(node.toObject() as any);

//   node.lastCheckAt = new Date();

//   if (probe.ok) {
//     node.healthStatus = "online";
//     node.lastSeenAt = new Date();
//     node.failureCount = 0;
//     node.lastError = "";
//   } else {
//     node.healthStatus = "offline";
//     node.failureCount = Number(node.failureCount || 0) + 1;
//     node.lastError = probe.error;
//   }

//   await node.save();

//   return node.toObject();
// }

// export async function getFreshStreamingNodeState(
//   node: NodeLike | null,
//   ttlMs = 30000
// ) {
//   if (!node) return null;

//   if (node.estado !== "activo" || node.habilitado === false) {
//     return {
//       ...node,
//       healthStatus: "offline" as const,
//     };
//   }

//   if (isFresh(node.lastCheckAt, ttlMs)) {
//     return node;
//   }

//   const refreshed = await refreshStreamingNodeHealthById(String(node._id));
//   return refreshed as any;
// }

// export async function getHealthyOriginNode(ttlMs = 30000) {
//   await connectDB();

//   const origins = await StreamingNode.find({
//     tipo: "origin",
//     estado: "activo",
//     habilitado: true,
//   })
//     .sort({ prioridad: 1, createdAt: 1 })
//     .lean();

//   for (const origin of origins) {
//     const fresh = await getFreshStreamingNodeState(origin as any, ttlMs);

//     if (fresh && fresh.healthStatus === "online") {
//       return fresh;
//     }
//   }

//   return null;
// }

import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import StreamingNode from "@/models/StreamingNode";

type HealthStatus = "unknown" | "online" | "offline";

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
  healthStatus?: HealthStatus;
  lastCheckAt?: Date | string | null;
  lastSeenAt?: Date | string | null;
  failureCount?: number;
  lastError?: string;
  prioridad?: number;
};

type RefreshAllOptions = {
  includeSuspended?: boolean;
  batchSize?: number;
};

function normalizeBaseUrl(urlBase: string) {
  return String(urlBase || "").replace(/\/+$/, "");
}

function normalizeHealthPath(path?: string) {
  const value = String(path || "/health").trim();

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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "Timeout verificando health";
    }

    return error.message;
  }

  return "No se pudo verificar el nodo";
}

function mapNodeHealth(node: any) {
  return {
    _id: String(node._id),
    nombre: node.nombre,
    codigo: node.codigo,
    tipo: node.tipo,
    urlBase: node.urlBase,
    estado: node.estado,
    habilitado: Boolean(node.habilitado),
    healthCheckPath: node.healthCheckPath || "/health",
    healthStatus: node.healthStatus || "unknown",
    healthTimeoutMs: node.healthTimeoutMs || 2500,
    lastCheckAt: node.lastCheckAt || null,
    lastSeenAt: node.lastSeenAt || null,
    failureCount: Number(node.failureCount || 0),
    lastError: node.lastError || "",
  };
}

export async function checkStreamingNodeHealth(node: NodeLike) {
  const timeoutMs = Math.max(Number(node.healthTimeoutMs || 2500), 500);
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

    const rawText = await response.text();

    let body: any = null;

    try {
      body = rawText ? JSON.parse(rawText) : null;
    } catch {
      body = null;
    }

    const ok = response.ok && body?.ok !== false;

    return {
      ok,
      checkedUrl: healthUrl,
      statusCode: response.status,
      error: ok
        ? ""
        : body?.message ||
          body?.error ||
          rawText.slice(0, 180) ||
          `El nodo respondió con estado ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      checkedUrl: healthUrl,
      statusCode: 0,
      error: getErrorMessage(error),
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

    return mapNodeHealth(node.toObject());
  }

  const probe = await checkStreamingNodeHealth(node.toObject() as NodeLike);

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

  return mapNodeHealth(node.toObject());
}

export async function refreshAllStreamingNodesHealth(
  options: RefreshAllOptions = {}
) {
  await connectDB();

  const includeSuspended = Boolean(options.includeSuspended);
  const batchSize = Math.max(Number(options.batchSize || 4), 1);

  const query = includeSuspended
    ? {}
    : {
        estado: "activo",
        habilitado: true,
      };

  const nodes = await StreamingNode.find(query)
    .sort({ tipo: 1, prioridad: 1, createdAt: 1 })
    .lean();

  const startedAt = new Date();

  const summary = {
    startedAt,
    finishedAt: null as Date | null,
    total: nodes.length,
    checked: 0,
    online: 0,
    offline: 0,
    unknown: 0,
    errors: 0,
    results: [] as Array<{
      _id: string;
      nombre: string;
      codigo: string;
      tipo: string;
      healthStatus: HealthStatus;
      lastError: string;
    }>,
  };

  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((node: any) => refreshStreamingNodeHealthById(String(node._id)))
    );

    for (const result of batchResults) {
      summary.checked += 1;

      if (result.status === "fulfilled") {
        const node = result.value;
        const status = String(node.healthStatus || "unknown") as HealthStatus;

        if (status === "online") summary.online += 1;
        else if (status === "offline") summary.offline += 1;
        else summary.unknown += 1;

        summary.results.push({
          _id: String(node._id),
          nombre: node.nombre,
          codigo: node.codigo || "",
          tipo: node.tipo || "",
          healthStatus: status,
          lastError: node.lastError || "",
        });
      } else {
        summary.errors += 1;
      }
    }
  }

  if (!includeSuspended) {
    await StreamingNode.updateMany(
      {
        $or: [{ estado: { $ne: "activo" } }, { habilitado: false }],
      },
      {
        $set: {
          healthStatus: "offline",
          lastCheckAt: new Date(),
        },
      }
    );
  }

  summary.finishedAt = new Date();

  return summary;
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