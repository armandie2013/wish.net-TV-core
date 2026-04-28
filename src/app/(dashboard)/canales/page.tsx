import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllChannels } from "@/services/channel.service";
import Link from "next/link";

function formatOrden(index: number) {
  return String(index + 1).padStart(3, "0");
}

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
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        {/* HEADER */}
        <div className="border-b border-slate-300 px-5 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
                Canales
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Listado de canales
              </h1>

              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Catálogo base ordenado alfabéticamente para asignación en
                planes.
              </p>
            </div>

            <Link
              href="/canales/new"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Nuevo canal
            </Link>
          </div>
        </div>

        {/* ALERTAS */}
        {error && (
          <div className="mx-5 mt-4 rounded-xl border border-red-300 bg-red-100 px-4 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success === "channel-created" && (
          <div className="mx-5 mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Canal creado correctamente.
          </div>
        )}

        {success === "channel-updated" && (
          <div className="mx-5 mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Canal actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-5 mt-4 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Estado del canal actualizado correctamente.
          </div>
        )}

        {/* TABLA */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-xs">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900/95">
              <tr className="border-b border-slate-300 text-left text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:border-slate-800">
                <th className="w-[62px] px-3 py-3 font-semibold">
                  Orden
                </th>

                <th className="w-[260px] px-3 py-3 font-semibold">
                  Nombre
                </th>

                <th className="w-[72px] px-2 py-3 font-semibold">
                  Cat.
                </th>

                <th className="px-2 py-3 font-semibold">
                  URL
                </th>

                <th className="w-[82px] px-2 py-3 font-semibold">
                  Estado
                </th>

                <th className="w-[132px] px-2 py-3 font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-xs text-slate-500"
                  >
                    No hay canales registrados.
                  </td>
                </tr>
              ) : (
                channels.map((channel, index) => (
                  <tr
                    key={channel._id}
                    className="border-b border-slate-200 text-slate-700 transition hover:bg-slate-100/70 last:border-b-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950/30"
                  >
                    <td className="px-3 py-2.5">
                      <span className="inline-flex min-w-[40px] items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                        {formatOrden(index)}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <p
                        className="truncate font-medium text-slate-900 dark:text-slate-100"
                        title={channel.nombre}
                      >
                        {channel.nombre}
                      </p>
                    </td>

                    <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400">
                      <span
                        className="block truncate"
                        title={channel.categoria || "-"}
                      >
                        {channel.categoria || "-"}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400">
                      <span
                        className="block truncate"
                        title={channel.urlOrigen}
                      >
                        {channel.urlOrigen}
                      </span>
                    </td>

                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          channel.estado === "activo"
                            ? "border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "border border-red-300 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {channel.estado}
                      </span>
                    </td>

                    <td className="px-2 py-2.5">
                      <div className="flex flex-nowrap items-center gap-1">
                        <Link
                          href={`/canales/${channel._id}/edit`}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-slate-200 px-1.5 py-1.5 text-[10px] font-semibold text-slate-800 transition hover:bg-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/canales/${channel._id}/toggle-status`}
                          method="POST"
                          className="m-0"
                        >
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-1.5 py-1.5 text-[10px] font-semibold transition ${
                              channel.estado === "activo"
                                ? "border border-red-300 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                : "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                            }`}
                          >
                            {channel.estado === "activo" ? "Susp." : "Activar"}
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