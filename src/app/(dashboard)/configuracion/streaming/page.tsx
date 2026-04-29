import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllStreamingNodes } from "@/services/streaming.service";

type StreamingNode = {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: "origin" | "edge" | string;
  urlBase?: string;
  host?: string;
  puerto?: number;
  healthCheckPath?: string;
  healthStatus?: "unknown" | "online" | "offline" | string;
  lastCheckAt?: string | Date | null;
  lastSeenAt?: string | Date | null;
  failureCount?: number;
  lastError?: string | null;
  prioridad?: number;
  estado: string;
  habilitado?: boolean;
  healthTimeoutMs?: number;
  observaciones?: string | null;
};

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function HealthBadge({
  healthStatus,
}: {
  healthStatus?: "unknown" | "online" | "offline" | string;
}) {
  const status = String(healthStatus || "unknown").toLowerCase();

  if (status === "online") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        Online
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
        Offline
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
      Unknown
    </span>
  );
}

function StateBadge({
  estado,
  habilitado,
}: {
  estado: string;
  habilitado?: boolean;
}) {
  if (estado !== "activo") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
        Suspendido
      </span>
    );
  }

  if (habilitado === false) {
    return (
      <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        Deshabilitado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
      Activo
    </span>
  );
}

function TypeBadge({ tipo }: { tipo: string }) {
  const normalized = String(tipo || "").toLowerCase();

  if (normalized === "origin") {
    return (
      <span className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
        Origin
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
      Edge
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
        colSpan={7}
        className="px-3 py-8 text-center text-[12px] text-slate-500 dark:text-slate-400"
      >
        No hay nodos registrados.
      </td>
    </tr>
  );
}

export default async function StreamingPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const nodes = (await getAllStreamingNodes()) as StreamingNode[];

  const sortedNodes = [...nodes].sort((a, b) => {
    const priority: Record<string, number> = {
      origin: 0,
      edge: 1,
    };

    const pa = priority[String(a.tipo || "").toLowerCase()] ?? 99;
    const pb = priority[String(b.tipo || "").toLowerCase()] ?? 99;

    if (pa !== pb) return pa - pb;

    const codeA = String(a.codigo || a.nombre || "");
    const codeB = String(b.codigo || b.nombre || "");

    return codeA.localeCompare(codeB, "es");
  });

  const totalNodes = sortedNodes.length;
  const totalOrigins = sortedNodes.filter(
    (node) => String(node.tipo || "").toLowerCase() === "origin"
  ).length;
  const totalEdges = sortedNodes.filter(
    (node) => String(node.tipo || "").toLowerCase() === "edge"
  ).length;
  const onlineNodes = sortedNodes.filter(
    (node) => String(node.healthStatus || "").toLowerCase() === "online"
  ).length;
  const offlineNodes = sortedNodes.filter(
    (node) => String(node.healthStatus || "").toLowerCase() === "offline"
  ).length;
  const disabledNodes = sortedNodes.filter(
    (node) => node.estado !== "activo" || node.habilitado === false
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Configuración
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Nodos de streaming
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Administración compacta de origins y edges, estado operativo,
                health check, host y puerto.
              </p>
            </div>

            <Link
              href="/configuracion/streaming/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nuevo nodo
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {success === "node-created" && (
          <div className="mx-3 mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            Nodo creado correctamente.
          </div>
        )}

        {success === "node-updated" && (
          <div className="mx-3 mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            Nodo actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-3 mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            Estado del nodo actualizado correctamente.
          </div>
        )}

        {success === "health-updated" && (
          <div className="mx-3 mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            Health check actualizado correctamente.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi title="Total" value={totalNodes} desc="Nodos cargados" />
          <Kpi title="Origins" value={totalOrigins} desc="Cabeceras" tone="cyan" />
          <Kpi title="Edges" value={totalEdges} desc="Localidades" tone="cyan" />
          <Kpi title="Online" value={onlineNodes} desc="Health OK" tone="green" />
          <Kpi
            title="Offline"
            value={offlineNodes}
            desc="Sin respuesta"
            tone={offlineNodes > 0 ? "red" : "green"}
          />
          <Kpi
            title="Inactivos"
            value={disabledNodes}
            desc="Suspendidos"
            tone={disabledNodes > 0 ? "amber" : "green"}
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[980px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[250px] px-2 py-2 text-left font-medium">
                    Nodo
                  </th>
                  <th className="w-[80px] px-2 py-2 text-center font-medium">
                    Tipo
                  </th>
                  <th className="w-[260px] px-2 py-2 text-left font-medium">
                    Host / URL
                  </th>
                  <th className="w-[190px] px-2 py-2 text-left font-medium">
                    Health
                  </th>
                  <th className="w-[80px] px-2 py-2 text-center font-medium">
                    Prior.
                  </th>
                  <th className="w-[130px] px-2 py-2 text-center font-medium">
                    Estado
                  </th>
                  <th className="w-[210px] px-2 py-2 text-left font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedNodes.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedNodes.map((node, index) => (
                    <tr
                      key={node._id}
                      className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                        index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate font-medium text-slate-900 dark:text-white">
                            {node.nombre}
                          </p>

                          <p className="mt-0.5 max-w-[230px] truncate text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Código: {node.codigo}
                          </p>

                          {node.observaciones ? (
                            <p className="mt-1 line-clamp-2 max-w-[230px] text-[10px] leading-snug text-slate-500 dark:text-slate-500">
                              {node.observaciones}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <TypeBadge tipo={node.tipo} />
                      </td>

                      <td className="px-2 py-2">
                        <div className="space-y-0.5 text-[10px] leading-snug">
                          <p className="max-w-[250px] truncate text-slate-800 dark:text-slate-200">
                            {node.host || "—"}:{node.puerto ?? "—"}
                          </p>

                          <p className="max-w-[250px] truncate text-slate-500 dark:text-slate-400">
                            URL: {node.urlBase || "—"}
                          </p>

                          <p className="max-w-[250px] truncate text-slate-500 dark:text-slate-400">
                            Path: {node.healthCheckPath || "/health"}
                          </p>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <HealthBadge healthStatus={node.healthStatus} />

                          <div className="space-y-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                            <p>Check: {formatDate(node.lastCheckAt)}</p>
                            <p>Seen: {formatDate(node.lastSeenAt)}</p>
                            <p>Fallos: {node.failureCount ?? 0}</p>

                            {node.lastError ? (
                              <p
                                title={node.lastError}
                                className="max-w-[170px] truncate text-red-600 dark:text-red-300"
                              >
                                Error: {node.lastError}
                              </p>
                            ) : (
                              <p>Error: —</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center text-[12px] font-medium text-slate-800 dark:text-slate-200">
                        {node.prioridad ?? "—"}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StateBadge
                            estado={node.estado}
                            habilitado={node.habilitado}
                          />

                          <span className="text-[10px] text-slate-500 dark:text-slate-500">
                            {node.healthTimeoutMs ?? "—"} ms
                          </span>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex max-w-[200px] flex-wrap gap-1.5">
                          <Link
                            href={`/configuracion/streaming/${node._id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                          >
                            Editar
                          </Link>

                          <form
                            action={`/api/configuracion/streaming/${node._id}/refresh-health`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className="inline-flex rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                            >
                              Health
                            </button>
                          </form>

                          <form
                            action={`/api/configuracion/streaming/${node._id}/toggle-status`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                node.estado === "activo"
                                  ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                              }`}
                            >
                              {node.estado === "activo" ? "Suspender" : "Activar"}
                            </button>
                          </form>
                        </div>
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