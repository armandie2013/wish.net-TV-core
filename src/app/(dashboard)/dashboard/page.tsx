"use client";

import { useEffect, useState } from "react";

type OnlineUser = {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  localidad?: string;
  lastSeen: string | null;
};

type RecentLog = {
  _id: string;
  action: string;
  message: string;
  actorName: string | null;
  actorEmail: string | null;
  targetName: string | null;
  targetEmail: string | null;
  createdAt: string | null;
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  onlineUsers: number;
  streamsActivos: number;
  conexiones: number;
  errores: number;
  onlineUsersList: OnlineUser[];
  recentLogs: RecentLog[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          if (mounted) {
            setError(data?.message || "Error al cargar dashboard");
          }
          return;
        }

        if (mounted && data.ok) {
          setStats(data.stats);
          setError("");
        }
      } catch {
        if (mounted) {
          setError("No se pudo conectar con /api/dashboard");
        }
      }
    }

    async function sendHeartbeat() {
      try {
        await fetch("/api/presence", {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }

    sendHeartbeat();
    loadStats();

    const heartbeatInterval = setInterval(sendHeartbeat, 60_000);
    const statsInterval = setInterval(loadStats, 60_000);

    return () => {
      mounted = false;
      clearInterval(heartbeatInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="USUARIOS ONLINE"
          value={stats?.onlineUsers ?? "-"}
          color="cyan"
        />
        <Card
          title="USUARIOS ACTIVOS"
          value={stats?.activeUsers ?? "-"}
          color="emerald"
        />
        <Card
          title="USUARIOS SUSPENDIDOS"
          value={stats?.suspendedUsers ?? "-"}
          color="red"
        />
        <Card title="USUARIOS TOTALES" value={stats?.totalUsers ?? "-"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <OnlineUsersTable users={stats?.onlineUsersList ?? []} />

        <div className="grid gap-4">
          <RecentEvents logs={stats?.recentLogs ?? []} />
          <Box title="Estado del sistema">
            <Status label="API" status="ok" />
            <Status label="Dashboard" status="ok" />
            <Status label="Base de datos" status="warning" />
          </Box>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color = "default",
}: {
  title: string;
  value: number | string;
  color?: "default" | "cyan" | "emerald" | "red";
}) {
  const colorClass =
    color === "cyan"
      ? "text-cyan-400"
      : color === "emerald"
      ? "text-emerald-400"
      : color === "red"
      ? "text-red-400"
      : "text-white";

  const lineClass =
    color === "cyan"
      ? "bg-cyan-500/40"
      : color === "emerald"
      ? "bg-emerald-500/40"
      : color === "red"
      ? "bg-red-500/40"
      : "bg-slate-500/30";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className={`absolute left-0 top-0 h-[2px] w-full ${lineClass}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className={`mt-3 text-2xl font-bold sm:text-3xl ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}

function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      {children}
    </div>
  );
}

function Status({
  label,
  status,
}: {
  label: string;
  status: "ok" | "warning" | "error";
}) {
  const color =
    status === "ok"
      ? "text-emerald-400"
      : status === "warning"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="flex justify-between text-sm text-slate-300">
      <span>{label}</span>
      <span className={`font-semibold ${color}`}>{status.toUpperCase()}</span>
    </div>
  );
}

function OnlineUsersTable({ users }: { users: OnlineUser[] }) {
  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-slate-200">
          Usuarios online
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Actividad detectada en los últimos 2 minutos.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur">
            <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <th className="px-3 py-3 font-semibold">Usuario</th>
              <th className="px-3 py-3 font-semibold">Rol</th>
              <th className="px-3 py-3 font-semibold">Localidad</th>
              <th className="px-3 py-3 font-semibold">Última actividad</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-sm text-slate-500"
                >
                  No hay usuarios online en este momento.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-800/80 text-slate-300 last:border-b-0"
                >
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-slate-100">{user.nombre}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-400">
                    {user.localidad || "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-400">
                    {formatLastSeen(user.lastSeen)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentEvents({ logs }: { logs: RecentLog[] }) {
  return (
    <div className="flex h-[260px] flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-slate-200">
          Eventos recientes
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Últimos movimientos registrados en el sistema.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay eventos registrados.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {log.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {log.actorName || "Sistema"}
                    {log.actorEmail ? ` · ${log.actorEmail}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-500">
                  {formatLastSeen(log.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatLastSeen(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}





// "use client";

// import { useEffect, useState } from "react";

// type OnlineUser = {
//   _id: string;
//   nombre: string;
//   email: string;
//   rol: string;
//   estado: string;
//   localidad?: string;
//   lastSeen: string | null;
// };

// type RecentLog = {
//   _id: string;
//   action: string;
//   message: string;
//   actorName: string | null;
//   actorEmail: string | null;
//   targetName: string | null;
//   targetEmail: string | null;
//   createdAt: string | null;
// };

// type Stats = {
//   totalUsers: number;
//   activeUsers: number;
//   suspendedUsers: number;
//   onlineUsers: number;
//   streamsActivos: number;
//   conexiones: number;
//   errores: number;
//   onlineUsersList: OnlineUser[];
//   recentLogs: RecentLog[];
// };

// export default function DashboardPage() {
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     let mounted = true;

//     async function loadStats() {
//       try {
//         const res = await fetch("/api/dashboard", {
//           credentials: "include",
//           cache: "no-store",
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           if (mounted) {
//             setError(data?.message || "Error al cargar dashboard");
//           }
//           return;
//         }

//         if (mounted && data.ok) {
//           setStats(data.stats);
//           setError("");
//         }
//       } catch (err) {
//         if (mounted) {
//           setError("No se pudo conectar con /api/dashboard");
//         }
//       }
//     }

//     async function sendHeartbeat() {
//       try {
//         await fetch("/api/presence", {
//           method: "POST",
//           credentials: "include",
//         });
//       } catch {}
//     }

//     sendHeartbeat();
//     loadStats();

//     const heartbeatInterval = setInterval(sendHeartbeat, 60_000);
//     const statsInterval = setInterval(loadStats, 60_000);

//     return () => {
//       mounted = false;
//       clearInterval(heartbeatInterval);
//       clearInterval(statsInterval);
//     };
//   }, []);

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
//           {error}
//         </div>
//       )}

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <Card
//           title="USUARIOS ONLINE"
//           value={stats?.onlineUsers ?? "-"}
//           color="cyan"
//         />
//         <Card
//           title="USUARIOS ACTIVOS"
//           value={stats?.activeUsers ?? "-"}
//           color="emerald"
//         />
//         <Card
//           title="USUARIOS SUSPENDIDOS"
//           value={stats?.suspendedUsers ?? "-"}
//           color="red"
//         />
//         <Card title="USUARIOS TOTALES" value={stats?.totalUsers ?? "-"} />
//       </div>

//       <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
//         <OnlineUsersTable users={stats?.onlineUsersList ?? []} />

//         <div className="space-y-4">
//           <RecentEvents logs={stats?.recentLogs ?? []} />

//           <Box title="Estado del sistema">
//             <Status label="API" status="ok" />
//             <Status label="Dashboard" status="ok" />
//             <Status label="Base de datos" status="warning" />
//           </Box>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Card({
//   title,
//   value,
//   color = "default",
// }: {
//   title: string;
//   value: number | string;
//   color?: "default" | "cyan" | "emerald" | "red";
// }) {
//   const colorClass =
//     color === "cyan"
//       ? "text-cyan-400"
//       : color === "emerald"
//       ? "text-emerald-400"
//       : color === "red"
//       ? "text-red-400"
//       : "text-white";

//   const lineClass =
//     color === "cyan"
//       ? "bg-cyan-500/40"
//       : color === "emerald"
//       ? "bg-emerald-500/40"
//       : color === "red"
//       ? "bg-red-500/40"
//       : "bg-slate-500/30";

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
//       <div className={`absolute left-0 top-0 h-[2px] w-full ${lineClass}`} />
//       <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
//         {title}
//       </p>
//       <p className={`mt-3 text-2xl font-bold sm:text-3xl ${colorClass}`}>
//         {value}
//       </p>
//     </div>
//   );
// }

// function Box({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
//       <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
//       {children}
//     </div>
//   );
// }

// function Status({
//   label,
//   status,
// }: {
//   label: string;
//   status: "ok" | "warning" | "error";
// }) {
//   const color =
//     status === "ok"
//       ? "text-emerald-400"
//       : status === "warning"
//       ? "text-yellow-400"
//       : "text-red-400";

//   return (
//     <div className="flex justify-between text-sm text-slate-300">
//       <span>{label}</span>
//       <span className={`font-semibold ${color}`}>{status.toUpperCase()}</span>
//     </div>
//   );
// }

// function OnlineUsersTable({ users }: { users: OnlineUser[] }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
//       <div className="mb-4">
//         <h3 className="text-sm font-semibold text-slate-200">
//           Usuarios online
//         </h3>
//         <p className="mt-1 text-xs text-slate-500">
//           Actividad detectada en los últimos 2 minutos.
//         </p>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead>
//             <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
//               <th className="px-3 py-3 font-semibold">Usuario</th>
//               <th className="px-3 py-3 font-semibold">Rol</th>
//               <th className="px-3 py-3 font-semibold">Localidad</th>
//               <th className="px-3 py-3 font-semibold">Última actividad</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={4}
//                   className="px-3 py-8 text-center text-sm text-slate-500"
//                 >
//                   No hay usuarios online en este momento.
//                 </td>
//               </tr>
//             ) : (
//               users.map((user) => (
//                 <tr
//                   key={user._id}
//                   className="border-b border-slate-800/80 text-slate-300 last:border-b-0"
//                 >
//                   <td className="px-3 py-3">
//                     <div>
//                       <p className="font-medium text-slate-100">{user.nombre}</p>
//                       <p className="text-xs text-slate-500">{user.email}</p>
//                     </div>
//                   </td>
//                   <td className="px-3 py-3">
//                     <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
//                       {user.rol}
//                     </span>
//                   </td>
//                   <td className="px-3 py-3 text-slate-400">
//                     {user.localidad || "-"}
//                   </td>
//                   <td className="px-3 py-3 text-slate-400">
//                     {formatLastSeen(user.lastSeen)}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function RecentEvents({ logs }: { logs: RecentLog[] }) {
//   return (
//     <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
//       <div className="mb-4">
//         <h3 className="text-sm font-semibold text-slate-200">
//           Eventos recientes
//         </h3>
//         <p className="mt-1 text-xs text-slate-500">
//           Últimos movimientos registrados en el sistema.
//         </p>
//       </div>

//       <div className="space-y-3">
//         {logs.length === 0 ? (
//           <p className="text-sm text-slate-500">
//             Todavía no hay eventos registrados.
//           </p>
//         ) : (
//           logs.map((log) => (
//             <div
//               key={log._id}
//               className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <p className="text-sm font-medium text-slate-200">
//                     {log.message}
//                   </p>
//                   <p className="mt-1 text-xs text-slate-500">
//                     {log.actorName || "Sistema"}
//                     {log.actorEmail ? ` · ${log.actorEmail}` : ""}
//                   </p>
//                 </div>
//                 <span className="shrink-0 text-[11px] text-slate-500">
//                   {formatLastSeen(log.createdAt)}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// function formatLastSeen(value: string | null) {
//   if (!value) return "-";

//   const date = new Date(value);

//   return date.toLocaleString("es-AR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }