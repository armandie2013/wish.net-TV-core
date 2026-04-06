import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import StreamingNode from "@/models/StreamingNode";
import type {
  CreateStreamingNodeInput,
  UpdateStreamingNodeInput,
} from "@/validations/streaming.validation";

export async function getAllStreamingNodes() {
  await connectDB();

  const nodes = await StreamingNode.find({})
    .sort({ tipo: 1, prioridad: 1, createdAt: -1 })
    .lean();

  return nodes.map((node) => ({
    ...node,
    _id: String(node._id),
  }));
}

export async function createStreamingNode(data: CreateStreamingNodeInput) {
  await connectDB();

  const existingName = await StreamingNode.findOne({ nombre: data.nombre });
  if (existingName) {
    throw new Error("Ya existe un servidor con ese nombre");
  }

  const existingUrl = await StreamingNode.findOne({ urlBase: data.urlBase });
  if (existingUrl) {
    throw new Error("Ya existe un servidor con esa URL base");
  }

  const node = await StreamingNode.create({
    nombre: data.nombre,
    tipo: data.tipo,
    urlBase: data.urlBase,
    host: data.host || "",
    puerto: data.puerto,
    localidad: data.localidad,
    prioridad: data.prioridad,
    estado: data.estado,
    observaciones: data.observaciones || "",
  });

  return {
    _id: String(node._id),
    nombre: node.nombre,
    tipo: node.tipo,
    urlBase: node.urlBase,
    host: node.host,
    puerto: node.puerto,
    localidad: node.localidad,
    prioridad: node.prioridad,
    estado: node.estado,
    observaciones: node.observaciones,
  };
}

export async function getStreamingNodeById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de servidor inválido");
  }

  const node = await StreamingNode.findById(id).lean();

  if (!node) {
    throw new Error("Servidor no encontrado");
  }

  return {
    ...node,
    _id: String(node._id),
  };
}

export async function updateStreamingNode(
  id: string,
  data: UpdateStreamingNodeInput
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de servidor inválido");
  }

  const existingName = await StreamingNode.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });

  if (existingName) {
    throw new Error("Ya existe otro servidor con ese nombre");
  }

  const existingUrl = await StreamingNode.findOne({
    urlBase: data.urlBase,
    _id: { $ne: id },
  });

  if (existingUrl) {
    throw new Error("Ya existe otro servidor con esa URL base");
  }

  const node = await StreamingNode.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      tipo: data.tipo,
      urlBase: data.urlBase,
      host: data.host || "",
      puerto: data.puerto,
      localidad: data.localidad,
      prioridad: data.prioridad,
      estado: data.estado,
      observaciones: data.observaciones || "",
    },
    { new: true, runValidators: true }
  ).lean();

  if (!node) {
    throw new Error("Servidor no encontrado");
  }

  return {
    ...node,
    _id: String(node._id),
  };
}

export async function toggleStreamingNodeStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de servidor inválido");
  }

  const node = await StreamingNode.findById(id);

  if (!node) {
    throw new Error("Servidor no encontrado");
  }

  node.estado = node.estado === "activo" ? "suspendido" : "activo";
  await node.save();

  return {
    _id: String(node._id),
    nombre: node.nombre,
    tipo: node.tipo,
    urlBase: node.urlBase,
    host: node.host,
    puerto: node.puerto,
    localidad: node.localidad,
    prioridad: node.prioridad,
    estado: node.estado,
    observaciones: node.observaciones,
  };
}