import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllLocations } from "@/services/location.service";
import {
  ActionButton,
  ActionLink,
  AlertBox,
  CodeBadge,
  DashboardFooterNote,
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

function sortLocations(locations: LocationItem[]) {
  return [...locations].sort((a, b) => {
    const byName = String(a.nombre || "").localeCompare(
      String(b.nombre || ""),
      "es",
      {
        sensitivity: "base",
        numeric: true,
      }
    );

    if (byName !== 0) return byName;

    return String(a.codigo || "").localeCompare(String(b.codigo || ""), "es", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const locations = (await getAllLocations()) as LocationItem[];
  const sortedLocations = sortLocations(locations);

  const totalLocations = sortedLocations.length;
  const activeLocations = sortedLocations.filter(
    (location) => location.estado === "activo"
  ).length;
  const suspendedLocations = sortedLocations.filter(
    (location) => location.estado !== "activo"
  ).length;
  const withMainNode = sortedLocations.filter((location) =>
    Boolean(location.streamingNodeId?.nombre)
  ).length;
  const withFallback = sortedLocations.filter((location) =>
    Boolean(location.fallbackStreamingNodeId?.nombre)
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          title="Localidades"
          description="Asociá cada localidad a su nodo principal y, cuando corresponda, a un nodo fallback para respaldo."
          actionHref="/configuracion/localidades/new"
          actionLabel="Nueva localidad"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && <AlertBox tone="red">{error}</AlertBox>}

            {success === "location-created" && (
              <AlertBox>Localidad creada correctamente.</AlertBox>
            )}

            {success === "location-updated" && (
              <AlertBox>Localidad actualizada correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>
                Estado de la localidad actualizado correctamente.
              </AlertBox>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard title="Total" value={totalLocations} desc="Localidades" />

          <KpiCard
            title="Activas"
            value={activeLocations}
            desc="Habilitadas"
            tone="green"
          />

          <KpiCard
            title="Suspend."
            value={suspendedLocations}
            desc="Bloqueadas"
            tone={suspendedLocations > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Con nodo"
            value={withMainNode}
            desc="Principal asignado"
            tone="cyan"
          />

          <KpiCard
            title="Fallback"
            value={withFallback}
            desc="Respaldo asignado"
            tone={withFallback > 0 ? "cyan" : "amber"}
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[940px]">
            <TableHead>
              <tr>
                <th className="w-[290px] px-3 py-2 text-left font-medium">
                  Localidad
                </th>

                <th className="w-[150px] px-3 py-2 text-center font-medium">
                  Código
                </th>

                <th className="w-[230px] px-3 py-2 text-left font-medium">
                  Nodo principal
                </th>

                <th className="w-[230px] px-3 py-2 text-left font-medium">
                  Fallback
                </th>

                <th className="w-[130px] px-3 py-2 text-center font-medium">
                  Estado
                </th>

                <th className="w-[154px] px-3 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {sortedLocations.length === 0 ? (
                <EmptyTableRow colSpan={6}>
                  No hay localidades registradas.
                </EmptyTableRow>
              ) : (
                sortedLocations.map((location, index) => {
                  const isActive = location.estado === "activo";

                  return (
                    <TableRow key={location._id} index={index}>
                      <td className="px-3 py-3">
                        <div className="min-w-0">
                          <p className="max-w-[270px] truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                            {location.nombre}
                          </p>

                          {location.descripcion ? (
                            <p className="mt-1 line-clamp-2 max-w-[270px] text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                              {location.descripcion}
                            </p>
                          ) : (
                            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              Sin descripción
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <CodeBadge className="min-w-[104px] max-w-[132px]">
                          {location.codigo || "—"}
                        </CodeBadge>
                      </td>

                      <td className="px-3 py-3">
                        <div className="max-w-[210px]">
                          <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            {location.streamingNodeId?.nombre || "—"}
                          </p>

                          {location.streamingNodeId?.codigo ? (
                            <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-500">
                              {location.streamingNodeId.codigo}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="max-w-[210px]">
                          <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            {location.fallbackStreamingNodeId?.nombre || "—"}
                          </p>

                          {location.fallbackStreamingNodeId?.codigo ? (
                            <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-500">
                              {location.fallbackStreamingNodeId.codigo}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          tone={isActive ? "green" : "red"}
                          className="w-[92px]"
                        >
                          {isActive ? "Activo" : "Suspendido"}
                        </StatusBadge>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <ActionLink
                            href={`/configuracion/localidades/${location._id}/edit`}
                          >
                            Editar
                          </ActionLink>

                          <form
                            action={`/api/configuracion/localidades/${location._id}/toggle-status`}
                            method="POST"
                          >
                            <ActionButton tone={isActive ? "red" : "green"}>
                              {isActive ? "Susp." : "Activar"}
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

          <DashboardFooterNote>
            Las localidades activas se usan para decidir el edge principal y, si
            existe, el fallback de reproducción.
          </DashboardFooterNote>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}