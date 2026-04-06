import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllM3uSources } from "@/services/m3u-source.service";

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

  const sources = await getAllM3uSources();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const created = searchParams?.created || "0";
  const updated = searchParams?.updated || "0";
  const detected = searchParams?.detected || "0";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Configuración
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Fuentes M3U
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Administrá las listas M3U que alimentan el catálogo del sistema.
              </p>
            </div>

            <Link
              href="/configuracion/m3u-sources/new"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Nueva fuente
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success === "source-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Fuente creada correctamente.
          </div>
        )}

        {success === "source-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Fuente actualizada correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Estado de la fuente actualizado correctamente.
          </div>
        )}

        {success === "import-completed" && (
          <div className="mx-6 mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            Importación completada. Detectados: <strong>{detected}</strong> ·
            Nuevos: <strong>{created}</strong> · Actualizados:{" "}
            <strong>{updated}</strong>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Localidad</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Importación auto</th>
                <th className="px-6 py-4 font-semibold">Última importación</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay fuentes M3U registradas.
                  </td>
                </tr>
              ) : (
                sources.map((source) => (
                  <tr
                    key={source._id}
                    className="border-b border-slate-800/80 text-slate-300 transition hover:bg-slate-950/30 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {source.nombre}
                        </p>
                        <p
                          className="max-w-[340px] truncate text-xs text-slate-500"
                          title={source.urlFuente}
                        >
                          {source.urlFuente}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {source.localidad}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-100">
                      {source.prioridad}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {source.importacionAutomatica ? "Sí" : "No"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(source.ultimaImportacion)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          source.estado === "activo"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {source.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <form
                          action={`/api/configuracion/m3u-sources/${source._id}/import`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            Importar ahora
                          </button>
                        </form>

                        <Link
                          href={`/configuracion/m3u-sources/${source._id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/80"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/configuracion/m3u-sources/${source._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              source.estado === "activo"
                                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
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
    </section>
  );
}

function formatDate(value: Date | string | null) {
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