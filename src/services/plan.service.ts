import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import "@/models/Channel";
import type {
  CreatePlanInput,
  UpdatePlanInput,
} from "@/validations/plan.validation";

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function isValidObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

function normalizePopulatedChannel(channel: any) {
  if (!channel) return null;

  return {
    _id: String(channel._id),
    nombre: channel.nombre || "",
    categoria: channel.categoria || "",
    estado: channel.estado || "",
    logo: channel.logo || "",
    sourceName: channel.sourceName || "",
  };
}

function buildGridFallbackFromAllowedChannels(plan: any) {
  const allowedChannels = Array.isArray(plan.canalesPermitidos)
    ? plan.canalesPermitidos
    : [];

  return allowedChannels.map((channel: any, index: number) => {
    const normalizedChannel = normalizePopulatedChannel(channel);

    return {
      numero: index + 1,
      orden: index + 1,
      channelId: normalizedChannel,
      nombreVisible: normalizedChannel?.nombre || "",
      habilitado: true,
      logo: normalizedChannel?.logo || "",
      categoria: normalizedChannel?.categoria || "",
      sourceName: normalizedChannel?.sourceName || "",
    };
  });
}

function normalizeGrid(plan: any) {
  const existingGrid = Array.isArray(plan.grillaCanales) ? plan.grillaCanales : [];

  if (existingGrid.length > 0) {
    return existingGrid.map((item: any, index: number) => {
      const normalizedChannel =
        item.channelId && typeof item.channelId === "object"
          ? normalizePopulatedChannel(item.channelId)
          : null;

      return {
        numero: item.numero || index + 1,
        orden: item.orden || index + 1,
        channelId:
          normalizedChannel ||
          (typeof item.channelId === "string" ? item.channelId : ""),
        nombreVisible: item.nombreVisible || normalizedChannel?.nombre || "",
        habilitado: item.habilitado ?? false,
        logo: item.logo || normalizedChannel?.logo || "",
        categoria: item.categoria || normalizedChannel?.categoria || "",
        sourceName: item.sourceName || normalizedChannel?.sourceName || "",
      };
    });
  }

  return buildGridFallbackFromAllowedChannels(plan);
}

function mapPlan(plan: any) {
  const normalizedAllowedChannels = (plan.canalesPermitidos || []).map((channel: any) =>
    normalizePopulatedChannel(channel)
  );

  const normalizedGrid = normalizeGrid(plan);
  const cantidadCanales =
    plan.cantidadCanales ||
    normalizedGrid.length ||
    normalizedAllowedChannels.length ||
    1;

  return {
    ...plan,
    _id: String(plan._id),
    nombre: plan.nombre || "",
    descripcion: plan.descripcion || "",
    precio: Number(plan.precio || 0),
    conexionesPermitidas: Number(plan.conexionesPermitidas || 1),
    estado: plan.estado || "activo",
    cantidadCanales,
    canalesPermitidos: normalizedAllowedChannels,
    grillaCanales: normalizedGrid,
  };
}

function buildPersistedGrid(data: CreatePlanInput | UpdatePlanInput) {
  return data.grillaCanales.map((item) => ({
    numero: item.numero,
    orden: item.orden,
    channelId: item.channelId && isValidObjectId(item.channelId) ? item.channelId : null,
    nombreVisible: item.nombreVisible || "",
    habilitado: Boolean(item.habilitado),
    logo: item.logo || "",
    categoria: item.categoria || "",
    sourceName: item.sourceName || "",
  }));
}

function buildAllowedChannelsFromGrid(data: CreatePlanInput | UpdatePlanInput) {
  return uniqueStrings(
    data.grillaCanales
      .filter((item) => item.habilitado && item.channelId && isValidObjectId(item.channelId))
      .map((item) => item.channelId)
  );
}

export async function getAllPlans() {
  await connectDB();

  const plans = await Plan.find({})
    .populate("canalesPermitidos", "nombre categoria estado logo sourceName")
    .populate("grillaCanales.channelId", "nombre categoria estado logo sourceName")
    .sort({ createdAt: -1 })
    .lean();

  return plans.map(mapPlan);
}

export async function createPlan(data: CreatePlanInput) {
  await connectDB();

  const existingPlan = await Plan.findOne({
    nombre: data.nombre,
  });

  if (existingPlan) {
    throw new Error("Ya existe un plan con ese nombre");
  }

  const grillaCanales = buildPersistedGrid(data);
  const canalesPermitidos = buildAllowedChannelsFromGrid(data);

  const plan = await Plan.create({
    nombre: data.nombre,
    descripcion: data.descripcion || "",
    precio: data.precio ?? 0,
    estado: data.estado,
    cantidadCanales: data.cantidadCanales,
    grillaCanales,
    canalesPermitidos,
  });

  const created = await Plan.findById(plan._id)
    .populate("canalesPermitidos", "nombre categoria estado logo sourceName")
    .populate("grillaCanales.channelId", "nombre categoria estado logo sourceName")
    .lean();

  return mapPlan(created);
}

export async function getPlanById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de plan inválido");
  }

  const plan = await Plan.findById(id)
    .populate("canalesPermitidos", "nombre categoria estado logo sourceName")
    .populate("grillaCanales.channelId", "nombre categoria estado logo sourceName")
    .lean();

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  return mapPlan(plan);
}

export async function updatePlan(id: string, data: UpdatePlanInput) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de plan inválido");
  }

  const existingPlan = await Plan.findOne({
    nombre: data.nombre,
    _id: { $ne: id },
  });

  if (existingPlan) {
    throw new Error("Ya existe otro plan con ese nombre");
  }

  const grillaCanales = buildPersistedGrid(data);
  const canalesPermitidos = buildAllowedChannelsFromGrid(data);

  const updated = await Plan.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: data.precio ?? 0,
      estado: data.estado,
      cantidadCanales: data.cantidadCanales,
      grillaCanales,
      canalesPermitidos,
    },
    { new: true, runValidators: true }
  )
    .populate("canalesPermitidos", "nombre categoria estado logo sourceName")
    .populate("grillaCanales.channelId", "nombre categoria estado logo sourceName")
    .lean();

  if (!updated) {
    throw new Error("Plan no encontrado");
  }

  return mapPlan(updated);
}

export async function togglePlanStatus(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de plan inválido");
  }

  const plan = await Plan.findById(id);

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  plan.estado = plan.estado === "activo" ? "suspendido" : "activo";
  await plan.save();

  const updated = await Plan.findById(id)
    .populate("canalesPermitidos", "nombre categoria estado logo sourceName")
    .populate("grillaCanales.channelId", "nombre categoria estado logo sourceName")
    .lean();

  return mapPlan(updated);
}