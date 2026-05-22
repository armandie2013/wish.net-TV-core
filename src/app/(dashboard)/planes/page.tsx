import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllPlans } from "@/services/plan.service";
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

type PlanGridItem = {
  habilitado?: boolean;
  channelId?: string | null;
};

type PlanItem = {
  _id: string;
  nombre: string;
  descripcion?: string | null;
  cantidadCanales?: number;
  estado: string;
  grillaCanales?: PlanGridItem[];
};

function getEnabledChannels(plan: PlanItem) {
  if (!Array.isArray(plan.grillaCanales)) return 0;

  return plan.grillaCanales.filter((item) => item.habilitado && item.channelId)
    .length;
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
  };
}) {
  await requireAdminPageAccess();

  const plans = (await getAllPlans()) as PlanItem[];

  const sortedPlans = [...plans].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
      sensitivity: "base",
      numeric: true,
    })
  );

  const totalPlans = sortedPlans.length;
  const activePlans = sortedPlans.filter((plan) => plan.estado === "activo")
    .length;
  const suspendedPlans = sortedPlans.filter((plan) => plan.estado !== "activo")
    .length;
  const totalPositions = sortedPlans.reduce(
    (acc, plan) => acc + Number(plan.cantidadCanales || 0),
    0
  );
  const totalEnabledChannels = sortedPlans.reduce(
    (acc, plan) => acc + getEnabledChannels(plan),
    0
  );

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          eyebrow="Planes"
          title="Listado de planes"
          description="Administrá la grilla lineal de cada plan y la cantidad de canales habilitados."
          actionHref="/planes/new"
          actionLabel="Nuevo plan"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && <AlertBox tone="red">{error}</AlertBox>}

            {success === "plan-created" && (
              <AlertBox>Plan creado correctamente.</AlertBox>
            )}

            {success === "plan-updated" && (
              <AlertBox>Plan actualizado correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>Estado del plan actualizado correctamente.</AlertBox>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard title="Total" value={totalPlans} desc="Planes cargados" />

          <KpiCard
            title="Activos"
            value={activePlans}
            desc="Disponibles"
            tone="green"
          />

          <KpiCard
            title="Suspend."
            value={suspendedPlans}
            desc="Bloqueados"
            tone={suspendedPlans > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Posiciones"
            value={totalPositions}
            desc="Total de espacios"
            tone="cyan"
          />

          <KpiCard
            title="Habilitados"
            value={totalEnabledChannels}
            desc="Canales asignados"
            tone="cyan"
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[860px]">
            <TableHead>
              <tr>
                <th className="w-[220px] px-2 py-2 text-left font-medium">
                  Plan
                </th>

                <th className="px-2 py-2 text-left font-medium">
                  Descripción
                </th>

                <th className="w-[110px] px-2 py-2 text-center font-medium">
                  Posiciones
                </th>

                <th className="w-[120px] px-2 py-2 text-center font-medium">
                  Habilitados
                </th>

                <th className="w-[110px] px-2 py-2 text-center font-medium">
                  Estado
                </th>

                <th className="w-[170px] px-2 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {sortedPlans.length === 0 ? (
                <EmptyTableRow colSpan={6}>
                  No hay planes registrados.
                </EmptyTableRow>
              ) : (
                sortedPlans.map((plan, index) => {
                  const isActive = plan.estado === "activo";
                  const habilitados = getEnabledChannels(plan);
                  const posiciones = Number(plan.cantidadCanales || 0);
                  const percent =
                    posiciones > 0
                      ? Math.round((habilitados / posiciones) * 100)
                      : 0;

                  return (
                    <TableRow key={plan._id} index={index} align="top">
                      <td className="px-2 py-2">
                        <p className="max-w-[200px] truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                          {plan.nombre}
                        </p>
                      </td>

                      <td className="px-2 py-2">
                        <p className="line-clamp-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                          {plan.descripcion || "—"}
                        </p>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <CodeBadge>{posiciones}</CodeBadge>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {habilitados}/{posiciones}
                        </span>

                        <div className="mx-auto mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-full ${
                              percent >= 80
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : percent > 0
                                  ? "bg-cyan-500 dark:bg-cyan-400"
                                  : "bg-slate-400 dark:bg-slate-600"
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <StatusBadge
                          tone={isActive ? "green" : "red"}
                          className="w-[92px]"
                        >
                          {isActive ? "Activo" : "Suspendido"}
                        </StatusBadge>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ActionLink href={`/planes/${plan._id}/edit`}>
                            Editar
                          </ActionLink>

                          <form
                            action={`/api/planes/${plan._id}/toggle-status`}
                            method="POST"
                          >
                            <ActionButton
                              type="submit"
                              tone={isActive ? "red" : "green"}
                            >
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
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}