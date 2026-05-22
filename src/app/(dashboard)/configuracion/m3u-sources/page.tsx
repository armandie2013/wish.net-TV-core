import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllM3uSources } from "@/services/m3u-source.service";
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

function sortM3uSources(sources: M3uSourceItem[]) {
  return [...sources].sort((a, b) => {
    const prioridadA = Number(a.prioridad ?? 999);
    const prioridadB = Number(b.prioridad ?? 999);

    if (prioridadA !== prioridadB) return prioridadA - prioridadB;

    const nombreA = a.nombre || "";
    const nombreB = b.nombre || "";

    const byName = nombreA.localeCompare(nombreB, "es", {
      sensitivity: "base",
      numeric: true,
    });

    if (byName !== 0) return byName;

    return String(a.localidad || "").localeCompare(
      String(b.localidad || ""),
      "es",
      {
        sensitivity: "base",
        numeric: true,
      }
    );
  });
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
  const sortedSources = sortM3uSources(sources);

  const totalSources = sortedSources.length;
  const activeSources = sortedSources.filter(
    (source) => source.estado === "activo"
  ).length;
  const suspendedSources = sortedSources.filter(
    (source) => source.estado !== "activo"
  ).length;
  const autoSources = sortedSources.filter((source) =>
    Boolean(source.importacionAutomatica)
  ).length;
  const importedSources = sortedSources.filter((source) =>
    Boolean(source.ultimaImportacion)
  ).length;

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const created = searchParams?.created || "0";
  const updated = searchParams?.updated || "0";
  const detected = searchParams?.detected || "0";

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          title="Fuentes M3U"
          description="Administrá las listas M3U que alimentan el catálogo de canales del sistema."
          actionHref="/configuracion/m3u-sources/new"
          actionLabel="Nueva fuente"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && <AlertBox tone="red">{error}</AlertBox>}

            {success === "source-created" && (
              <AlertBox>Fuente creada correctamente.</AlertBox>
            )}

            {success === "source-updated" && (
              <AlertBox>Fuente actualizada correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>Estado de la fuente actualizado correctamente.</AlertBox>
            )}

            {success === "import-completed" && (
              <AlertBox tone="cyan">
                Importación completada. Detectados:{" "}
                <strong>{detected}</strong> · Nuevos:{" "}
                <strong>{created}</strong> · Actualizados:{" "}
                <strong>{updated}</strong>
              </AlertBox>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard title="Total" value={totalSources} desc="Fuentes cargadas" />

          <KpiCard
            title="Activas"
            value={activeSources}
            desc="Habilitadas"
            tone="green"
          />

          <KpiCard
            title="Suspend."
            value={suspendedSources}
            desc="Bloqueadas"
            tone={suspendedSources > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Auto"
            value={autoSources}
            desc="Importación auto"
            tone="cyan"
          />

          <KpiCard
            title="Importadas"
            value={importedSources}
            desc="Con historial"
            tone={importedSources > 0 ? "cyan" : "amber"}
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[1040px]">
            <TableHead>
              <tr>
                <th className="w-[300px] px-3 py-2 text-left font-medium">
                  Fuente
                </th>

                <th className="w-[150px] px-3 py-2 text-left font-medium">
                  Localidad
                </th>

                <th className="w-[80px] px-3 py-2 text-center font-medium">
                  Prior.
                </th>

                <th className="w-[90px] px-3 py-2 text-center font-medium">
                  Auto
                </th>

                <th className="w-[190px] px-3 py-2 text-left font-medium">
                  Última importación
                </th>

                <th className="w-[130px] px-3 py-2 text-center font-medium">
                  Estado
                </th>

                <th className="w-[220px] px-3 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {sortedSources.length === 0 ? (
                <EmptyTableRow colSpan={7}>
                  No hay fuentes M3U registradas.
                </EmptyTableRow>
              ) : (
                sortedSources.map((source, index) => {
                  const isActive = source.estado === "activo";

                  return (
                    <TableRow key={source._id} index={index}>
                      <td className="px-3 py-3">
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                            {source.nombre}
                          </p>

                          <p
                            className="mt-1 max-w-[280px] truncate text-[10px] text-slate-500 dark:text-slate-400"
                            title={source.urlFuente}
                          >
                            {source.urlFuente}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="block max-w-[140px] truncate text-[11px] text-slate-600 dark:text-slate-300">
                          {source.localidad || "—"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <CodeBadge>{source.prioridad ?? "—"}</CodeBadge>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          tone={source.importacionAutomatica ? "cyan" : "slate"}
                          className="w-[52px]"
                        >
                          {source.importacionAutomatica ? "Sí" : "No"}
                        </StatusBadge>
                      </td>

                      <td className="px-3 py-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatDate(source.ultimaImportacion)}
                        </span>
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
                          <form
                            action={`/api/configuracion/m3u-sources/${source._id}/import`}
                            method="POST"
                          >
                            <ActionButton tone="cyan">Import.</ActionButton>
                          </form>

                          <ActionLink
                            href={`/configuracion/m3u-sources/${source._id}/edit`}
                          >
                            Editar
                          </ActionLink>

                          <form
                            action={`/api/configuracion/m3u-sources/${source._id}/toggle-status`}
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
            Las fuentes activas alimentan el catálogo base de canales. Al
            importar, los canales nuevos se crean, los existentes se actualizan
            y los removidos de la lista quedan suspendidos.
          </DashboardFooterNote>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}