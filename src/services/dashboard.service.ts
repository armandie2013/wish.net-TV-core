import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ActiveConnection from "@/models/ActiveConnection";
import "@/models/Plan";
import "@/models/Channel";
import { getRecentSystemLogs } from "@/services/system-log.service";

export async function getDashboardStats() {
  await connectDB();

  const now = new Date();
  const onlineThreshold = new Date(now.getTime() - 2 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    onlineUsersList,
    usersRaw,
    activeConnectionsRaw,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ estado: "activo" }),
    User.countDocuments({ estado: "suspendido" }),

    User.find({
      estado: "activo",
      lastSeen: { $gte: onlineThreshold },
    })
      .select("nombre email rol estado localidad lastSeen")
      .sort({ lastSeen: -1 })
      .lean(),

    User.find()
      .select(
        "nombre email rol estado localidad conexionesPermitidas lastSeen planId"
      )
      .populate("planId", "nombre")
      .sort({ nombre: 1 })
      .lean(),

    ActiveConnection.find({
      expiresAt: { $gt: now },
    })
      .populate("userId", "nombre email rol estado localidad conexionesPermitidas")
      .populate("channelId", "nombre name numero")
      .sort({ lastSeenAt: -1 })
      .lean(),

    getRecentSystemLogs(8),
  ]);

  const activeByUser = new Map<string, any[]>();

  for (const connection of activeConnectionsRaw as any[]) {
    const userId =
      typeof connection.userId === "object"
        ? connection.userId?._id?.toString()
        : connection.userId?.toString();

    if (!userId) continue;

    if (!activeByUser.has(userId)) {
      activeByUser.set(userId, []);
    }

    activeByUser.get(userId)?.push(connection);
  }

  const connectionsByAccount = (usersRaw as any[]).map((user) => {
    const userId = String(user._id);
    const devices = activeByUser.get(userId) || [];

    const conexionesPermitidas = Math.max(
      Number(user.conexionesPermitidas || 1),
      1
    );

    const conexionesActivas = devices.length;

    const planName =
      typeof user.planId === "object" && user.planId?.nombre
        ? user.planId.nombre
        : "-";

    return {
      _id: userId,
      nombre: user.nombre || "-",
      email: user.email || "-",
      rol: user.rol || "-",
      estado: user.estado || "-",
      localidad: user.localidad || "-",
      plan: planName,
      conexionesPermitidas,
      conexionesActivas,
      alLimite:
        conexionesActivas >= conexionesPermitidas && conexionesActivas > 0,
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toISOString() : null,
      devices: devices.map((device: any) => ({
        deviceId: device.deviceId || "-",
        ip: device.ip || "-",
        channelName:
          device.channelName ||
          device.channelId?.nombre ||
          device.channelId?.name ||
          "-",
        strategy: device.strategy || "-",
        nodeCode: device.nodeCode || "-",
        nodeName: device.nodeName || "-",
        lastSeenAt: device.lastSeenAt
          ? new Date(device.lastSeenAt).toISOString()
          : null,
      })),
    };
  });

  const conexionesPermitidasTotal = connectionsByAccount.reduce(
    (acc, user) => acc + Number(user.conexionesPermitidas || 0),
    0
  );

  const conexionesActivasTotal = activeConnectionsRaw.length;

  const cuentasAlLimite = connectionsByAccount.filter(
    (user) => user.alLimite
  ).length;

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    onlineUsers: onlineUsersList.length,

    conexionesPermitidasTotal,
    conexionesActivasTotal,
    cuentasAlLimite,

    streamsActivos: 0,
    conexiones: conexionesActivasTotal,
    errores: 0,

    recentLogs,

    onlineUsersList: onlineUsersList.map((user: any) => ({
      _id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
      localidad: user.localidad ?? "-",
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toISOString() : null,
    })),

    connectionsByAccount,
  };
}