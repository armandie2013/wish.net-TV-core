import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllChannels } from "@/services/channel.service";
import {
  ActionButton,
  ActionLink,
  AlertBox,
  CodeBadge,
  DashboardHeader,
  DashboardPanel,
  DashboardSection,
  EmptyTableRow,
  KpiCard,
  StatusBadge,
  TableBody,
  TableHead,
  TableRow,
  TableShell,
} from "@/components/ui/dashboard-ui";

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
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          eyebrow="Canales"
          title="Listado de canales"
          description="Catálogo base para asignación en planes. Los activos se muestran primero y los suspendidos quedan al final."
          actionHref="/canales/new"
          actionLabel="Nuevo canal"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && <AlertBox tone="red">{error}</AlertBox>}

            {success === "channel-created" && (
              <AlertBox>Canal creado correctamente.</AlertBox>
            )}

            {success === "channel-updated" && (
              <AlertBox>Canal actualizado correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>Estado del canal actualizado correctamente.</AlertBox>
            )}

            {success === "channel-deleted" && (
              <AlertBox>
                Canal eliminado correctamente. También se limpiaron sus
                referencias en los planes.
              </AlertBox>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-4">
          <KpiCard
            title="Total"
            value={totalChannels}
            desc="Canales cargados"
          />

          <KpiCard
            title="Activos"
            value={activeChannels}
            desc="Disponibles"
            tone="green"
          />

          <KpiCard
            title="Suspend."
            value={suspendedChannels}
            desc="Bloqueados"
            tone={suspendedChannels > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Categoría"
            value={withCategory}
            desc="Con categoría"
            tone="cyan"
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[940px]">
            <TableHead>
              <tr>
                <th className="w-[64px] px-2 py-2 text-center font-medium">
                  Orden
                </th>

                <th className="w-[280px] px-2 py-2 text-left font-medium">
                  Nombre
                </th>

                <th className="w-[110px] px-2 py-2 text-left font-medium">
                  Cat.
                </th>

                <th className="px-2 py-2 text-left font-medium">URL</th>

                <th className="w-[96px] px-2 py-2 text-center font-medium">
                  Estado
                </th>

                <th className="w-[210px] px-2 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {sortedChannels.length === 0 ? (
                <EmptyTableRow colSpan={6}>
                  No hay canales registrados.
                </EmptyTableRow>
              ) : (
                sortedChannels.map((channel, index) => {
                  const isActive = channel.estado === "activo";
                  const isSuspended = !isActive;

                  return (
                    <TableRow key={channel._id} index={index}>
                      <td className="px-2 py-2 text-center">
                        <CodeBadge>{formatOrden(index)}</CodeBadge>
                      </td>

                      <td className="px-2 py-2">
                        <p
                          className={`max-w-[260px] truncate text-[12px] font-semibold ${
                            isSuspended
                              ? "text-red-700 dark:text-red-200"
                              : "text-slate-900 dark:text-white"
                          }`}
                          title={channel.nombre}
                        >
                          {channel.nombre}
                        </p>
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className="block max-w-[100px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                          title={channel.categoria || "—"}
                        >
                          {channel.categoria || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className="block max-w-[420px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                          title={channel.urlOrigen || "—"}
                        >
                          {channel.urlOrigen || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <StatusBadge
                          tone={isActive ? "green" : "red"}
                          className="w-[78px]"
                        >
                          {isActive ? "Activo" : "Suspend."}
                        </StatusBadge>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ActionLink href={`/canales/${channel._id}/edit`}>
                            Edit.
                          </ActionLink>

                          <form
                            action={`/api/canales/${channel._id}/toggle-status`}
                            method="POST"
                          >
                            <ActionButton
                              type="submit"
                              tone={isActive ? "red" : "green"}
                            >
                              {isActive ? "Susp." : "Act."}
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </TableShell>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}