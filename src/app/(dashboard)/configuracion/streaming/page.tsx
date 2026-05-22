import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllStreamingNodes } from "@/services/streaming.service";
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

type StreamingNodeItem = {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: "origin" | "edge";
  host?: string;
  puerto?: number;
  urlBase?: string;
  estado: "activo" | "suspendido";
  habilitado?: boolean;
  prioridad?: number;
  healthStatus?: "online" | "offline" | "unknown";
  healthCheckPath?: string;
  healthTimeoutMs?: number;
  lastCheckAt?: string | Date | null;
  lastSeenAt?: string | Date | null;
  failureCount?: number;
  lastError?: string;
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildHostLabel(node: StreamingNodeItem) {
  if (node.host && node.puerto) {
    return `${node.host}:${node.puerto}`;
  }

  if (node.urlBase) {
    try {
      const url = new URL(node.urlBase);
      return `${url.hostname}${url.port ? `:${url.port}` : ""}`;
    } catch {
      return node.urlBase.replace(/^https?:\/\//, "");
    }
  }

  return "—";
}

function buildUrlLabel(node: StreamingNodeItem) {
  if (node.urlBase) return node.urlBase;

  if (node.host && node.puerto) {
    return `http://${node.host}:${node.puerto}`;
  }

  return "—";
}

function getHealthLabel(status?: string) {
  if (status === "online") return "Online";
  if (status === "offline") return "Offline";
  return "Unknown";
}

function sortStreamingNodes(nodes: StreamingNodeItem[]) {
  return [...nodes].sort((a, b) => {
    const tipoA = a.tipo === "origin" ? 0 : 1;
    const tipoB = b.tipo === "origin" ? 0 : 1;

    if (tipoA !== tipoB) return tipoA - tipoB;

    const nombreA = a.nombre || "";
    const nombreB = b.nombre || "";

    const byName = nombreA.localeCompare(nombreB, "es", {
      sensitivity: "base",
      numeric: true,
    });

    if (byName !== 0) return byName;

    const codigoA = a.codigo || "";
    const codigoB = b.codigo || "";

    return codigoA.localeCompare(codigoB, "es", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

export default async function StreamingNodesPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
  };
}) {
  await requireAdminPageAccess();

  const nodesRaw = (await getAllStreamingNodes()) as StreamingNodeItem[];
  const nodes = sortStreamingNodes(nodesRaw);

  const totalNodes = nodes.length;
  const origins = nodes.filter((node) => node.tipo === "origin").length;
  const edges = nodes.filter((node) => node.tipo === "edge").length;
  const online = nodes.filter((node) => node.healthStatus === "online").length;
  const offline = nodes.filter((node) => node.healthStatus === "offline").length;
  const inactive = nodes.filter((node) => node.estado !== "activo").length;

  const success = searchParams?.success || "";
  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          title="Nodos de streaming"
          description="Administración compacta de origins y edges, estado operativo, health check, host y puerto."
          actionHref="/configuracion/streaming/new"
          actionLabel="Nuevo nodo"
        />

        {(success || error) && (
          <div className="space-y-2 px-3 pt-3">
            {success === "node-created" && (
              <AlertBox>Nodo creado correctamente.</AlertBox>
            )}

            {success === "node-updated" && (
              <AlertBox>Nodo actualizado correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>Estado del nodo actualizado correctamente.</AlertBox>
            )}

            {success === "health-updated" && (
              <AlertBox>Health del nodo actualizado correctamente.</AlertBox>
            )}

            {error && <AlertBox tone="red">{error}</AlertBox>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="Total" value={totalNodes} desc="Nodos cargados" />

          <KpiCard
            title="Origins"
            value={origins}
            desc="Cabeceras"
            tone="cyan"
          />

          <KpiCard
            title="Edges"
            value={edges}
            desc="Localidades"
            tone="cyan"
          />

          <KpiCard title="Online" value={online} desc="Health OK" tone="green" />

          <KpiCard
            title="Offline"
            value={offline}
            desc="Sin respuesta"
            tone={offline > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Inactivos"
            value={inactive}
            desc="Suspendidos"
            tone={inactive > 0 ? "amber" : "green"}
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[1120px]">
            <TableHead>
              <tr>
                <th className="w-[250px] px-3 py-2 text-left font-medium">
                  Nodo
                </th>

                <th className="w-[100px] px-3 py-2 text-center font-medium">
                  Tipo
                </th>

                <th className="w-[300px] px-3 py-2 text-left font-medium">
                  Host / URL
                </th>

                <th className="w-[250px] px-3 py-2 text-left font-medium">
                  Health
                </th>

                <th className="w-[80px] px-3 py-2 text-center font-medium">
                  Prior.
                </th>

                <th className="w-[120px] px-3 py-2 text-center font-medium">
                  Estado
                </th>

                <th className="w-[218px] px-3 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {nodes.length === 0 ? (
                <EmptyTableRow colSpan={7}>
                  No hay nodos de streaming cargados.
                </EmptyTableRow>
              ) : (
                nodes.map((node, index) => {
                  const isActive = node.estado === "activo";
                  const healthStatus = node.healthStatus || "unknown";

                  return (
                    <TableRow key={node._id} index={index} align="top">
                      <td className="px-3 py-3">
                        <p className="max-w-[230px] truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                          {node.nombre}
                        </p>

                        <p className="mt-1 max-w-[230px] truncate text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Código: {node.codigo || "—"}
                        </p>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          tone={node.tipo === "origin" ? "violet" : "cyan"}
                          className="w-[74px]"
                        >
                          {node.tipo === "origin" ? "Origin" : "Edge"}
                        </StatusBadge>
                      </td>

                      <td className="px-3 py-3">
                        <p className="max-w-[280px] truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                          {buildHostLabel(node)}
                        </p>

                        <p
                          className="mt-1 max-w-[280px] truncate text-[10px] text-slate-500 dark:text-slate-400"
                          title={buildUrlLabel(node)}
                        >
                          URL: {buildUrlLabel(node)}
                        </p>

                        <p className="mt-1 max-w-[280px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                          Path: {node.healthCheckPath || "/health"}
                        </p>
                      </td>

                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <StatusBadge
                            tone={
                              healthStatus === "online"
                                ? "green"
                                : healthStatus === "offline"
                                  ? "red"
                                  : "slate"
                            }
                            className="w-[82px]"
                          >
                            {getHealthLabel(healthStatus)}
                          </StatusBadge>

                          <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                            Check: {formatDateTime(node.lastCheckAt)}
                          </p>

                          <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                            Seen: {formatDateTime(node.lastSeenAt)}
                          </p>

                          <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                            Fallos: {Number(node.failureCount || 0)}
                          </p>

                          <p
                            className={`max-w-[220px] truncate text-[10px] leading-snug ${
                              node.lastError
                                ? "text-red-700 dark:text-red-300"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                            title={node.lastError || "—"}
                          >
                            Error: {node.lastError || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <CodeBadge>{node.prioridad ?? "—"}</CodeBadge>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge
                            tone={isActive ? "green" : "red"}
                            className="w-[92px]"
                          >
                            {isActive ? "Activo" : "Suspendido"}
                          </StatusBadge>

                          <span className="text-[10px] leading-none text-slate-500 dark:text-slate-500">
                            {Number(node.healthTimeoutMs || 2500)} ms
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <ActionLink
                            href={`/configuracion/streaming/${node._id}/edit`}
                          >
                            Editar
                          </ActionLink>

                          <form
                            action={`/api/configuracion/streaming/${node._id}/refresh-health`}
                            method="POST"
                          >
                            <ActionButton tone="cyan">Health</ActionButton>
                          </form>

                          <form
                            action={`/api/configuracion/streaming/${node._id}/toggle-status`}
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
            El worker puede verificar automáticamente el endpoint health de cada
            nodo. Los nodos suspendidos se consideran fuera de servicio.
          </DashboardFooterNote>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}