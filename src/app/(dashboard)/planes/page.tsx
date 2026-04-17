// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getAllPlans } from "@/services/plan.service";
// import Link from "next/link";

// export default async function PlansPage({
//   searchParams,
// }: {
//   searchParams?: {
//     error?: string;
//     success?: string;
//   };
// }) {
//   await requireAdminPageAccess();

//   const plans = await getAllPlans();

//   const error = searchParams?.error
//     ? decodeURIComponent(searchParams.error)
//     : "";

//   const success = searchParams?.success || "";

//   return (
//     <section className="space-y-6 px-2 sm:px-4">
//       <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
//                 Planes
//               </p>
//               <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//                 Listado de planes
//               </h1>
//               <p className="mt-2 text-sm text-slate-400">
//                 Administrá la grilla lineal de cada plan.
//               </p>
//             </div>

//             <Link
//               href="/planes/new"
//               className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
//             >
//               Nuevo plan
//             </Link>
//           </div>
//         </div>

//         {error && (
//           <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//             {error}
//           </div>
//         )}

//         {success === "plan-created" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Plan creado correctamente.
//           </div>
//         )}

//         {success === "plan-updated" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Plan actualizado correctamente.
//           </div>
//         )}

//         {success === "status-updated" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Estado del plan actualizado correctamente.
//           </div>
//         )}

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
//               <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
//                 <th className="px-6 py-4 font-semibold">Nombre</th>
//                 <th className="px-6 py-4 font-semibold">Descripción</th>
//                 <th className="px-6 py-4 font-semibold">Posiciones</th>
//                 <th className="px-6 py-4 font-semibold">Habilitados</th>
//                 <th className="px-6 py-4 font-semibold">Estado</th>
//                 <th className="px-6 py-4 font-semibold">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {plans.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="px-6 py-10 text-center text-sm text-slate-500"
//                   >
//                     No hay planes registrados.
//                   </td>
//                 </tr>
//               ) : (
//                 plans.map((plan: any) => {
//                   const habilitados = Array.isArray(plan.grillaCanales)
//                     ? plan.grillaCanales.filter((item: any) => item.habilitado && item.channelId)
//                         .length
//                     : 0;

//                   return (
//                     <tr
//                       key={plan._id}
//                       className="border-b border-slate-800/80 text-slate-300 transition hover:bg-slate-950/30 last:border-b-0"
//                     >
//                       <td className="px-6 py-4">
//                         <p className="font-medium text-slate-100">{plan.nombre}</p>
//                       </td>

//                       <td className="px-6 py-4 text-slate-400">
//                         {plan.descripcion || "-"}
//                       </td>

//                       <td className="px-6 py-4 text-slate-300">
//                         {plan.cantidadCanales || 0}
//                       </td>

//                       <td className="px-6 py-4 text-slate-300">
//                         {habilitados}
//                       </td>

//                       <td className="px-6 py-4">
//                         <span
//                           className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
//                             plan.estado === "activo"
//                               ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
//                               : "border border-red-500/20 bg-red-500/10 text-red-400"
//                           }`}
//                         >
//                           {plan.estado}
//                         </span>
//                       </td>

//                       <td className="px-6 py-4">
//                         <div className="flex flex-wrap gap-2">
//                           <Link
//                             href={`/planes/${plan._id}/edit`}
//                             className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/80"
//                           >
//                             Editar
//                           </Link>

//                           <form
//                             action={`/api/planes/${plan._id}/toggle-status`}
//                             method="POST"
//                           >
//                             <button
//                               type="submit"
//                               className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
//                                 plan.estado === "activo"
//                                   ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
//                                   : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
//                               }`}
//                             >
//                               {plan.estado === "activo" ? "Suspender" : "Activar"}
//                             </button>
//                           </form>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// }

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
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        {/* HEADER */}
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
                Planes
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Listado de planes
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Administrá la grilla lineal de cada plan.
              </p>
            </div>

            <Link
              href="/planes/new"
              className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Nuevo plan
            </Link>
          </div>
        </div>

        {/* ALERTAS */}
        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success === "plan-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Plan creado correctamente.
          </div>
        )}

        {success === "plan-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Plan actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Estado del plan actualizado correctamente.
          </div>
        )}

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900/95">
              <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold">Posiciones</th>
                <th className="px-6 py-4 font-semibold">Habilitados</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay planes registrados.
                  </td>
                </tr>
              ) : (
                plans.map((plan: any) => {
                  const habilitados = Array.isArray(plan.grillaCanales)
                    ? plan.grillaCanales.filter(
                        (item: any) => item.habilitado && item.channelId
                      ).length
                    : 0;

                  return (
                    <tr
                      key={plan._id}
                      className="border-b border-slate-200 text-slate-700 transition hover:bg-slate-100/70 last:border-b-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950/30"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.nombre}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {plan.descripcion || "-"}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {plan.cantidadCanales || 0}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {habilitados}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            plan.estado === "activo"
                              ? "border border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border border-red-300 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {plan.estado}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/planes/${plan._id}/edit`}
                            className="rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Editar
                          </Link>

                          <form
                            action={`/api/planes/${plan._id}/toggle-status`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                plan.estado === "activo"
                                  ? "border border-red-300 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                  : "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                              }`}
                            >
                              {plan.estado === "activo" ? "Suspender" : "Activar"}
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
    </section>
  );
}