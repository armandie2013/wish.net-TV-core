// import { connectDB } from "@/lib/db";
// import Channel from "@/models/Channel";
// import M3uSource from "@/models/M3uSource";

// type ParsedChannel = {
//   nombre: string;
//   categoria: string;
//   logo: string;
//   urlOrigen: string;
//   tvgId: string;
// };

// function extractAttribute(extinfLine: string, attribute: string) {
//   const regex = new RegExp(`${attribute}="([^"]*)"`, "i");
//   const match = extinfLine.match(regex);
//   return match?.[1]?.trim() || "";
// }

// function extractChannelName(extinfLine: string) {
//   const commaIndex = extinfLine.lastIndexOf(",");
//   if (commaIndex === -1) return "Canal sin nombre";
//   return extinfLine.slice(commaIndex + 1).trim() || "Canal sin nombre";
// }

// function normalizeCategory(value: string) {
//   const trimmed = value?.trim();
//   if (!trimmed) return "General";
//   return trimmed;
// }

// function parseIptvM3uContent(content: string): ParsedChannel[] {
//   const lines = content
//     .split(/\r?\n/)
//     .map((line) => line.trim())
//     .filter(Boolean);

//   const channels: ParsedChannel[] = [];

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     if (!line.startsWith("#EXTINF")) continue;

//     let nextUrl = "";
//     let j = i + 1;

//     while (j < lines.length) {
//       const candidate = lines[j];

//       if (!candidate.startsWith("#")) {
//         nextUrl = candidate;
//         break;
//       }

//       j++;
//     }

//     if (!nextUrl) continue;

//     const nombre = extractChannelName(line);
//     const categoria = extractAttribute(line, "group-title") || "General";
//     const logo = extractAttribute(line, "tvg-logo");
//     const tvgId = extractAttribute(line, "tvg-id");

//     channels.push({
//       nombre,
//       categoria,
//       logo,
//       urlOrigen: nextUrl,
//       tvgId,
//     });

//     i = j;
//   }

//   return channels;
// }

// function looksLikeHlsPlaylist(content: string) {
//   const normalized = content.toUpperCase();

//   return (
//     normalized.includes("#EXTM3U") &&
//     (
//       normalized.includes("#EXT-X-STREAM-INF") ||
//       normalized.includes("#EXT-X-TARGETDURATION") ||
//       normalized.includes("#EXT-X-MEDIA-SEQUENCE") ||
//       normalized.includes("#EXT-X-ENDLIST") ||
//       normalized.includes("#EXT-X-VERSION") ||
//       normalized.includes("#EXT-X-PLAYLIST-TYPE")
//     )
//   );
// }

// function looksLikeIptvM3u(content: string) {
//   const normalized = content.toUpperCase();

//   return (
//     normalized.includes("#EXTM3U") &&
//     normalized.includes("#EXTINF") &&
//     !looksLikeHlsPlaylist(content)
//   );
// }

// function buildSingleChannelFromHlsSource(source: {
//   nombre: string;
//   localidad?: string;
//   urlFuente: string;
// }): ParsedChannel {
//   return {
//     nombre: source.nombre?.trim() || "Canal sin nombre",
//     categoria: normalizeCategory(source.localidad || "General"),
//     logo: "",
//     urlOrigen: source.urlFuente,
//     tvgId: "",
//   };
// }

// export async function importM3uSourceNow(sourceId: string) {
//   await connectDB();

//   const source = await M3uSource.findById(sourceId);

//   if (!source) {
//     throw new Error("Fuente M3U no encontrada");
//   }

//   if (!source.urlFuente) {
//     throw new Error("La fuente no tiene una URL configurada");
//   }

//   const response = await fetch(source.urlFuente, {
//     method: "GET",
//     cache: "no-store",
//   });

//   if (!response.ok) {
//     throw new Error(`No se pudo descargar la M3U (${response.status})`);
//   }

//   const content = await response.text();

//   const isHlsPlaylist = looksLikeHlsPlaylist(content);
//   const isIptvM3u = looksLikeIptvM3u(content);

//   if (!isHlsPlaylist && !isIptvM3u) {
//     throw new Error(
//       "El archivo no parece ser una lista IPTV válida ni una playlist HLS compatible"
//     );
//   }

//   const parsedChannels = isHlsPlaylist
//     ? [buildSingleChannelFromHlsSource(source)]
//     : parseIptvM3uContent(content);

//   let created = 0;
//   let updated = 0;
//   let skipped = 0;

//   for (const parsed of parsedChannels) {
//     if (!parsed.urlOrigen) {
//       skipped++;
//       continue;
//     }

