"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertBox,
  DashboardHeader,
  DashboardPanel,
  DashboardSection,
  EmptyTableRow,
  KpiCard,
  StatusBadge,
  TableBody,
  TableHead,
  TableRow,
  TableShell,
} from "@/components/ui/dashboard-ui";

type LogItem = {
  _id: string;
  action: string;
  message: string;
  actorName: string | null;
  actorEmail: string | null;
  targetName: string | null;
  targetEmail: string | null;
  createdAt: string | null;
};

function getActionTone(action: string) {
  const normalized = String(action || "").toLowerCase();

  if (
    normalized.includes("delete") ||
    normalized.includes("suspend") ||
    normalized.includes("error")
  ) {
    return "red";
  }

  if (
    normalized.includes("create") ||
    normalized.includes("login") ||
    normalized.includes("import")
  ) {
    return "green";
  }

  if (
    normalized.includes("update") ||
    normalized.includes("reset") ||
    normalized.includes("password") ||
    normalized.includes("toggle")
  ) {
    return "amber";
  }

  return "cyan";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function compactAction(action: string) {
  const value = String(action || "—");

  if (value === "STREAMING_NODE_TOGGLE_STATUS") return "NODE_STATUS";
  if (value === "LOCATION_TOGGLE_STATUS") return "LOC_STATUS";
  if (value === "AUTH_LOGIN") return "LOGIN";
  if (value === "USER_RESET_PASSWORD") return "RESET_PASS";
  if (value === "USER_TOGGLE_STATUS") return "USER_STATUS";
  if (value === "CHANNEL_TOGGLE_STATUS") return "CH_STATUS";
  if (value === "PLAN_TOGGLE_STATUS") return "PLAN_STATUS";

  return value;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  async function loadLogs() {
    try {
      const res = await fetch("/api/logs", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No se pudieron cargar los logs");
        return;
      }

      if (data.ok) {
        setLogs(data.logs || []);
        setError("");
      }
    } catch {
      setError("No se pudo conectar con /api/logs");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function safeLoadLogs() {
      if (!mounted) return;
      await loadLogs();
    }

    safeLoadLogs();

    const interval = setInterval(() => {
      safeLoadLogs();
    }, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const withActor = logs.filter((log) => Boolean(log.actorEmail)).length;
    const system = logs.filter((log) => !log.actorEmail).length;
    const withTarget = logs.filter(
      (log) => Boolean(log.targetEmail) || Boolean(log.targetName)
    ).length;

    const lastLog = logs[0]?.createdAt ? formatDate(logs[0].createdAt) : "—";

    return {
      total,
      withActor,
      system,
      withTarget,
      lastLog,
    };
  }, [logs]);

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          eyebrow="Logs"
          title="Logs del sistema"
          description="Últimos eventos registrados en la plataforma. La vista se actualiza automáticamente cada 30 segundos."
        />

        {error && (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 px-3 py-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <KpiCard title="Total" value={stats.total} desc="Eventos cargados" />

          <KpiCard
            title="Usuarios"
            value={stats.withActor}
            desc="Con actor"
            tone="cyan"
          />

          <KpiCard
            title="Sistema"
            value={stats.system}
            desc="Eventos internos"
            tone="amber"
          />

          <KpiCard
            title="Destino"
            value={stats.withTarget}
            desc="Con objetivo"
            tone="violet"
          />

          <KpiCard
            title="Último"
            value={stats.lastLog}
            desc="Evento recibido"
            tone="green"
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[1080px]" maxHeight="max-h-[690px]">
            <TableHead>
              <tr>
                <th className="w-[130px] px-2 py-2 text-left font-medium">
                  Fecha
                </th>

                <th className="w-[130px] px-2 py-2 text-left font-medium">
                  Acción
                </th>

                <th className="w-[210px] px-2 py-2 text-left font-medium">
                  Actor
                </th>

                <th className="w-[190px] px-2 py-2 text-left font-medium">
                  Destino
                </th>

                <th className="px-2 py-2 text-left font-medium">Mensaje</th>
              </tr>
            </TableHead>

            <TableBody>
              {logs.length === 0 ? (
                <EmptyTableRow colSpan={5}>
                  Todavía no hay logs registrados.
                </EmptyTableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={log._id} index={index} align="top">
                    <td className="px-2 py-2 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="px-2 py-2">
                      <StatusBadge
                        tone={getActionTone(log.action) as any}
                        className="h-5 max-w-[110px]"
                      >
                        <span className="truncate">
                          {compactAction(log.action)}
                        </span>
                      </StatusBadge>
                    </td>

                    <td className="px-2 py-2">
                      <p className="max-w-[190px] truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        {log.actorName || "Sistema"}
                      </p>

                      <p className="max-w-[190px] truncate text-[10px] text-slate-500 dark:text-slate-500">
                        {log.actorEmail || "—"}
                      </p>
                    </td>

                    <td className="px-2 py-2">
                      <p className="max-w-[170px] truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        {log.targetName || "—"}
                      </p>

                      <p className="max-w-[170px] truncate text-[10px] text-slate-500 dark:text-slate-500">
                        {log.targetEmail || "—"}
                      </p>
                    </td>

                    <td className="px-2 py-2">
                      <p className="line-clamp-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                        {log.message || "—"}
                      </p>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableShell>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}