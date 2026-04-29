import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllPlans } from "@/services/plan.service";
import Link from "next/link";

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

function StateBadge({ estado }: { estado: string }) {
  if (estado === "activo") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        Activo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
      Suspendido
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
        No hay planes registrados.
      </td>
    </tr>
  );
}

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
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
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
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Planes
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Listado de planes
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Administrá la grilla lineal de cada plan y la cantidad de
                canales habilitados.
              </p>
            </div>

            <Link
              href="/planes/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nuevo plan
            </Link>
          </div>
        </div>

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success === "plan-created" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Plan creado correctamente.
              </div>
            )}

            {success === "plan-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Plan actualizado correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado del plan actualizado correctamente.
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <Kpi title="Total" value={totalPlans} desc="Planes cargados" />

          <Kpi
            title="Activos"
            value={activePlans}
            desc="Disponibles"
            tone="green"
          />

          <Kpi
            title="Suspend."
            value={suspendedPlans}
            desc="Bloqueados"
            tone={suspendedPlans > 0 ? "red" : "green"}
          />

          <Kpi
            title="Posiciones"
            value={totalPositions}
            desc="Total de espacios"
            tone="cyan"
          />

          <Kpi
            title="Habilitados"
            value={totalEnabledChannels}
            desc="Canales asignados"
            tone="cyan"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[860px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
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
                  <th className="w-[170px] px-2 py-2 text-left font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedPlans.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedPlans.map((plan, index) => {
                    const habilitados = getEnabledChannels(plan);
                    const posiciones = Number(plan.cantidadCanales || 0);
                    const percent =
                      posiciones > 0
                        ? Math.round((habilitados / posiciones) * 100)
                        : 0;

                    return (
                      <tr
                        key={plan._id}
                        className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                          index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                        }`}
                      >
                        <td className="px-2 py-2">
                          <p className="max-w-[200px] truncate font-medium text-slate-900 dark:text-white">
                            {plan.nombre}
                          </p>
                        </td>

                        <td className="px-2 py-2">
                          <p className="line-clamp-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                            {plan.descripcion || "—"}
                          </p>
                        </td>

                        <td className="px-2 py-2 text-center">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {posiciones}
                          </span>
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
                          <StateBadge estado={plan.estado} />
                        </td>

                        <td className="px-2 py-2">
                          <div className="flex max-w-[160px] flex-wrap gap-1.5">
                            <Link
                              href={`/planes/${plan._id}/edit`}
                              className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                            >
                              Editar
                            </Link>

                            <form
                              action={`/api/planes/${plan._id}/toggle-status`}
                              method="POST"
                            >
                              <button
                                type="submit"
                                className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                  plan.estado === "activo"
                                    ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                    : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                                }`}
                              >
                                {plan.estado === "activo"
                                  ? "Susp."
                                  : "Activar"}
                              </button>
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