//     const existing = await Channel.findOne({ urlOrigen: parsed.urlOrigen });

//     if (existing) {
//       existing.nombre = parsed.nombre;
//       existing.categoria = parsed.categoria || existing.categoria || "General";
//       existing.logo = parsed.logo || existing.logo || "";
//       existing.tvgId = parsed.tvgId || existing.tvgId || "";
//       existing.sourceId = source._id;
//       existing.sourceName = source.nombre;
//       existing.lastImportedAt = new Date();
//       await existing.save();
//       updated++;
//     } else {
//       await Channel.create({
//         nombre: parsed.nombre,
//         descripcion: "",
//         categoria: parsed.categoria || "General",
//         logo: parsed.logo || "",
//         urlOrigen: parsed.urlOrigen,
//         tvgId: parsed.tvgId || "",
//         sourceId: source._id,
//         sourceName: source.nombre,
//         estado: "activo",
//         lastImportedAt: new Date(),
//       });
//       created++;
//     }
//   }

//   source.ultimaImportacion = new Date();
//   await source.save();

//   return {
//     source: {
//       _id: String(source._id),
//       nombre: source.nombre,
//     },
//     totalDetected: parsedChannels.length,
//     created,
//     updated,
//     skipped,
//     detectedFormat: isHlsPlaylist ? "hls-single-channel" : "iptv-m3u",
//   };
// }

import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";
import M3uSource from "@/models/M3uSource";
import Plan from "@/models/Plan";

type ParsedChannel = {
  nombre: string;
  categoria: string;
  logo: string;
  urlOrigen: string;
  tvgId: string;
};

function extractAttribute(extinfLine: string, attribute: string) {
  const regex = new RegExp(`${attribute}="([^"]*)"`, "i");
  const match = extinfLine.match(regex);
  return match?.[1]?.trim() || "";
}

function extractChannelName(extinfLine: string) {
  const commaIndex = extinfLine.lastIndexOf(",");
  if (commaIndex === -1) return "Canal sin nombre";

  return extinfLine.slice(commaIndex + 1).trim() || "Canal sin nombre";
}

function normalizeCategory(value: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "General";

  return trimmed;
}

function normalizeUrl(value: string) {
  return String(value || "").trim();
}

function parseIptvM3uContent(content: string): ParsedChannel[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const channels: ParsedChannel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.startsWith("#EXTINF")) continue;

    let nextUrl = "";
    let j = i + 1;

    while (j < lines.length) {
      const candidate = lines[j];

      if (!candidate.startsWith("#")) {
        nextUrl = candidate;
        break;
      }

      j++;
    }

    if (!nextUrl) continue;

    const nombre = extractChannelName(line);
    const categoria = extractAttribute(line, "group-title") || "General";
    const logo = extractAttribute(line, "tvg-logo");
    const tvgId = extractAttribute(line, "tvg-id");

    channels.push({
      nombre,
      categoria: normalizeCategory(categoria),
      logo,
      urlOrigen: normalizeUrl(nextUrl),
      tvgId,
    });

    i = j;
  }

  return channels;
}

function looksLikeHlsPlaylist(content: string) {
  const normalized = content.toUpperCase();

  return (
    normalized.includes("#EXTM3U") &&
    (normalized.includes("#EXT-X-STREAM-INF") ||
      normalized.includes("#EXT-X-TARGETDURATION") ||
      normalized.includes("#EXT-X-MEDIA-SEQUENCE") ||
      normalized.includes("#EXT-X-ENDLIST") ||
      normalized.includes("#EXT-X-VERSION") ||
      normalized.includes("#EXT-X-PLAYLIST-TYPE"))
  );
}

function looksLikeIptvM3u(content: string) {
  const normalized = content.toUpperCase();

  return (
    normalized.includes("#EXTM3U") &&
    normalized.includes("#EXTINF") &&
    !looksLikeHlsPlaylist(content)
  );
}

function buildSingleChannelFromHlsSource(source: {
  nombre: string;
  localidad?: string;
  urlFuente: string;
}): ParsedChannel {
  return {
    nombre: source.nombre?.trim() || "Canal sin nombre",
    categoria: normalizeCategory(source.localidad || "General"),
    logo: "",
    urlOrigen: normalizeUrl(source.urlFuente),
    tvgId: "",
  };
}

