import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllPlans } from "@/services/plan.service";
import Link from "next/link";

export default async function PlansPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
  };
}) {
  await requireAdminPageAccess();

  const plans = await getAllPlans();

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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Planes
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Listado de planes
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Administrá los planes disponibles del sistema.
              </p>
            </div>

            <Link
              href="/planes/new"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Nuevo plan
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success === "plan-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Plan creado correctamente.
          </div>
        )}

        {success === "plan-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Plan actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Estado del plan actualizado correctamente.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold">Canales</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold">Conexiones</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay planes registrados.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="border-b border-slate-800/80 text-slate-300 transition hover:bg-slate-950/30 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-100">{plan.nombre}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {plan.descripcion || "-"}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {plan.canalesPermitidos?.length || 0}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-100">
                      {formatCurrency(plan.precio)}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {plan.conexionesPermitidas}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          plan.estado === "activo"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {plan.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/planes/${plan._id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/80"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/planes/${plan._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              plan.estado === "activo"
                                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {plan.estado === "activo" ? "Suspender" : "Activar"}
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}