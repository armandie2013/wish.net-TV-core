"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

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

type StreamingNodeDashboard = {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  host?: string;
  puerto?: number;
  estado: string;
  habilitado: boolean;
  healthStatus?: "unknown" | "online" | "offline" | string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [nodes, setNodes] = useState<StreamingNodeDashboard[]>([]);
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

    async function loadStreamingNodes() {
      try {
        const res = await fetch("/api/configuracion/streaming", {
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) return;

        if (mounted && data?.ok && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
        }
      } catch {
        // no-op
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
    loadStreamingNodes();

    const heartbeatInterval = setInterval(sendHeartbeat, 60_000);
    const statsInterval = setInterval(loadStats, 60_000);
    const nodesInterval = setInterval(loadStreamingNodes, 60_000);

    return () => {
      mounted = false;
      clearInterval(heartbeatInterval);
      clearInterval(statsInterval);
      clearInterval(nodesInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-100 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
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
          <SystemStreamingStatus nodes={nodes} />
        </div>
      </div>
    </div>
  );
}

/* ================= CARDS ================= */

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
      ? "text-blue-700 dark:text-cyan-400"
      : color === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : color === "red"
          ? "text-red-600 dark:text-red-400"
          : "text-slate-900 dark:text-white";

  const lineClass =
    color === "cyan"
      ? "bg-blue-400 dark:bg-cyan-500/40"
      : color === "emerald"
        ? "bg-emerald-400 dark:bg-emerald-500/40"
        : color === "red"
          ? "bg-red-400 dark:bg-red-500/40"
          : "bg-slate-400 dark:bg-slate-500/30";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
      <div className={`absolute left-0 top-0 h-[2px] w-full ${lineClass}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className={`mt-3 text-2xl font-bold sm:text-3xl ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}

/* ================= BOX ================= */

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
      <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ================= STREAMING STATUS ================= */

function SystemStreamingStatus({
  nodes,
}: {
  nodes: StreamingNodeDashboard[];
}) {
  const sortedNodes = useMemo(() => {
    const priorityByType: Record<string, number> = {
      origin: 0,
      edge: 1,
    };

    return [...nodes].sort((a, b) => {
      const typeA = String(a.tipo || "").toLowerCase();
      const typeB = String(b.tipo || "").toLowerCase();

      const priorityA = priorityByType[typeA] ?? 99;
      const priorityB = priorityByType[typeB] ?? 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return String(a.codigo || "").localeCompare(String(b.codigo || ""), "es", {
        sensitivity: "base",
      });
    });
  }, [nodes]);

  return (
    <Box title="Estado del sistema">
      <div className="space-y-2">
        <div className="grid grid-cols-[1.15fr_0.75fr_1fr_0.65fr_0.8fr] gap-2 border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>Código</span>
          <span>Tipo</span>
          <span>IP</span>
          <span>Puerto</span>
          <span className="text-right">Health</span>
        </div>

        {sortedNodes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            No hay nodos de streaming cargados.
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedNodes.map((node) => (
              <div
                key={node._id}
                className="grid grid-cols-[1.15fr_0.75fr_1fr_0.65fr_0.8fr] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="min-w-0">
                  <p
                    className="truncate font-semibold text-slate-800 dark:text-slate-200"
                    title={node.codigo}
                  >
                    {node.codigo}
                  </p>
                </div>

                <div>
                  <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                    {node.tipo}
                  </span>
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-slate-600 dark:text-slate-400"
                    title={node.host || "-"}
                  >
                    {node.host || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {node.puerto ?? "-"}
                  </p>
                </div>

                <div className="flex justify-end">
                  <HealthBadge healthStatus={node.healthStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Box>
  );
}

function HealthBadge({
  healthStatus,
}: {
  healthStatus?: "unknown" | "online" | "offline" | string;
}) {
  const status = String(healthStatus || "unknown").toLowerCase();

  const className =
    status === "online"
      ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
      : status === "offline"
        ? "border-red-300 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        : "border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400";

  const label =
    status === "online"
      ? "ONLINE"
      : status === "offline"
        ? "OFFLINE"
        : "UNKNOWN";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

/* ================= TABLA ================= */

function OnlineUsersTable({ users }: { users: OnlineUser[] }) {
  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Usuarios online
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Actividad detectada en los últimos 2 minutos.
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-900/95">
            <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800">
              <th className="px-3 py-3">Usuario</th>
              <th className="px-3 py-3">Rol</th>
              <th className="px-3 py-3">Localidad</th>
              <th className="px-3 py-3">Última actividad</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No hay usuarios online.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-200 dark:border-slate-800"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {user.nombre}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                    {user.localidad || "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
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

/* ================= EVENTOS ================= */

function RecentEvents({ logs }: { logs: RecentLog[] }) {
  return (
    <div className="flex h-[260px] flex-col rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        Eventos recientes
      </h3>

      <div className="mt-3 flex-1 space-y-3 overflow-auto">
        {logs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            Todavía no hay eventos registrados.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {log.message}
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {log.actorName || "Sistema"}
                  {log.actorEmail ? ` · ${log.actorEmail}` : ""}
                </p>

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

/* ================= UTILS ================= */

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