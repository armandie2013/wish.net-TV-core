import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import StreamingNode from "@/models/StreamingNode";
import type {
  CreateStreamingNodeInput,
  UpdateStreamingNodeInput,
} from "@/validations/streaming.validation";

function slugifyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toUpperCase();
}

function buildNodeCode(tipo: string, nombre: string) {
  const safeType = String(tipo || "").trim().toUpperCase();
  const safeName = slugifyName(nombre || "");
  return `${safeType}-${safeName}`;
}

function mapNode(node: any) {
  return {
    _id: String(node._id),
    nombre: node.nombre,
    codigo: node.codigo,
    tipo: node.tipo,
    urlBase: node.urlBase,
    host: node.host || "",
    puerto: node.puerto,
    prioridad: node.prioridad,
    estado: node.estado,
    habilitado: node.habilitado,
    healthCheckPath: node.healthCheckPath,
    healthStatus: node.healthStatus,
    healthTimeoutMs: node.healthTimeoutMs,
    lastCheckAt: node.lastCheckAt,
    lastSeenAt: node.lastSeenAt,
    failureCount: node.failureCount,
    lastError: node.lastError || "",
    observaciones: node.observaciones || "",
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

export async function getAllStreamingNodes() {
  await connectDB();

  const nodes = await StreamingNode.find({})
    .sort({ tipo: 1, prioridad: 1, createdAt: -1 })
    .lean();

  return nodes.map(mapNode);
}

export async function createStreamingNode(data: CreateStreamingNodeInput) {
  await connectDB();

  const codigo = buildNodeCode(data.tipo, data.nombre);
  const urlBase = data.urlBase.replace(/\/+$/, "");

  const existingName = await StreamingNode.findOne({ nombre: data.nombre });
  if (existingName) {
    throw new Error("Ya existe un servidor con ese nombre");
  }

  const existingCode = await StreamingNode.findOne({ codigo });
  if (existingCode) {
    throw new Error(
      "Ya existe un servidor con el código generado automáticamente para ese nombre"
    );
  }

  const existingUrl = await StreamingNode.findOne({ urlBase });
  if (existingUrl) {
    throw new Error("Ya existe un servidor con esa URL base");
  }

  const node = await StreamingNode.create({
    nombre: data.nombre,
    codigo,
    tipo: data.tipo,
    urlBase,
    host: data.host || "",
    puerto: data.puerto,
    prioridad: data.prioridad,
    estado: data.estado,
    habilitado: data.habilitado,
    healthCheckPath: data.healthCheckPath,
    healthStatus: data.estado === "activo" ? "unknown" : "offline",
    healthTimeoutMs: data.healthTimeoutMs,
    lastCheckAt: null,
    lastSeenAt: null,
    failureCount: 0,
    lastError: data.estado === "activo" ? "" : "Nodo suspendido",
    observaciones: data.observaciones || "",
  });

  return mapNode(node.toObject());
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

  return mapNode(node);
}

export async function updateStreamingNode(
  id: string,
  data: UpdateStreamingNodeInput
) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de servidor inválido");
  }

  const codigo = buildNodeCode(data.tipo, data.nombre);
  const urlBase = data.urlBase.replace(/\/+$/, "");

  const existingName = await StreamingNode.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });

  if (existingName) {
    throw new Error("Ya existe otro servidor con ese nombre");
  }

  const existingCode = await StreamingNode.findOne({
    codigo,
    _id: { $ne: id },
  });

  if (existingCode) {
    throw new Error(
      "Ya existe otro servidor con el código generado automáticamente para ese nombre"
    );
  }

  const existingUrl = await StreamingNode.findOne({
    urlBase,
    _id: { $ne: id },
  });

  if (existingUrl) {
    throw new Error("Ya existe otro servidor con esa URL base");
  }

  const updateData: any = {
    nombre: data.nombre,
    codigo,
    tipo: data.tipo,
    urlBase,
    host: data.host || "",
    puerto: data.puerto,
    prioridad: data.prioridad,
    estado: data.estado,
    habilitado: data.habilitado,
    healthCheckPath: data.healthCheckPath,
    healthTimeoutMs: data.healthTimeoutMs,
    observaciones: data.observaciones || "",
  };

  if (data.estado !== "activo" || data.habilitado === false) {
    updateData.healthStatus = "offline";
    updateData.lastError =
      data.estado !== "activo"
        ? "Nodo suspendido"
        : "Nodo deshabilitado manualmente";
    updateData.lastCheckAt = new Date();
  } else {
    updateData.healthStatus = "unknown";
    updateData.lastError = "";
  }

  const node = await StreamingNode.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!node) {
    throw new Error("Servidor no encontrado");
  }

  return mapNode(node);
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

  if (node.estado === "suspendido") {
    node.healthStatus = "offline";
    node.lastCheckAt = new Date();
    node.lastError = "Nodo suspendido";
  } else {
    node.healthStatus = "unknown";
    node.lastError = "";
    node.failureCount = 0;
  }

  await node.save();

  return mapNode(node.toObject());
}