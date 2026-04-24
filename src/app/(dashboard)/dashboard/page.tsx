"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type OnlineUser = {
  _id: string;
  nombre: string;
  email: string;
  rol?: string;
  estado?: string;
  localidad?: string;
  lastSeen: string | null;
};

type AccountDevice = {
  deviceId: string;
  ip: string;
  channelName: string;
  strategy: string;
  nodeCode: string;
  nodeName: string;
  lastSeenAt: string | null;
};

type AccountConnection = {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  localidad?: string;
  plan?: string;
  conexionesPermitidas: number;
  conexionesActivas: number;
  alLimite: boolean;
  lastSeen: string | null;
  devices: AccountDevice[];
};

type RecentLog = {
  _id: string;
  action: string;
  message: string;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: string | null;
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  onlineUsers: number;
  conexionesPermitidasTotal: number;
  conexionesActivasTotal: number;
  cuentasAlLimite: number;
  streamsActivos: number;
  onlineUsersList: OnlineUser[];
  recentLogs: RecentLog[];
  connectionsByAccount: AccountConnection[];
};

type StreamingNodeDashboard = {
  _id: string;
  nombre?: string;
  codigo: string;
  tipo: string;
  host?: string;
  puerto?: number;
  estado?: string;
  habilitado?: boolean;
  healthStatus?: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [nodes, setNodes] = useState<StreamingNodeDashboard[]>([]);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      const res = await fetch("/api/dashboard", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Error al cargar dashboard");
        return;
      }

      if (data.ok) {
        setStats(data.stats);
        setError("");
      }
    } catch {
      setError("No se pudo conectar con /api/dashboard");
    }
  }

  async function loadNodes() {
    try {
      const res = await fetch("/api/configuracion/streaming", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data?.ok && Array.isArray(data.nodes)) {
        setNodes(data.nodes);
      }
    } catch {}
  }

  async function sendHeartbeat() {
    try {
      await fetch("/api/presence", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {}
  }

  useEffect(() => {
    sendHeartbeat();
    loadStats();
    loadNodes();

    const heartbeatInterval = setInterval(sendHeartbeat, 60_000);
    const statsInterval = setInterval(loadStats, 15_000);
    const nodesInterval = setInterval(loadNodes, 45_000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(statsInterval);
      clearInterval(nodesInterval);
    };
  }, []);

  const sortedAccounts = useMemo(() => {
    const accounts = stats?.connectionsByAccount ?? [];

    return [...accounts].sort((a, b) => {
      if (a.alLimite && !b.alLimite) return -1;
      if (!a.alLimite && b.alLimite) return 1;

      if (a.conexionesActivas !== b.conexionesActivas) {
        return b.conexionesActivas - a.conexionesActivas;
      }

      return a.nombre.localeCompare(b.nombre, "es");
    });
  }, [stats]);

  const sortedNodes = useMemo(() => {
    const priority: Record<string, number> = {
      origin: 0,
      edge: 1,
    };

    return [...nodes].sort((a, b) => {
      const pa = priority[String(a.tipo || "").toLowerCase()] ?? 99;
      const pb = priority[String(b.tipo || "").toLowerCase()] ?? 99;

      if (pa !== pb) return pa - pb;

      return String(a.codigo || "").localeCompare(String(b.codigo || ""), "es");
    });
  }, [nodes]);

  const usagePercent = stats
    ? Math.round(
        (stats.conexionesActivasTotal /
          Math.max(stats.conexionesPermitidasTotal || 1, 1)) *
          100
      )
    : 0;

  const offlineNodes = sortedNodes.filter(
    (node) => String(node.healthStatus || "").toLowerCase() === "offline"
  ).length;

  return (
    <div className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        <Kpi
          title="Online"
          value={stats?.onlineUsers ?? "-"}
          desc="Usuarios activos"
          tone="cyan"
        />
        <Kpi
          title="Usuarios"
          value={stats?.totalUsers ?? "-"}
          desc="Registrados"
        />
        <Kpi
          title="Activos"
          value={stats?.activeUsers ?? "-"}
          desc="Habilitados"
          tone="green"
        />
        <Kpi
          title="Suspend."
          value={stats?.suspendedUsers ?? "-"}
          desc="Bloqueados"
          tone="red"
        />
        <Kpi
          title="Conex."
          value={stats?.conexionesActivasTotal ?? "-"}
          desc="Streams activos"
          tone="cyan"
        />
        <Kpi
          title="Capacidad"
          value={stats?.conexionesPermitidasTotal ?? "-"}
          desc="Total disponible"
        />
        <Kpi
          title="Saturadas"
          value={stats?.cuentasAlLimite ?? "-"}
          desc="Cuentas límite"
          tone="amber"
        />
        <Kpi
          title="Nodos off"
          value={offlineNodes}
          desc="Infra caída"
          tone={offlineNodes > 0 ? "red" : "green"}
        />
      </section>

      <section className="rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <span className="w-28 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Salud red
          </span>

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full ${
                usagePercent >= 90
                  ? "bg-red-500 dark:bg-red-400"
                  : usagePercent >= 70
                    ? "bg-amber-500 dark:bg-amber-400"
                    : "bg-emerald-500 dark:bg-emerald-400"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>

          <span className="w-16 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
            {usagePercent}%
          </span>

          <span className="hidden w-44 text-right text-[11px] text-slate-500 dark:text-slate-400 sm:block">
            {stats?.conexionesActivasTotal ?? 0}/
            {stats?.conexionesPermitidasTotal ?? 0} conexiones
          </span>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.7fr_0.8fr]">
        <Panel title="Conexiones">
          <ConnectionsTable accounts={sortedAccounts} />
        </Panel>

        <div className="grid gap-3">
          <Panel title="Nodos">
            <Nodes nodes={sortedNodes} />
          </Panel>

          <Panel title="Usuarios online">
            <Online users={stats?.onlineUsersList ?? []} />
          </Panel>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <Panel title="Eventos recientes">
          <RecentEvents logs={stats?.recentLogs ?? []} />
        </Panel>

        <Panel title="Cuentas al límite / en uso">
          <AccountsCompact
            accounts={sortedAccounts.filter(
              (a) => a.alLimite || a.conexionesActivas > 0
            )}
          />
        </Panel>
      </section>
    </div>
  );
}

function Kpi({
  title,
  value,
  desc,
  tone = "neutral",
}: {
  title: string;
  value: ReactNode;
  desc: string;
  tone?: "neutral" | "cyan" | "green" | "red" | "amber";
}) {
  const valueClass =
    tone === "cyan"
      ? "text-cyan-700 dark:text-cyan-200"
      : tone === "green"
        ? "text-emerald-700 dark:text-emerald-200"
        : tone === "red"
          ? "text-red-700 dark:text-red-200"
          : tone === "amber"
            ? "text-amber-700 dark:text-amber-200"
            : "text-slate-900 dark:text-slate-100";

  const borderClass =
    tone === "cyan"
      ? "border-cyan-300/70 dark:border-cyan-500/20"
      : tone === "green"
        ? "border-emerald-300/70 dark:border-emerald-500/20"
        : tone === "red"
          ? "border-red-300/70 dark:border-red-500/20"
          : tone === "amber"
            ? "border-amber-300/70 dark:border-amber-500/20"
            : "border-slate-300 dark:border-slate-800";

  return (
    <div
      className={`rounded-lg border ${borderClass} bg-white px-2 py-2 shadow-sm dark:bg-slate-900/60`}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className={`text-lg font-semibold leading-tight ${valueClass}`}>
        {value}
      </div>
      <div className="text-[10px] leading-tight text-slate-500 dark:text-slate-500">
        {desc}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {title}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function ConnectionsTable({ accounts }: { accounts: AccountConnection[] }) {
  return (
    <div className="max-h-[430px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
      <table className="w-full text-[11px]">
        <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          <tr>
            <th className="px-2 py-2 text-left">Cuenta</th>
            <th className="px-2 py-2 text-left">Plan</th>
            <th className="px-2 py-2 text-center">Uso</th>
            <th className="px-2 py-2 text-center">Estado</th>
            <th className="px-2 py-2 text-left">Canal / dispositivo</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-2 py-6 text-center text-slate-500">
                No hay cuentas para mostrar.
              </td>
            </tr>
          ) : (
            accounts.map((a, i) => (
              <tr
                key={a._id}
                className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                  i % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                }`}
              >
                <td className="px-2 py-2">
                  <div className="max-w-[180px] truncate font-medium text-slate-900 dark:text-white">
                    {a.nombre}
                  </div>
                  <div className="max-w-[180px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {a.email}
                  </div>
                </td>

                <td className="px-2 py-2 text-slate-600 dark:text-slate-300">
                  <span className="block max-w-[90px] truncate">
                    {a.plan || "-"}
                  </span>
                </td>

                <td className="px-2 py-2 text-center">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {a.conexionesActivas}/{a.conexionesPermitidas}
                  </span>
                  <div className="mx-auto mt-1 h-1 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full ${
                        a.alLimite
                          ? "bg-red-500 dark:bg-red-400"
                          : a.conexionesActivas > 0
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-400 dark:bg-slate-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.round(
                            (a.conexionesActivas /
                              Math.max(a.conexionesPermitidas, 1)) *
                              100
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </td>

                <td className="px-2 py-2 text-center">
                  {a.conexionesActivas === 0 ? (
                    <Badge tone="slate">OFF</Badge>
                  ) : a.alLimite ? (
                    <Badge tone="red">LÍMITE</Badge>
                  ) : (
                    <Badge tone="green">ON</Badge>
                  )}
                </td>

                <td className="px-2 py-2">
                  {a.devices?.length === 0 ? (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Última: {formatDate(a.lastSeen)}
                    </span>
                  ) : (
                    <div className="space-y-1">
                      {a.devices.slice(0, 2).map((device) => (
                        <div
                          key={device.deviceId}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800/70 dark:bg-slate-950/35"
                        >
                          <p className="max-w-[260px] truncate text-[11px] font-medium text-slate-900 dark:text-slate-100">
                            {device.channelName || "-"}
                          </p>
                          <p className="max-w-[260px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                            {device.ip || "-"} ·{" "}
                            {device.nodeCode || device.nodeName || "-"} ·{" "}
                            {formatDate(device.lastSeenAt)}
                          </p>
                        </div>
                      ))}
                      {a.devices.length > 2 && (
                        <p className="text-[10px] text-slate-500">
                          +{a.devices.length - 2} más
                        </p>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Nodes({ nodes }: { nodes: StreamingNodeDashboard[] }) {
  if (nodes.length === 0) {
    return <Empty>No hay nodos cargados.</Empty>;
  }

  return (
    <div className="max-h-[170px] space-y-1 overflow-auto">
      {nodes.map((n) => {
        const status = String(n.healthStatus || "unknown").toLowerCase();

        return (
          <div
            key={n._id}
            className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800/70 dark:bg-slate-950/30"
          >
            <div className="min-w-0">
              <div className="truncate text-[11px] font-medium text-slate-900 dark:text-white">
                {n.codigo}
              </div>
              <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {n.tipo} · {n.host || "-"}:{n.puerto ?? "-"}
              </div>
            </div>

            <Badge
              tone={
                status === "online"
                  ? "green"
                  : status === "offline"
                    ? "red"
                    : "slate"
              }
            >
              {status}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

function Online({ users }: { users: OnlineUser[] }) {
  if (users.length === 0) {
    return <Empty>No hay usuarios online.</Empty>;
  }

  return (
    <div className="max-h-[170px] space-y-1 overflow-auto">
      {users.map((u) => (
        <div
          key={u._id}
          className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800/70 dark:bg-slate-950/30"
        >
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium text-slate-900 dark:text-white">
              {u.nombre}
            </div>
            <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              {u.email} · {u.localidad || "-"}
            </div>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-500">
            {formatTime(u.lastSeen)}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentEvents({ logs }: { logs: RecentLog[] }) {
  if (logs.length === 0) {
    return <Empty>No hay eventos recientes.</Empty>;
  }

  return (
    <div className="max-h-[170px] space-y-1 overflow-auto">
      {logs.map((log) => (
        <div
          key={log._id}
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800/70 dark:bg-slate-950/30"
        >
          <p className="truncate text-[11px] text-slate-800 dark:text-slate-200">
            {log.message}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500">
            {log.actorName || "Sistema"} · {formatDate(log.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

function AccountsCompact({ accounts }: { accounts: AccountConnection[] }) {
  if (accounts.length === 0) {
    return <Empty>No hay cuentas en uso.</Empty>;
  }

  return (
    <div className="grid max-h-[170px] gap-1 overflow-auto sm:grid-cols-2">
      {accounts.slice(0, 12).map((a) => (
        <div
          key={a._id}
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800/70 dark:bg-slate-950/30"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium text-slate-900 dark:text-white">
              {a.nombre}
            </p>
            {a.alLimite ? (
              <Badge tone="red">LIM</Badge>
            ) : (
              <Badge tone="green">ON</Badge>
            )}
          </div>

          <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
            {a.conexionesActivas}/{a.conexionesPermitidas} ·{" "}
            {a.devices?.[0]?.channelName || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "red" | "slate";
}) {
  const cls =
    tone === "green"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      : tone === "red"
        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase leading-none ${cls}`}
    >
      {children}
    </span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] text-slate-500 dark:border-slate-800/70 dark:bg-slate-950/30 dark:text-slate-400">
      {children}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}