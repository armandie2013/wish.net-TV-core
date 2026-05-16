import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllChannels } from "@/services/channel.service";
import Link from "next/link";

type ChannelItem = {
  _id: string;
  nombre: string;
  categoria?: string | null;
  urlOrigen?: string | null;
  estado: string;
};

function formatOrden(index: number) {
  return String(index + 1).padStart(3, "0");
}

function StateBadge({ estado }: { estado: string }) {
  const isActive = estado === "activo";

  return (
    <span
      className={
        isActive
          ? "inline-flex h-5 w-[78px] items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-2 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          : "inline-flex h-5 w-[78px] items-center justify-center rounded-full border border-red-300 bg-red-50 px-2 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
      }
    >
      {isActive ? "Activo" : "Suspend."}
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
        No hay canales registrados.
      </td>
    </tr>
  );
}

function ActionButton({
  children,
  tone = "neutral",
  href,
  type = "button",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red";
  href?: string;
  type?: "button" | "submit";
}) {
  const className =
    tone === "green"
      ? "inline-flex h-6 min-w-[52px] items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-2 text-[10px] font-medium leading-none text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
      : tone === "red"
        ? "inline-flex h-6 min-w-[52px] items-center justify-center rounded-md border border-red-300 bg-red-50 px-2 text-[10px] font-medium leading-none text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        : "inline-flex h-6 min-w-[52px] items-center justify-center rounded-md border border-slate-300 bg-slate-100 px-2 text-[10px] font-medium leading-none text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className}>
      {children}
    </button>
  );
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

  const channels = (await getAllChannels()) as ChannelItem[];

  const sortedChannels = [...channels].sort((a, b) => {
    const estadoA = a.estado === "activo" ? 0 : 1;
    const estadoB = b.estado === "activo" ? 0 : 1;

    if (estadoA !== estadoB) return estadoA - estadoB;

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
      sensitivity: "base",
      numeric: true,
    });
  });

  const totalChannels = sortedChannels.length;
  const activeChannels = sortedChannels.filter(
    (channel) => channel.estado === "activo"
  ).length;
  const suspendedChannels = sortedChannels.filter(
    (channel) => channel.estado !== "activo"
  ).length;
  const withCategory = sortedChannels.filter((channel) =>
    Boolean(channel.categoria)
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="h-[calc(100vh-132px)] min-h-0 overflow-hidden text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="shrink-0 border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Canales
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Listado de canales
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Catálogo base para asignación en planes. Los activos se muestran
                primero y los suspendidos quedan al final.
              </p>
            </div>

            <Link
              href="/canales/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nuevo canal
            </Link>
          </div>
        </div>

        {(error || success) && (
          <div className="shrink-0 space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success === "channel-created" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Canal creado correctamente.
              </div>
            )}

            {success === "channel-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Canal actualizado correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado del canal actualizado correctamente.
              </div>
            )}

            {success === "channel-deleted" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Canal eliminado correctamente. También se limpiaron sus
                referencias en los planes.
              </div>
            )}
          </div>
        )}

        <div className="grid shrink-0 grid-cols-2 gap-2 px-3 py-3 md:grid-cols-4">
          <Kpi title="Total" value={totalChannels} desc="Canales cargados" />

          <Kpi
            title="Activos"
            value={activeChannels}
            desc="Disponibles"
            tone="green"
          />

          <Kpi
            title="Suspend."
            value={suspendedChannels}
            desc="Bloqueados"
            tone={suspendedChannels > 0 ? "red" : "green"}
          />

          <Kpi
            title="Categoría"
            value={withCategory}
            desc="Con categoría"
            tone="cyan"
          />
        </div>

        <div className="min-h-0 flex-1 px-3 pb-3">
          <div className="h-full min-h-0 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[940px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[64px] px-2 py-1.5 text-center font-medium">
                    Orden
                  </th>
                  <th className="w-[280px] px-2 py-1.5 text-left font-medium">
                    Nombre
                  </th>
                  <th className="w-[110px] px-2 py-1.5 text-left font-medium">
                    Cat.
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium">URL</th>
                  <th className="w-[96px] px-2 py-1.5 text-center font-medium">
                    Estado
                  </th>
                  <th className="w-[210px] px-2 py-1.5 text-center font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedChannels.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedChannels.map((channel, index) => {
                    const isSuspended = channel.estado !== "activo";

                    return (
                      <tr
                        key={channel._id}
                        className={`align-middle transition hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                          isSuspended
                            ? "bg-red-50/50 dark:bg-red-950/10"
                            : index % 2
                              ? "bg-slate-50 dark:bg-slate-900/40"
                              : ""
                        }`}
                      >
                        <td className="px-2 py-1.5 text-center">
                          <span className="inline-flex h-5 min-w-[40px] items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-2 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                            {formatOrden(index)}
                          </span>
                        </td>

                        <td className="px-2 py-1.5">
                          <p
                            className={`max-w-[260px] truncate font-medium ${
                              isSuspended
                                ? "text-red-700 dark:text-red-200"
                                : "text-slate-900 dark:text-white"
                            }`}
                            title={channel.nombre}
                          >
                            {channel.nombre}
                          </p>
                        </td>

                        <td className="px-2 py-1.5">
                          <span
                            className="block max-w-[100px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                            title={channel.categoria || "—"}
                          >
                            {channel.categoria || "—"}
                          </span>
                        </td>

                        <td className="px-2 py-1.5">
                          <span
                            className="block max-w-[420px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                            title={channel.urlOrigen || "—"}
                          >
                            {channel.urlOrigen || "—"}
                          </span>
                        </td>

                        <td className="px-2 py-1.5 text-center">
                          <StateBadge estado={channel.estado} />
                        </td>

                        <td className="px-2 py-1.5">
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton
                              href={`/canales/${channel._id}/edit`}
                            >
                              Edit.
                            </ActionButton>

                            <form
                              action={`/api/canales/${channel._id}/toggle-status`}
                              method="POST"
                            >
                              <ActionButton
                                type="submit"
                                tone={
                                  channel.estado === "activo" ? "red" : "green"
                                }
                              >
                                {channel.estado === "activo" ? "Susp." : "Act."}
                              </ActionButton>
                            </form>

                            <form
                              action={`/api/canales/${channel._id}/delete`}
                              method="POST"
                            >
                              <ActionButton type="submit" tone="red">
                                Borrar
                              </ActionButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}