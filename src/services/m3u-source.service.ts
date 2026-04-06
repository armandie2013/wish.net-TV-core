import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import M3uSource from "@/models/M3uSource";
import type {
  CreateM3uSourceInput,
  UpdateM3uSourceInput,
} from "@/validations/m3u-source.validation";

export async function getAllM3uSources() {
  await connectDB();

  const sources = await M3uSource.find({})
    .sort({ prioridad: 1, createdAt: -1 })
    .lean();

  return sources.map((source) => ({
    ...source,
    _id: String(source._id),
  }));
}

export async function createM3uSource(data: CreateM3uSourceInput) {
  await connectDB();

  const existingName = await M3uSource.findOne({ nombre: data.nombre });
  if (existingName) {
    throw new Error("Ya existe una fuente con ese nombre");
  }

  const existingUrl = await M3uSource.findOne({ urlFuente: data.urlFuente });
  if (existingUrl) {
    throw new Error("Ya existe una fuente con esa URL");
  }

  const source = await M3uSource.create({
    nombre: data.nombre,
    descripcion: data.descripcion || "",
    tipoEntrada: data.tipoEntrada,
    urlFuente: data.urlFuente,
    estado: data.estado,
    prioridad: data.prioridad,
    localidad: data.localidad,
    importacionAutomatica: data.importacionAutomatica,
    intervaloMinutos: data.intervaloMinutos,
  });

  return {
    _id: String(source._id),
    nombre: source.nombre,
    descripcion: source.descripcion,
    tipoEntrada: source.tipoEntrada,
    urlFuente: source.urlFuente,
    estado: source.estado,
    prioridad: source.prioridad,
    localidad: source.localidad,
    importacionAutomatica: source.importacionAutomatica,
    intervaloMinutos: source.intervaloMinutos,
    ultimaImportacion: source.ultimaImportacion,
  };
}

export async function getM3uSourceById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de fuente inválido");
  }

  const source = await M3uSource.findById(id).lean();

  if (!source) {
    throw new Error("Fuente no encontrada");
  }

  return {
    ...source,
    _id: String(source._id),
  };
}

export async function updateM3uSource(
  id: string,
  data: UpdateM3uSourceInput
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de fuente inválido");
  }

  const existingName = await M3uSource.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });

  if (existingName) {
    throw new Error("Ya existe otra fuente con ese nombre");
  }

  const existingUrl = await M3uSource.findOne({
    urlFuente: data.urlFuente,
    _id: { $ne: id },
  });

  if (existingUrl) {
    throw new Error("Ya existe otra fuente con esa URL");
  }

  const source = await M3uSource.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      tipoEntrada: data.tipoEntrada,
      urlFuente: data.urlFuente,
      estado: data.estado,
      prioridad: data.prioridad,
      localidad: data.localidad,
      importacionAutomatica: data.importacionAutomatica,
      intervaloMinutos: data.intervaloMinutos,
    },
    { new: true, runValidators: true }
  ).lean();

  if (!source) {
    throw new Error("Fuente no encontrada");
  }

  return {
    ...source,
    _id: String(source._id),
  };
}

export async function toggleM3uSourceStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de fuente inválido");
  }

  const source = await M3uSource.findById(id);

  if (!source) {
    throw new Error("Fuente no encontrada");
  }

  source.estado = source.estado === "activo" ? "suspendido" : "activo";
  await source.save();

  return {
    _id: String(source._id),
    nombre: source.nombre,
    descripcion: source.descripcion,
    tipoEntrada: source.tipoEntrada,
    urlFuente: source.urlFuente,
    estado: source.estado,
    prioridad: source.prioridad,
    localidad: source.localidad,
    importacionAutomatica: source.importacionAutomatica,
    intervaloMinutos: source.intervaloMinutos,
    ultimaImportacion: source.ultimaImportacion,
  };
}