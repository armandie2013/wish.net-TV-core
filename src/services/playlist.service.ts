import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Plan from "@/models/Plan";
import "@/models/Channel";

function escapeM3uValue(value: string) {
  return String(value ?? "").replace(/"/g, "'");
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

function buildLinearGrid(plan: any) {
  const rawGrid = Array.isArray(plan.grillaCanales) ? plan.grillaCanales : [];

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
        if (!channel.urlOrigen) return null;

        return {
          numero: Number(item.numero || index + 1),
          orden: Number(item.orden || index + 1),
          id: channel._id,
          tvgId: channel.tvgId || "",
          name: item.nombreVisible?.trim() || channel.nombre || "Canal sin nombre",
          logo: item.logo || channel.logo || "",
          category: item.categoria || channel.categoria || "General",
          sourceName: item.sourceName || channel.sourceName || "",
          url: channel.urlOrigen,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.orden - b.orden);
  }

  const fallbackChannels = Array.isArray(plan.canalesPermitidos)
    ? plan.canalesPermitidos
    : [];

  return fallbackChannels
    .map((channel: any, index: number) => {
      const normalized = normalizeChannelDocument(channel);

      if (!normalized) return null;
      if (normalized.estado !== "activo") return null;
      if (!normalized.urlOrigen) return null;

      return {
        numero: index + 1,
        orden: index + 1,
        id: normalized._id,
        tvgId: normalized.tvgId || "",
        name: normalized.nombre || "Canal sin nombre",
        logo: normalized.logo || "",
        category: normalized.categoria || "General",
        sourceName: normalized.sourceName || "",
        url: normalized.urlOrigen,
      };
    })
    .filter(Boolean);
}

async function buildPlaylistFromUserDocument(user: any) {
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.estado !== "activo") {
    throw new Error("El usuario no está activo");
  }

  if (!user.planId) {
    throw new Error("El usuario no tiene un plan asignado");
  }

  const plan = await Plan.findById(user.planId)
    .populate(
      "canalesPermitidos",
      "nombre categoria logo urlOrigen tvgId estado sourceName"
    )
    .populate(
      "grillaCanales.channelId",
      "nombre categoria logo urlOrigen tvgId estado sourceName"
    )
    .select("nombre estado cantidadCanales canalesPermitidos grillaCanales")
    .lean();

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  if ((plan as any).estado !== "activo") {
    throw new Error("El plan asignado no está activo");
  }

  const grid = buildLinearGrid(plan);

  const lines: string[] = [];
  lines.push("#EXTM3U");

  for (const item of grid) {
    const tvgId = escapeM3uValue(item.tvgId || "");
    const tvgName = escapeM3uValue(item.name || "");
    const tvgLogo = escapeM3uValue(item.logo || "");
    const groupTitle = escapeM3uValue(item.category || "General");
    const channelName = item.name || "Canal sin nombre";
    const url = item.url || "";

    if (!url) continue;

    lines.push(
      `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channelName}`
    );
    lines.push(url);
  }

  return {
    filename: `playlist-${String(user.email || "user").replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )}.m3u`,
    content: lines.join("\n"),
    user: {
      _id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      localidad: user.localidad || "principal",
      planId: user.planId ? String(user.planId) : null,
      playlistToken: user.playlistToken || null,
    },
    plan: {
      _id: String((plan as any)._id),
      nombre: (plan as any).nombre,
    },
    totalChannels: grid.length,
  };
}

export async function buildPlaylistForUser(userId: string) {
  await connectDB();

  const user = await User.findById(userId)
    .select("nombre email estado localidad planId rol playlistToken")
    .lean();

  return buildPlaylistFromUserDocument(user);
}

export async function buildPlaylistForUserByToken(token: string) {
  await connectDB();

  const user = await User.findOne({ playlistToken: token })
    .select("nombre email estado localidad planId rol playlistToken")
    .lean();

  if (!user) {
    throw new Error("Token de playlist inválido");
  }

  return buildPlaylistFromUserDocument(user);
}