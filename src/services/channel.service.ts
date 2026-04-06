import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";
import type {
  CreateChannelInput,
  UpdateChannelInput,
} from "@/validations/channel.validation";

export async function getAllChannels() {
  await connectDB();

  const channels = await Channel.find({})
    .sort({ createdAt: -1 })
    .lean();

  return channels.map((channel) => ({
    ...channel,
    _id: String(channel._id),
  }));
}

export async function createChannel(data: CreateChannelInput) {
  await connectDB();

  const existingChannel = await Channel.findOne({
    nombre: data.nombre,
  });

  if (existingChannel) {
    throw new Error("Ya existe un canal con ese nombre");
  }

  const existingUrl = await Channel.findOne({
    urlOrigen: data.urlOrigen,
  });

  if (existingUrl) {
    throw new Error("Ya existe un canal con esa URL origen");
  }

  const channel = await Channel.create({
    nombre: data.nombre,
    descripcion: data.descripcion || "",
    categoria: data.categoria,
    logo: data.logo || "",
    urlOrigen: data.urlOrigen,
    estado: data.estado,
  });

  return {
    _id: String(channel._id),
    nombre: channel.nombre,
    descripcion: channel.descripcion,
    categoria: channel.categoria,
    logo: channel.logo,
    urlOrigen: channel.urlOrigen,
    estado: channel.estado,
  };
}

export async function getChannelById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de canal inválido");
  }

  const channel = await Channel.findById(id).lean();

  if (!channel) {
    throw new Error("Canal no encontrado");
  }

  return {
    ...channel,
    _id: String(channel._id),
  };
}

export async function updateChannel(id: string, data: UpdateChannelInput) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de canal inválido");
  }

  const existingChannel = await Channel.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });

  if (existingChannel) {
    throw new Error("Ya existe otro canal con ese nombre");
  }

  const existingUrl = await Channel.findOne({
    urlOrigen: data.urlOrigen,
    _id: { $ne: id },
  });

  if (existingUrl) {
    throw new Error("Ya existe otro canal con esa URL origen");
  }

  const channel = await Channel.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      categoria: data.categoria,
      logo: data.logo || "",
      urlOrigen: data.urlOrigen,
      estado: data.estado,
    },
    { new: true, runValidators: true }
  ).lean();

  if (!channel) {
    throw new Error("Canal no encontrado");
  }

  return {
    ...channel,
    _id: String(channel._id),
  };
}

export async function toggleChannelStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de canal inválido");
  }

  const channel = await Channel.findById(id);

  if (!channel) {
    throw new Error("Canal no encontrado");
  }

  channel.estado = channel.estado === "activo" ? "suspendido" : "activo";
  await channel.save();

  return {
    _id: String(channel._id),
    nombre: channel.nombre,
    descripcion: channel.descripcion,
    categoria: channel.categoria,
    logo: channel.logo,
    urlOrigen: channel.urlOrigen,
    estado: channel.estado,
  };
}