import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import LocationNode from "@/models/LocationNode";
import "@/models/StreamingNode";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "@/validations/location.validation";

function slugifyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toUpperCase();
}

function buildLocationCode(nombre: string) {
  return slugifyName(nombre || "");
}

function mapNode(node: any) {
  if (!node) return null;

  return {
    _id: String(node._id),
    nombre: node.nombre,
    codigo: node.codigo,
    tipo: node.tipo,
    urlBase: node.urlBase,
    estado: node.estado,
    habilitado: node.habilitado,
    healthStatus: node.healthStatus,
    prioridad: node.prioridad,
  };
}

function mapLocation(location: any) {
  return {
    _id: String(location._id),
    nombre: location.nombre,
    codigo: location.codigo,
    descripcion: location.descripcion || "",
    estado: location.estado,
    streamingNodeId: mapNode(location.streamingNodeId),
    fallbackStreamingNodeId: mapNode(location.fallbackStreamingNodeId),
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
  };
}

export async function getAllLocations() {
  await connectDB();

  const locations = await LocationNode.find({})
    .populate(
      "streamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .populate(
      "fallbackStreamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .sort({ nombre: 1 })
    .lean();

  return locations.map(mapLocation);
}

export async function createLocation(data: CreateLocationInput) {
  await connectDB();

  const nombre = data.nombre.trim();
  const codigo = buildLocationCode(nombre);

  const existingName = await LocationNode.findOne({ nombre });
  if (existingName) {
    throw new Error("Ya existe una localidad con ese nombre");
  }

  const existingCode = await LocationNode.findOne({ codigo });
  if (existingCode) {
    throw new Error(
      "Ya existe una localidad con el código generado automáticamente para ese nombre"
    );
  }

  const location = await LocationNode.create({
    nombre,
    codigo,
    descripcion: data.descripcion || "",
    streamingNodeId: data.streamingNodeId || null,
    fallbackStreamingNodeId: data.fallbackStreamingNodeId || null,
    estado: data.estado,
  });

  const populated = await LocationNode.findById(location._id)
    .populate(
      "streamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .populate(
      "fallbackStreamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .lean();

  return mapLocation(populated);
}

export async function getLocationById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de localidad inválido");
  }

  const location = await LocationNode.findById(id)
    .populate(
      "streamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .populate(
      "fallbackStreamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .lean();

  if (!location) {
    throw new Error("Localidad no encontrada");
  }

  return mapLocation(location);
}

export async function updateLocation(id: string, data: UpdateLocationInput) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de localidad inválido");
  }

  const nombre = data.nombre.trim();
  const codigo = buildLocationCode(nombre);

  const existingName = await LocationNode.findOne({
    nombre,
    _id: { $ne: id },
  });
  if (existingName) {
    throw new Error("Ya existe otra localidad con ese nombre");
  }

  const existingCode = await LocationNode.findOne({
    codigo,
    _id: { $ne: id },
  });
  if (existingCode) {
    throw new Error(
      "Ya existe otra localidad con el código generado automáticamente para ese nombre"
    );
  }

  const location = await LocationNode.findByIdAndUpdate(
    id,
    {
      nombre,
      codigo,
      descripcion: data.descripcion || "",
      streamingNodeId: data.streamingNodeId || null,
      fallbackStreamingNodeId: data.fallbackStreamingNodeId || null,
      estado: data.estado,
    },
    { new: true, runValidators: true }
  )
    .populate(
      "streamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .populate(
      "fallbackStreamingNodeId",
      "nombre codigo tipo urlBase estado habilitado healthStatus prioridad"
    )
    .lean();

  if (!location) {
    throw new Error("Localidad no encontrada");
  }

  return mapLocation(location);
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