"use client";

import { useEffect, useMemo, useState } from "react";

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

function ActionBadge({ action }: { action: string }) {
  const normalized = String(action || "").toLowerCase();

  const tone =
    normalized.includes("delete") ||
    normalized.includes("suspend") ||
    normalized.includes("error")
      ? "red"
      : normalized.includes("create") ||
          normalized.includes("login") ||
          normalized.includes("import")
        ? "green"
        : normalized.includes("update") ||
            normalized.includes("reset") ||
            normalized.includes("password")
          ? "amber"
          : "cyan";

  const cls =
    tone === "green"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      : tone === "red"
        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        : tone === "amber"
          ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
          : "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200";

  return (
    <span
      className={`inline-flex max-w-[140px] rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase leading-none ${cls}`}
      title={action}
    >
      <span className="truncate">{action || "—"}</span>
    </span>
  );
}

function Kpi({
  title,
  value,
  desc,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
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

function EmptyRow() {
  return (
    <tr>
      <td
        colSpan={5}
        className="px-3 py-8 text-center text-[12px] text-slate-500 dark:text-slate-400"
      >
        Todavía no hay logs registrados.
      </td>
    </tr>
  );
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
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
              Logs
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Logs del sistema
            </h1>

            <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
              Últimos eventos registrados en la plataforma. La vista se actualiza
              automáticamente cada 30 segundos.
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-4">
          <Kpi title="Total" value={stats.total} desc="Eventos cargados" />

          <Kpi
            title="Usuarios"
            value={stats.withActor}
            desc="Con actor"
            tone="cyan"
          />

          <Kpi
            title="Sistema"
            value={stats.system}
            desc="Eventos internos"
            tone="amber"
          />

          <Kpi
            title="Último"
            value={stats.lastLog}
            desc="Evento recibido"
            tone="green"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[980px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[150px] px-2 py-2 text-left font-medium">
                    Fecha
                  </th>
                  <th className="w-[160px] px-2 py-2 text-left font-medium">
                    Acción
                  </th>
                  <th className="w-[210px] px-2 py-2 text-left font-medium">
                    Actor
                  </th>
                  <th className="w-[210px] px-2 py-2 text-left font-medium">
                    Destino
                  </th>
                  <th className="px-2 py-2 text-left font-medium">Mensaje</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {logs.length === 0 ? (
                  <EmptyRow />
                ) : (
                  logs.map((log, index) => (
                    <tr
                      key={log._id}
                      className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                        index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-2 py-2">
                        <ActionBadge action={log.action} />
                      </td>

                      <td className="px-2 py-2">
                        <p
                          className="max-w-[190px] truncate font-medium text-slate-900 dark:text-white"
                          title={log.actorName || "Sistema"}
                        >
                          {log.actorName || "Sistema"}
                        </p>
                        <p
                          className="max-w-[190px] truncate text-[10px] text-slate-500 dark:text-slate-400"
                          title={log.actorEmail || "—"}
                        >
                          {log.actorEmail || "—"}
                        </p>
                      </td>

                      <td className="px-2 py-2">
                        <p
                          className="max-w-[190px] truncate font-medium text-slate-900 dark:text-white"
                          title={log.targetName || "—"}
                        >
                          {log.targetName || "—"}
                        </p>
                        <p
                          className="max-w-[190px] truncate text-[10px] text-slate-500 dark:text-slate-400"
                          title={log.targetEmail || "—"}
                        >
                          {log.targetEmail || "—"}
                        </p>
                      </td>

                      <td className="px-2 py-2">
                        <p
                          className="line-clamp-2 text-[11px] leading-snug text-slate-700 dark:text-slate-300"
                          title={log.message}
                        >
                          {log.message || "—"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}