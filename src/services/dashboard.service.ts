import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getRecentSystemLogs } from "@/services/system-log.service";

export async function getDashboardStats() {
  await connectDB();

  const now = new Date();
  const onlineThreshold = new Date(now.getTime() - 2 * 60 * 1000);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ estado: "activo" });
  const suspendedUsers = await User.countDocuments({ estado: "suspendido" });

  const onlineUsers = await User.countDocuments({
    estado: "activo",
    lastSeen: { $gte: onlineThreshold },
  });

  const onlineUsersList = await User.find({
    estado: "activo",
    lastSeen: { $gte: onlineThreshold },
  })
    .select("nombre email rol estado localidad lastSeen")
    .sort({ lastSeen: -1 })
    .lean();

  const recentLogs = await getRecentSystemLogs(8);

  const streamsActivos = 0;
  const conexiones = 0;
  const errores = 0;

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    onlineUsers,
    streamsActivos,
    conexiones,
    errores,
    recentLogs,
    onlineUsersList: onlineUsersList.map((user) => ({
      _id: String(user._id),
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
      localidad: user.localidad ?? "-",
      lastSeen: user.lastSeen ? new Date(user.lastSeen).toISOString() : null,
    })),
  };
}