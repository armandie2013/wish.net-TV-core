import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import LocationNode from "@/models/LocationNode";
import "@/models/StreamingNode";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "@/validations/location.validation";

export async function getAllLocations() {
  await connectDB();

  const locations = await LocationNode.find({})
    .populate("streamingNodeId", "nombre tipo urlBase estado")
    .populate("fallbackStreamingNodeId", "nombre tipo urlBase estado")
    .sort({ nombre: 1 })
    .lean();

  return locations.map((location: any) => ({
    ...location,
    _id: String(location._id),
    streamingNodeId: location.streamingNodeId
      ? {
          _id: String(location.streamingNodeId._id),
          nombre: location.streamingNodeId.nombre,
          tipo: location.streamingNodeId.tipo,
          urlBase: location.streamingNodeId.urlBase,
          estado: location.streamingNodeId.estado,
        }
      : null,
    fallbackStreamingNodeId: location.fallbackStreamingNodeId
      ? {
          _id: String(location.fallbackStreamingNodeId._id),
          nombre: location.fallbackStreamingNodeId.nombre,
          tipo: location.fallbackStreamingNodeId.tipo,
          urlBase: location.fallbackStreamingNodeId.urlBase,
          estado: location.fallbackStreamingNodeId.estado,
        }
      : null,
  }));
}

export async function createLocation(data: CreateLocationInput) {
  await connectDB();

  const existingName = await LocationNode.findOne({ nombre: data.nombre });
  if (existingName) {
    throw new Error("Ya existe una localidad con ese nombre");
  }

  const existingCode = await LocationNode.findOne({
    codigo: data.codigo.toUpperCase(),
  });
  if (existingCode) {
    throw new Error("Ya existe una localidad con ese código");
  }

  const location = await LocationNode.create({
    nombre: data.nombre,
    codigo: data.codigo.toUpperCase(),
    descripcion: data.descripcion || "",
    streamingNodeId: data.streamingNodeId || null,
    fallbackStreamingNodeId: data.fallbackStreamingNodeId || null,
    estado: data.estado,
  });

  const populated = await LocationNode.findById(location._id)
    .populate("streamingNodeId", "nombre tipo urlBase estado")
    .populate("fallbackStreamingNodeId", "nombre tipo urlBase estado")
    .lean();

  return {
    ...(populated as any),
    _id: String((populated as any)._id),
    streamingNodeId: (populated as any).streamingNodeId
      ? {
          _id: String((populated as any).streamingNodeId._id),
          nombre: (populated as any).streamingNodeId.nombre,
          tipo: (populated as any).streamingNodeId.tipo,
          urlBase: (populated as any).streamingNodeId.urlBase,
          estado: (populated as any).streamingNodeId.estado,
        }
      : null,
    fallbackStreamingNodeId: (populated as any).fallbackStreamingNodeId
      ? {
          _id: String((populated as any).fallbackStreamingNodeId._id),
          nombre: (populated as any).fallbackStreamingNodeId.nombre,
          tipo: (populated as any).fallbackStreamingNodeId.tipo,
          urlBase: (populated as any).fallbackStreamingNodeId.urlBase,
          estado: (populated as any).fallbackStreamingNodeId.estado,
        }
      : null,
  };
}

export async function getLocationById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de localidad inválido");
  }

  const location = await LocationNode.findById(id)
    .populate("streamingNodeId", "nombre tipo urlBase estado")
    .populate("fallbackStreamingNodeId", "nombre tipo urlBase estado")
    .lean();

  if (!location) {
    throw new Error("Localidad no encontrada");
  }

  return {
    ...(location as any),
    _id: String((location as any)._id),
    streamingNodeId: (location as any).streamingNodeId
      ? {
          _id: String((location as any).streamingNodeId._id),
          nombre: (location as any).streamingNodeId.nombre,
          tipo: (location as any).streamingNodeId.tipo,
          urlBase: (location as any).streamingNodeId.urlBase,
          estado: (location as any).streamingNodeId.estado,
        }
      : null,
    fallbackStreamingNodeId: (location as any).fallbackStreamingNodeId
      ? {
          _id: String((location as any).fallbackStreamingNodeId._id),
          nombre: (location as any).fallbackStreamingNodeId.nombre,
          tipo: (location as any).fallbackStreamingNodeId.tipo,
          urlBase: (location as any).fallbackStreamingNodeId.urlBase,
          estado: (location as any).fallbackStreamingNodeId.estado,
        }
      : null,
  };
}

export async function updateLocation(
  id: string,
  data: UpdateLocationInput
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de localidad inválido");
  }

  const existingName = await LocationNode.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });
  if (existingName) {
    throw new Error("Ya existe otra localidad con ese nombre");
  }

  const existingCode = await LocationNode.findOne({
    codigo: data.codigo.toUpperCase(),
    _id: { $ne: id },
  });
  if (existingCode) {
    throw new Error("Ya existe otra localidad con ese código");
  }

  const location = await LocationNode.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      codigo: data.codigo.toUpperCase(),
      descripcion: data.descripcion || "",
      streamingNodeId: data.streamingNodeId || null,
      fallbackStreamingNodeId: data.fallbackStreamingNodeId || null,
      estado: data.estado,
    },
    { new: true, runValidators: true }
  )
    .populate("streamingNodeId", "nombre tipo urlBase estado")
    .populate("fallbackStreamingNodeId", "nombre tipo urlBase estado")
    .lean();

  if (!location) {
    throw new Error("Localidad no encontrada");
  }

  return {
    ...(location as any),
    _id: String((location as any)._id),
    streamingNodeId: (location as any).streamingNodeId
      ? {
          _id: String((location as any).streamingNodeId._id),
          nombre: (location as any).streamingNodeId.nombre,
          tipo: (location as any).streamingNodeId.tipo,
          urlBase: (location as any).streamingNodeId.urlBase,
          estado: (location as any).streamingNodeId.estado,
        }
      : null,
    fallbackStreamingNodeId: (location as any).fallbackStreamingNodeId
      ? {
          _id: String((location as any).fallbackStreamingNodeId._id),
          nombre: (location as any).fallbackStreamingNodeId.nombre,
          tipo: (location as any).fallbackStreamingNodeId.tipo,
          urlBase: (location as any).fallbackStreamingNodeId.urlBase,
          estado: (location as any).fallbackStreamingNodeId.estado,
        }
      : null,
  };
}

export async function toggleLocationStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de localidad inválido");
  }

  const location = await LocationNode.findById(id);

  if (!location) {
    throw new Error("Localidad no encontrada");
  }

  location.estado = location.estado === "activo" ? "suspendido" : "activo";
  await location.save();

  return {
    _id: String(location._id),
    nombre: location.nombre,
    codigo: location.codigo,
    estado: location.estado,
  };
}