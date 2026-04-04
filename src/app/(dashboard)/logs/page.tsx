"use client";

import { useEffect, useState } from "react";

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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadLogs() {
      try {
        const res = await fetch("/api/logs", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          if (mounted) {
            setError(data?.message || "No se pudieron cargar los logs");
          }
          return;
        }

        if (mounted && data.ok) {
          setLogs(data.logs || []);
          setError("");
        }
      } catch {
        if (mounted) {
          setError("No se pudo conectar con /api/logs");
        }
      }
    }

    loadLogs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="mb-4">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-100">
            Logs del sistema
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Últimos eventos registrados en la plataforma.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-[620px] overflow-y-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Acción</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Destino</th>
                  <th className="px-4 py-3 font-semibold">Mensaje</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Todavía no hay logs registrados.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-slate-800/80 align-top text-slate-300 last:border-b-0"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-100">
                            {log.actorName || "Sistema"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {log.actorEmail || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-100">
                            {log.targetName || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {log.targetEmail || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
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