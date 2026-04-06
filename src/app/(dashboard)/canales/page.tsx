import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllChannels } from "@/services/channel.service";
import Link from "next/link";

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
  };
}) {
  await requireAdminPageAccess();

  const channels = await getAllChannels();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        {/* HEADER */}
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Canales
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Listado de canales
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Administrá el catálogo base de canales.
              </p>
            </div>

            <Link
              href="/canales/new"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Nuevo canal
            </Link>
          </div>
        </div>

        {/* ALERTAS */}
        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success === "channel-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Canal creado correctamente.
          </div>
        )}

        {success === "channel-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Canal actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Estado del canal actualizado correctamente.
          </div>
        )}

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">URL origen</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay canales registrados.
                  </td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr
                    key={channel._id}
                    className="border-b border-slate-800/80 text-slate-300 transition hover:bg-slate-950/30 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-100">
                        {channel.nombre}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {channel.categoria}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      <span
                        className="block max-w-[420px] truncate"
                        title={channel.urlOrigen}
                      >
                        {channel.urlOrigen}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          channel.estado === "activo"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {channel.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/canales/${channel._id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/80"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/canales/${channel._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              channel.estado === "activo"
                                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {channel.estado === "activo"
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