import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";
import User from "@/models/User";
import "@/models/Plan";
import "@/models/LocationNode";
import "@/models/StreamingNode";
import {
  getFreshStreamingNodeState,
  getHealthyOriginNode,
} from "@/services/streaming-node-health.service";

function joinUrl(base: string, path: string) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function normalizeChannelDocument(channel: any) {
  if (!channel) return null;

  return {
    _id: String(channel._id),
    nombre: channel.nombre || "",
    categoria: channel.categoria || "General",
    logo: channel.logo || "",
    urlOrigen: channel.urlOrigen || "",
    tvgId: channel.tvgId || "",
    estado: channel.estado || "activo",
    sourceName: channel.sourceName || "",
  };
}

function buildAllowedGridFromPlan(plan: any) {
  const rawGrid = Array.isArray(plan?.grillaCanales) ? plan.grillaCanales : [];

  if (rawGrid.length > 0) {
    return rawGrid
      .map((item: any, index: number) => {
        const channel =
          item.channelId && typeof item.channelId === "object"
            ? normalizeChannelDocument(item.channelId)
            : null;

        if (!channel) return null;
        if (channel.estado !== "activo") return null;
        if (!item.habilitado) return null;

        return {
          numero: Number(item.numero || index + 1),
          orden: Number(item.orden || index + 1),
          id: String(channel._id),
          name: item.nombreVisible?.trim() || channel.nombre,
          logo: item.logo || channel.logo || "",
          category: item.categoria || channel.categoria || "General",
          tvgId: channel.tvgId || "",
          sourceName: item.sourceName || channel.sourceName || "",
          urlOrigen: channel.urlOrigen || "",
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.orden - b.orden);
  }

  const allowedChannels = Array.isArray(plan?.canalesPermitidos)
    ? plan.canalesPermitidos
    : [];

  return allowedChannels
    .map((channel: any, index: number) => {
      const normalized = normalizeChannelDocument(channel);

      if (!normalized) return null;
      if (normalized.estado !== "activo") return null;

      return {
        numero: index + 1,
        orden: index + 1,
        id: normalized._id,
        name: normalized.nombre,
        logo: normalized.logo || "",
        category: normalized.categoria || "General",
        tvgId: normalized.tvgId || "",
        sourceName: normalized.sourceName || "",
        urlOrigen: normalized.urlOrigen || "",
      };
    })
    .filter(Boolean);
}

function buildNodePayload(node: any) {
  if (!node) return null;

  return {
    id: String(node._id),
    nombre: node.nombre,
    codigo: node.codigo,
    tipo: node.tipo,
    urlBase: node.urlBase,
    healthStatus: node.healthStatus || "unknown",
    lastCheckAt: node.lastCheckAt || null,
    lastSeenAt: node.lastSeenAt || null,
  };
}

async function resolvePlaybackNode(location: any) {
  const mainNode = location?.streamingNodeId || null;
  const fallbackNode = location?.fallbackStreamingNodeId || null;

  const freshMainNode = await getFreshStreamingNodeState(mainNode, 30000);

  if (
    freshMainNode &&
    freshMainNode.estado === "activo" &&
    freshMainNode.habilitado !== false &&
    freshMainNode.healthStatus === "online"
  ) {
    return {
      node: freshMainNode,
      strategy:
        freshMainNode.tipo === "edge" ? "edge-main" : "origin-main",
      fallbackUsed: false,
    };
  }

  const freshFallbackNode = await getFreshStreamingNodeState(fallbackNode, 30000);

  if (
    freshFallbackNode &&
    freshFallbackNode.estado === "activo" &&
    freshFallbackNode.habilitado !== false &&
    freshFallbackNode.healthStatus === "online"
  ) {
    return {
      node: freshFallbackNode,
      strategy:
        freshFallbackNode.tipo === "edge"
          ? "edge-fallback"
          : "origin-fallback",
      fallbackUsed: true,
    };
  }

  const healthyOrigin = await getHealthyOriginNode(30000);

  if (healthyOrigin) {
    return {
      node: healthyOrigin,
      strategy: "origin-global-fallback",
      fallbackUsed: true,
    };
  }

  return {
    node: null,
    strategy: "direct",
    fallbackUsed: false,
  };
}

function extractTvheadendChannelId(url: string) {
  if (!url) return null;

  const match = url.match(/\/stream\/channelid\/(\d+)(?:\?|$)/i);
  return match?.[1] || null;
}

function buildPlaybackPath(channelMongoId: string, sourceUrl: string) {
  const tvheadendChannelId = extractTvheadendChannelId(sourceUrl);

  if (tvheadendChannelId) {
    return {
      path: `proxy/${tvheadendChannelId}.ts`,
      mode: "proxy-ts",
      remoteChannelId: tvheadendChannelId,
    };
  }

  return {
    path: `stream/${channelMongoId}`,
    mode: "stream",
    remoteChannelId: null,
  };
}

export async function resolveChannelStream(userId: string, channelId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(channelId)) {
    throw new Error("Canal inválido");
  }

  const user = await User.findById(userId)
    .populate({
      path: "planId",
      populate: [
        {
          path: "canalesPermitidos",
          model: "Channel",
        },
        {
          path: "grillaCanales.channelId",
          model: "Channel",
        },
      ],
    })
    .populate({
      path: "localidadId",
      populate: [
        { path: "streamingNodeId", model: "StreamingNode" },
        { path: "fallbackStreamingNodeId", model: "StreamingNode" },
      ],
    })
    .select("nombre email estado localidad localidadId planId")
    .lean();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if ((user as any).estado !== "activo") {
    throw new Error("Usuario inactivo");
  }

  const plan = (user as any).planId;

  if (!plan) {
    throw new Error("Usuario sin plan asignado");
  }

  const allowedGrid = buildAllowedGridFromPlan(plan);
  const gridItem = allowedGrid.find((item: any) => item.id === channelId) || null;

  if (!gridItem) {
    throw new Error("El canal no está disponible para este usuario");
  }

  const channel = await Channel.findById(channelId)
    .select("nombre categoria logo urlOrigen tvgId estado sourceName")
    .lean();

  if (!channel) {
    throw new Error("Canal no encontrado");
  }

  if ((channel as any).estado !== "activo") {
    throw new Error("Canal inactivo");
  }

  const normalizedChannel = normalizeChannelDocument(channel);
  const location = (user as any).localidadId || null;
  const playbackRoute = buildPlaybackPath(
    String((channel as any)._id),
    normalizedChannel?.urlOrigen || (channel as any).urlOrigen || ""
  );
  const playbackNode = await resolvePlaybackNode(location);

  if (playbackNode.node && playbackNode.node.urlBase) {
    return {
      strategy: playbackNode.strategy,
      playbackMode: playbackRoute.mode,
      remoteChannelId: playbackRoute.remoteChannelId,
      user: {
        id: String((user as any)._id),
        nombre: (user as any).nombre,
        localidad: location?.nombre || (user as any).localidad || "",
      },
      location: location
        ? {
            id: String(location._id),
            nombre: location.nombre,
            codigo: location.codigo,
          }
        : null,
      node: buildNodePayload(playbackNode.node),
      channel: {
        id: String(normalizedChannel?._id || (channel as any)._id),
        name: gridItem.name || normalizedChannel?.nombre || (channel as any).nombre,
        logo: gridItem.logo || normalizedChannel?.logo || "",
        category:
          gridItem.category ||
          normalizedChannel?.categoria ||
          (channel as any).categoria ||
          "General",
        tvgId: normalizedChannel?.tvgId || (channel as any).tvgId || "",
        numero: gridItem.numero,
        orden: gridItem.orden,
        visibleName: gridItem.name,
        sourceName: gridItem.sourceName || normalizedChannel?.sourceName || "",
      },
      streamUrl: joinUrl(playbackNode.node.urlBase, playbackRoute.path),
      fallbackUsed: playbackNode.fallbackUsed,
      directSourceUrl: normalizedChannel?.urlOrigen || (channel as any).urlOrigen,
    };
  }

  return {
    strategy: "direct",
    playbackMode: "direct",
    remoteChannelId: null,
    user: {
      id: String((user as any)._id),
      nombre: (user as any).nombre,
      localidad: location?.nombre || (user as any).localidad || "",
    },
    location: location
      ? {
          id: String(location._id),
          nombre: location.nombre,
          codigo: location.codigo,
        }
      : null,
    node: null,
    channel: {
      id: String(normalizedChannel?._id || (channel as any)._id),
      name: gridItem.name || normalizedChannel?.nombre || (channel as any).nombre,
      logo: gridItem.logo || normalizedChannel?.logo || "",
      category:
        gridItem.category ||
        normalizedChannel?.categoria ||
        (channel as any).categoria ||
        "General",
      tvgId: normalizedChannel?.tvgId || (channel as any).tvgId || "",
      numero: gridItem.numero,
      orden: gridItem.orden,
      visibleName: gridItem.name,
      sourceName: gridItem.sourceName || normalizedChannel?.sourceName || "",
    },
    streamUrl: normalizedChannel?.urlOrigen || (channel as any).urlOrigen,
    fallbackUsed: false,
    directSourceUrl: normalizedChannel?.urlOrigen || (channel as any).urlOrigen,
  };
}