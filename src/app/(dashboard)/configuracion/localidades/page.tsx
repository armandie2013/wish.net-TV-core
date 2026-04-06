import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllLocations } from "@/services/location.service";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const locations = await getAllLocations();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Configuración
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Localidades
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Asociá localidades a nodos principales y de fallback.
              </p>
            </div>

            <Link
              href="/configuracion/localidades/new"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
            >
              Nueva localidad
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success === "location-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Localidad creada correctamente.
          </div>
        )}

        {success === "location-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Localidad actualizada correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Estado de la localidad actualizado correctamente.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/70">
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Nodo principal</th>
                <th className="px-6 py-4 font-semibold">Fallback</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay localidades registradas.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr
                    key={location._id}
                    className="border-b border-slate-800/80 text-slate-300 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {location.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          {location.descripcion || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {location.codigo}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {location.streamingNodeId?.nombre || "-"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {location.fallbackStreamingNodeId?.nombre || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          location.estado === "activo"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {location.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/configuracion/localidades/${location._id}/edit`}
                          className="inline-flex rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/configuracion/localidades/${location._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              location.estado === "activo"
                                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
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
    </section>
  );
}