function uniqueStringArray(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

async function syncPlanSnapshotsForChannels(channelIds: string[]) {
  const uniqueIds = uniqueStringArray(channelIds).filter((id) =>
    Types.ObjectId.isValid(id)
  );

  if (uniqueIds.length === 0) {
    return 0;
  }

  const channels = await Channel.find({
    _id: { $in: uniqueIds },
  })
    .select("nombre categoria logo sourceName")
    .lean();

  if (channels.length === 0) {
    return 0;
  }

  const operations = channels.map((channel: any) => ({
    updateMany: {
      filter: {
        "grillaCanales.channelId": channel._id,
      },
      update: {
        $set: {
          "grillaCanales.$[item].logo": channel.logo || "",
          "grillaCanales.$[item].categoria": channel.categoria || "General",
          "grillaCanales.$[item].sourceName": channel.sourceName || "",
        },
      },
      arrayFilters: [
        {
          "item.channelId": channel._id,
        },
      ],
    },
  }));

  const result = await Plan.bulkWrite(operations);

  return result.modifiedCount || 0;
}

export async function importM3uSourceNow(sourceId: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(sourceId)) {
    throw new Error("ID de fuente inválido");
  }

  const source = await M3uSource.findById(sourceId);

  if (!source) {
    throw new Error("Fuente M3U no encontrada");
  }

  if (!source.urlFuente) {
    throw new Error("La fuente no tiene una URL configurada");
  }

  const response = await fetch(source.urlFuente, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar la M3U (${response.status})`);
  }

  const content = await response.text();

  const isHlsPlaylist = looksLikeHlsPlaylist(content);
  const isIptvM3u = looksLikeIptvM3u(content);

  if (!isHlsPlaylist && !isIptvM3u) {
    throw new Error(
      "El archivo no parece ser una lista IPTV válida ni una playlist HLS compatible"
    );
  }

  const parsedChannels = isHlsPlaylist
    ? [buildSingleChannelFromHlsSource(source)]
    : parseIptvM3uContent(content);

  const now = new Date();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const importedUrls: string[] = [];
  const touchedChannelIds: string[] = [];

  for (const parsed of parsedChannels) {
    const urlOrigen = normalizeUrl(parsed.urlOrigen);

    if (!urlOrigen) {
      skipped++;
      continue;
    }

    importedUrls.push(urlOrigen);

    let existing = await Channel.findOne({
      sourceId: source._id,
      urlOrigen,
    });

    if (!existing) {
      existing = await Channel.findOne({
        urlOrigen,
      });
    }

    if (existing) {
      existing.nombre = parsed.nombre || existing.nombre;
      existing.categoria =
        normalizeCategory(parsed.categoria) || existing.categoria || "General";
      existing.logo = parsed.logo || existing.logo || "";
      existing.tvgId = parsed.tvgId || existing.tvgId || "";
      existing.urlOrigen = urlOrigen;
      existing.sourceId = source._id;
      existing.sourceName = source.nombre;
      existing.estado = source.estado === "activo" ? "activo" : "suspendido";
      existing.lastImportedAt = now;

      await existing.save();

      touchedChannelIds.push(String(existing._id));
      updated++;
    } else {
      const createdChannel = await Channel.create({
        nombre: parsed.nombre || "Canal sin nombre",
        descripcion: "",
        categoria: normalizeCategory(parsed.categoria) || "General",
        logo: parsed.logo || "",
        urlOrigen,
        tvgId: parsed.tvgId || "",
        sourceId: source._id,
        sourceName: source.nombre,
        estado: source.estado === "activo" ? "activo" : "suspendido",
        lastImportedAt: now,
      });

      touchedChannelIds.push(String(createdChannel._id));
      created++;
    }
  }

  const uniqueImportedUrls = uniqueStringArray(importedUrls);

  const obsoleteChannels = await Channel.find({
    sourceId: source._id,
    urlOrigen: { $nin: uniqueImportedUrls },
  }).select("_id estado");

  let obsoleteSuspended = 0;

  if (obsoleteChannels.length > 0) {
    const obsoleteIds = obsoleteChannels.map((channel: any) => channel._id);

    const obsoleteResult = await Channel.updateMany(
      {
        _id: { $in: obsoleteIds },
      },
      {
        $set: {
          estado: "suspendido",
          lastImportedAt: now,
        },
      }
    );

    obsoleteSuspended = obsoleteResult.modifiedCount || 0;

    obsoleteChannels.forEach((channel: any) => {
      touchedChannelIds.push(String(channel._id));
    });
  }

  const plansSynced = await syncPlanSnapshotsForChannels(touchedChannelIds);

  source.ultimaImportacion = now;
  await source.save();

  return {
    source: {
      _id: String(source._id),
      nombre: source.nombre,
    },
    totalDetected: parsedChannels.length,
    created,
    updated,
    skipped,
    obsoleteSuspended,
    plansSynced,
    detectedFormat: isHlsPlaylist ? "hls-single-channel" : "iptv-m3u",
  };
}