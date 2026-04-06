import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import "@/models/Channel";
import type {
  CreatePlanInput,
  UpdatePlanInput,
} from "@/validations/plan.validation";

export async function getAllPlans() {
  await connectDB();

  const plans = await Plan.find({})
    .populate("canalesPermitidos", "nombre categoria estado")
    .sort({ createdAt: -1 })
    .lean();

  return plans.map((plan: any) => ({
    ...plan,
    _id: String(plan._id),
    canalesPermitidos: (plan.canalesPermitidos || []).map((channel: any) => ({
      _id: String(channel._id),
      nombre: channel.nombre,
      categoria: channel.categoria,
      estado: channel.estado,
    })),
  }));
}

export async function createPlan(data: CreatePlanInput) {
  await connectDB();

  const existingPlan = await Plan.findOne({
    nombre: data.nombre,
  });

  if (existingPlan) {
    throw new Error("Ya existe un plan con ese nombre");
  }

  const plan = await Plan.create({
    nombre: data.nombre,
    descripcion: data.descripcion || "",
    precio: data.precio,
    conexionesPermitidas: data.conexionesPermitidas,
    estado: data.estado,
    canalesPermitidos: data.canalesPermitidos || [],
  });

  return {
    _id: String(plan._id),
    nombre: plan.nombre,
    descripcion: plan.descripcion,
    precio: plan.precio,
    conexionesPermitidas: plan.conexionesPermitidas,
    estado: plan.estado,
    canalesPermitidos: (plan.canalesPermitidos || []).map(String),
  };
}

export async function getPlanById(id: string) {
  await connectDB();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID de plan inválido");
  }

  const plan = await Plan.findById(id)
    .populate("canalesPermitidos", "nombre categoria estado")
    .lean();

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  return {
    ...plan,
    _id: String((plan as any)._id),
    canalesPermitidos: ((plan as any).canalesPermitidos || []).map(
      (channel: any) => ({
        _id: String(channel._id),
        nombre: channel.nombre,
        categoria: channel.categoria,
        estado: channel.estado,
      })
    ),
  };
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

  const plan = await Plan.findByIdAndUpdate(
    id,
    {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: data.precio,
      conexionesPermitidas: data.conexionesPermitidas,
      estado: data.estado,
      canalesPermitidos: data.canalesPermitidos || [],
    },
    { new: true, runValidators: true }
  )
    .populate("canalesPermitidos", "nombre categoria estado")
    .lean();

  if (!plan) {
    throw new Error("Plan no encontrado");
  }

  return {
    ...plan,
    _id: String((plan as any)._id),
    canalesPermitidos: ((plan as any).canalesPermitidos || []).map(
      (channel: any) => ({
        _id: String(channel._id),
        nombre: channel.nombre,
        categoria: channel.categoria,
        estado: channel.estado,
      })
    ),
  };
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

  return {
    _id: String(plan._id),
    nombre: plan.nombre,
    descripcion: plan.descripcion,
    precio: plan.precio,
    conexionesPermitidas: plan.conexionesPermitidas,
    estado: plan.estado,
    canalesPermitidos: (plan.canalesPermitidos || []).map(String),
  };
}