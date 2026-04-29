import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllLocations } from "@/services/location.service";

type StreamingNodeMini = {
  _id?: string;
  nombre?: string;
  codigo?: string;
};

type LocationItem = {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  estado: string;
  streamingNodeId?: StreamingNodeMini | null;
  fallbackStreamingNodeId?: StreamingNodeMini | null;
};

function StateBadge({ estado }: { estado: string }) {
  if (estado === "activo") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        Activo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
      Suspendido
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
        colSpan={6}
        className="px-3 py-8 text-center text-[12px] text-slate-500 dark:text-slate-400"
      >
        No hay localidades registradas.
      </td>
    </tr>
  );
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const locations = (await getAllLocations()) as LocationItem[];

  const sortedLocations = [...locations].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
  );

  const totalLocations = sortedLocations.length;
  const activeLocations = sortedLocations.filter(
    (location) => location.estado === "activo"
  ).length;
  const suspendedLocations = sortedLocations.filter(
    (location) => location.estado !== "activo"
  ).length;
  const withMainNode = sortedLocations.filter(
    (location) => Boolean(location.streamingNodeId?.nombre)
  ).length;
  const withFallback = sortedLocations.filter(
    (location) => Boolean(location.fallbackStreamingNodeId?.nombre)
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Configuración
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Localidades
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Asociá cada localidad a su nodo principal y, cuando corresponda,
                a un nodo fallback para respaldo.
              </p>
            </div>

            <Link
              href="/configuracion/localidades/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nueva localidad
            </Link>
          </div>
        </div>

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success === "location-created" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Localidad creada correctamente.
              </div>
            )}

            {success === "location-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Localidad actualizada correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado de la localidad actualizado correctamente.
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <Kpi title="Total" value={totalLocations} desc="Localidades" />

          <Kpi
            title="Activas"
            value={activeLocations}
            desc="Habilitadas"
            tone="green"
          />

          <Kpi
            title="Suspend."
            value={suspendedLocations}
            desc="Bloqueadas"
            tone={suspendedLocations > 0 ? "red" : "green"}
          />

          <Kpi
            title="Con nodo"
            value={withMainNode}
            desc="Principal asignado"
            tone="cyan"
          />

          <Kpi
            title="Fallback"
            value={withFallback}
            desc="Respaldo asignado"
            tone={withFallback > 0 ? "cyan" : "amber"}
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[860px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[260px] px-2 py-2 text-left font-medium">
                    Localidad
                  </th>
                  <th className="w-[140px] px-2 py-2 text-left font-medium">
                    Código
                  </th>
                  <th className="w-[190px] px-2 py-2 text-left font-medium">
                    Nodo principal
                  </th>
                  <th className="w-[190px] px-2 py-2 text-left font-medium">
                    Fallback
                  </th>
                  <th className="w-[110px] px-2 py-2 text-center font-medium">
                    Estado
                  </th>
                  <th className="w-[180px] px-2 py-2 text-left font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedLocations.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedLocations.map((location, index) => (
                    <tr
                      key={location._id}
                      className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                        index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-medium text-slate-900 dark:text-white">
                            {location.nombre}
                          </p>

                          {location.descripcion ? (
                            <p className="mt-0.5 line-clamp-2 max-w-[240px] text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                              {location.descripcion}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-500">
                              Sin descripción
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <span className="inline-flex max-w-[120px] truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                          {location.codigo || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <div className="max-w-[180px]">
                          <p className="truncate text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {location.streamingNodeId?.nombre || "—"}
                          </p>

                          {location.streamingNodeId?.codigo ? (
                            <p className="truncate text-[10px] text-slate-500 dark:text-slate-500">
                              {location.streamingNodeId.codigo}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <div className="max-w-[180px]">
                          <p className="truncate text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {location.fallbackStreamingNodeId?.nombre || "—"}
                          </p>

                          {location.fallbackStreamingNodeId?.codigo ? (
                            <p className="truncate text-[10px] text-slate-500 dark:text-slate-500">
                              {location.fallbackStreamingNodeId.codigo}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <StateBadge estado={location.estado} />
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex max-w-[170px] flex-wrap gap-1.5">
                          <Link
                            href={`/configuracion/localidades/${location._id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                          >
                            Editar
                          </Link>

                          <form
                            action={`/api/configuracion/localidades/${location._id}/toggle-status`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                location.estado === "activo"
                                  ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                              }`}
                            >
                              {location.estado === "activo"
                                ? "Suspender"
                                : "Activar"}
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