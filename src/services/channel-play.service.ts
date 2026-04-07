import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";
import User from "@/models/User";
import "@/models/Plan";
import "@/models/LocationNode";
import "@/models/StreamingNode";

function joinUrl(base: string, path: string) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function resolveChannelStream(userId: string, channelId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(channelId)) {
    throw new Error("Canal inválido");
  }

  const user = await User.findById(userId)
    .populate({
      path: "planId",
      populate: {
        path: "canalesPermitidos",
        model: "Channel",
      },
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

  const allowedChannels = (plan.canalesPermitidos || []).filter(
    (channel: any) => channel && channel.estado === "activo"
  );

  const channelFromPlan = allowedChannels.find(
    (channel: any) => String(channel._id) === channelId
  );

  if (!channelFromPlan) {
    throw new Error("El canal no está disponible para este usuario");
  }

  const channel = await Channel.findById(channelId)
    .select("nombre categoria logo urlOrigen tvgId estado")
    .lean();

  if (!channel) {
    throw new Error("Canal no encontrado");
  }

  if ((channel as any).estado !== "activo") {
    throw new Error("Canal inactivo");
  }

  const location = (user as any).localidadId || null;
  const mainNode = location?.streamingNodeId || null;
  const fallbackNode = location?.fallbackStreamingNodeId || null;

  // Estrategia simple:
  // si hay nodo principal activo -> arma URL desde ese nodo
  // si no, intenta fallback
  // si no, usa urlOrigen directo

  const channelPath = `stream/${String((channel as any)._id)}`;

  if (mainNode && mainNode.estado === "activo" && mainNode.urlBase) {
    return {
      strategy: "node-main",
      user: {
        id: String((user as any)._id),
        nombre: (user as any).nombre,
        localidad: location?.nombre || (user as any).localidad || "principal",
      },
      location: location
        ? {
            id: String(location._id),
            nombre: location.nombre,
            codigo: location.codigo,
          }
        : null,
      node: {
        id: String(mainNode._id),
        nombre: mainNode.nombre,
        tipo: mainNode.tipo,
        urlBase: mainNode.urlBase,
      },
      channel: {
        id: String((channel as any)._id),
        name: (channel as any).nombre,
        logo: (channel as any).logo || "",
        category: (channel as any).categoria || "General",
        tvgId: (channel as any).tvgId || "",
      },
      streamUrl: joinUrl(mainNode.urlBase, channelPath),
      fallbackUsed: false,
      directSourceUrl: (channel as any).urlOrigen,
    };
  }

  if (fallbackNode && fallbackNode.estado === "activo" && fallbackNode.urlBase) {
    return {
      strategy: "node-fallback",
      user: {
        id: String((user as any)._id),
        nombre: (user as any).nombre,
        localidad: location?.nombre || (user as any).localidad || "principal",
      },
      location: location
        ? {
            id: String(location._id),
            nombre: location.nombre,
            codigo: location.codigo,
          }
        : null,
      node: {
        id: String(fallbackNode._id),
        nombre: fallbackNode.nombre,
        tipo: fallbackNode.tipo,
        urlBase: fallbackNode.urlBase,
      },
      channel: {
        id: String((channel as any)._id),
        name: (channel as any).nombre,
        logo: (channel as any).logo || "",
        category: (channel as any).categoria || "General",
        tvgId: (channel as any).tvgId || "",
      },
      streamUrl: joinUrl(fallbackNode.urlBase, channelPath),
      fallbackUsed: true,
      directSourceUrl: (channel as any).urlOrigen,
    };
  }

  return {
    strategy: "direct",
    user: {
      id: String((user as any)._id),
      nombre: (user as any).nombre,
      localidad: location?.nombre || (user as any).localidad || "principal",
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
      id: String((channel as any)._id),
      name: (channel as any).nombre,
      logo: (channel as any).logo || "",
      category: (channel as any).categoria || "General",
      tvgId: (channel as any).tvgId || "",
    },
    streamUrl: (channel as any).urlOrigen,
    fallbackUsed: false,
    directSourceUrl: (channel as any).urlOrigen,
  };
}