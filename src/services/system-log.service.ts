import { connectDB } from "@/lib/db";
import SystemLog from "@/models/SystemLog";

type CreateSystemLogInput = {
  action: string;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  targetEmail?: string | null;
  meta?: Record<string, unknown> | null;
};

export async function createSystemLog(data: CreateSystemLogInput) {
  try {
    await connectDB();

    await SystemLog.create({
      action: data.action,
      message: data.message,
      actorId: data.actorId ?? null,
      actorName: data.actorName ?? null,
      actorEmail: data.actorEmail ?? null,
      targetId: data.targetId ?? null,
      targetName: data.targetName ?? null,
      targetEmail: data.targetEmail ?? null,
      meta: data.meta ?? null,
    });
  } catch (error) {
    console.error("Error al crear log del sistema:", error);
  }
}

export async function getRecentSystemLogs(limit = 8) {
  await connectDB();

  const logs = await SystemLog.find({})
    .select(
      "action message actorName actorEmail targetName targetEmail createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map((log) => ({
    _id: String(log._id),
    action: log.action,
    message: log.message,
    actorName: log.actorName ?? null,
    actorEmail: log.actorEmail ?? null,
    targetName: log.targetName ?? null,
    targetEmail: log.targetEmail ?? null,
    createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : null,
  }));
}