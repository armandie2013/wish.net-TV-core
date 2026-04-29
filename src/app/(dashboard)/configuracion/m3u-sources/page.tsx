import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllM3uSources } from "@/services/m3u-source.service";

type M3uSourceItem = {
  _id: string;
  nombre: string;
  urlFuente: string;
  localidad?: string;
  prioridad?: number;
  importacionAutomatica?: boolean;
  ultimaImportacion?: Date | string | null;
  estado: string;
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

function AutoImportBadge({ enabled }: { enabled?: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
        Sí
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
      No
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
        No hay fuentes M3U registradas.
      </td>
    </tr>
  );
}

export default async function M3uSourcesPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
    created?: string;
    updated?: string;
    detected?: string;
  };
}) {
  await requireAdminPageAccess();

  const sources = (await getAllM3uSources()) as M3uSourceItem[];

  const sortedSources = [...sources].sort((a, b) => {
    const pa = Number(a.prioridad ?? 999);
    const pb = Number(b.prioridad ?? 999);

    if (pa !== pb) return pa - pb;

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });

  const totalSources = sortedSources.length;
  const activeSources = sortedSources.filter(
    (source) => source.estado === "activo"
  ).length;
  const suspendedSources = sortedSources.filter(
    (source) => source.estado !== "activo"
  ).length;
  const autoSources = sortedSources.filter(
    (source) => Boolean(source.importacionAutomatica)
  ).length;
  const importedSources = sortedSources.filter(
    (source) => Boolean(source.ultimaImportacion)
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const created = searchParams?.created || "0";
  const updated = searchParams?.updated || "0";
  const detected = searchParams?.detected || "0";

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
                Fuentes M3U
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Administrá las listas M3U que alimentan el catálogo de canales
                del sistema.
              </p>
            </div>

            <Link
              href="/configuracion/m3u-sources/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nueva fuente
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

            {success === "source-created" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Fuente creada correctamente.
              </div>
            )}

            {success === "source-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Fuente actualizada correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado de la fuente actualizado correctamente.
              </div>
            )}

            {success === "import-completed" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
                Importación completada. Detectados:{" "}
                <strong>{detected}</strong> · Nuevos:{" "}
                <strong>{created}</strong> · Actualizados:{" "}
                <strong>{updated}</strong>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <Kpi title="Total" value={totalSources} desc="Fuentes cargadas" />

          <Kpi
            title="Activas"
            value={activeSources}
            desc="Habilitadas"
            tone="green"
          />

          <Kpi
            title="Suspend."
            value={suspendedSources}
            desc="Bloqueadas"
            tone={suspendedSources > 0 ? "red" : "green"}
          />

          <Kpi
            title="Auto"
            value={autoSources}
            desc="Importación auto"
            tone="cyan"
          />

          <Kpi
            title="Importadas"
            value={importedSources}
            desc="Con historial"
            tone={importedSources > 0 ? "cyan" : "amber"}
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[1060px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[300px] px-2 py-2 text-left font-medium">
                    Fuente
                  </th>
                  <th className="w-[150px] px-2 py-2 text-left font-medium">
                    Localidad
                  </th>
                  <th className="w-[90px] px-2 py-2 text-center font-medium">
                    Prior.
                  </th>
                  <th className="w-[110px] px-2 py-2 text-center font-medium">
                    Auto
                  </th>
                  <th className="w-[170px] px-2 py-2 text-left font-medium">
                    Última importación
                  </th>
                  <th className="w-[110px] px-2 py-2 text-center font-medium">
                    Estado
                  </th>
                  <th className="w-[250px] px-2 py-2 text-left font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedSources.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedSources.map((source, index) => (
                    <tr
                      key={source._id}
                      className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                        index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate font-medium text-slate-900 dark:text-white">
                            {source.nombre}
                          </p>

                          <p
                            className="mt-0.5 max-w-[280px] truncate text-[10px] text-slate-500 dark:text-slate-400"
                            title={source.urlFuente}
                          >
                            {source.urlFuente}
                          </p>
                        </div>
                      </td>

                      <td className="px-2 py-2">
                        <span className="block max-w-[140px] truncate text-[11px] text-slate-700 dark:text-slate-300">
                          {source.localidad || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {source.prioridad ?? "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <AutoImportBadge
                          enabled={source.importacionAutomatica}
                        />
                      </td>

                      <td className="px-2 py-2">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          {formatDate(source.ultimaImportacion)}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <StateBadge estado={source.estado} />
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex max-w-[240px] flex-wrap gap-1.5">
                          <form
                            action={`/api/configuracion/m3u-sources/${source._id}/import`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className="inline-flex rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                            >
                              Importar
                            </button>
                          </form>

                          <Link
                            href={`/configuracion/m3u-sources/${source._id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                          >
                            Editar
                          </Link>

                          <form
                            action={`/api/configuracion/m3u-sources/${source._id}/toggle-status`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                source.estado === "activo"
                                  ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                              }`}
                            >
                              {source.estado === "activo"
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

function formatDate(value: Date | string | null | undefined) {
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