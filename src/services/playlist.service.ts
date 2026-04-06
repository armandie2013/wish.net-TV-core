import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Plan from "@/models/Plan";
import "@/models/Channel";

function escapeM3uValue(value: string) {
  return String(value ?? "").replace(/"/g, "'");
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
      "nombre categoria logo urlOrigen tvgId estado"
    )
    .select("nombre estado canalesPermitidos")
    .lean();

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  if ((plan as any).estado !== "activo") {
    throw new Error("El plan asignado no está activo");
  }

  const channels = ((plan as any).canalesPermitidos || []).filter(
    (channel: any) => channel && channel.estado === "activo"
  );

  const lines: string[] = [];
  lines.push("#EXTM3U");

  for (const channel of channels) {
    const tvgId = escapeM3uValue(channel.tvgId || "");
    const tvgName = escapeM3uValue(channel.nombre || "");
    const tvgLogo = escapeM3uValue(channel.logo || "");
    const groupTitle = escapeM3uValue(channel.categoria || "General");
    const channelName = channel.nombre || "Canal sin nombre";
    const url = channel.urlOrigen || "";

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
    totalChannels: channels.length,
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