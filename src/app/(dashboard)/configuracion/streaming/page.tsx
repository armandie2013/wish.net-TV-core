// import Link from "next/link";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getAllStreamingNodes } from "@/services/streaming.service";

// export default async function StreamingPage({
//   searchParams,
// }: {
//   searchParams?: { error?: string; success?: string };
// }) {
//   await requireAdminPageAccess();

//   const nodes = await getAllStreamingNodes();

//   const error = searchParams?.error
//     ? decodeURIComponent(searchParams.error)
//     : "";

//   const success = searchParams?.success || "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
//                 Configuración
//               </p>
//               <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//                 Streaming
//               </h1>
//               <p className="mt-2 text-sm text-slate-400">
//                 Administrá servidores origin y edge para la entrega de contenido.
//               </p>
//             </div>

//             <Link
//               href="/configuracion/streaming/new"
//               className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
//             >
//               Nuevo servidor
//             </Link>
//           </div>
//         </div>

//         {error && (
//           <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//             {error}
//           </div>
//         )}

//         {success === "node-created" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Servidor creado correctamente.
//           </div>
//         )}

//         {success === "node-updated" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Servidor actualizado correctamente.
//           </div>
//         )}

//         {success === "status-updated" && (
//           <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
//             Estado del servidor actualizado correctamente.
//           </div>
//         )}

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-slate-950/70">
//               <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
//                 <th className="px-6 py-4 font-semibold">Nombre</th>
//                 <th className="px-6 py-4 font-semibold">Tipo</th>
//                 <th className="px-6 py-4 font-semibold">URL base</th>
//                 <th className="px-6 py-4 font-semibold">Localidad</th>
//                 <th className="px-6 py-4 font-semibold">Prioridad</th>
//                 <th className="px-6 py-4 font-semibold">Estado</th>
//                 <th className="px-6 py-4 font-semibold">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {nodes.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="px-6 py-10 text-center text-sm text-slate-500"
//                   >
//                     No hay servidores registrados.
//                   </td>
//                 </tr>
//               ) : (
//                 nodes.map((node) => (
//                   <tr
//                     key={node._id}
//                     className="border-b border-slate-800/80 text-slate-300 last:border-b-0"
//                   >
//                     <td className="px-6 py-4">
//                       <p className="font-medium text-slate-100">{node.nombre}</p>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
//                         {node.tipo}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-slate-400">
//                       <span className="block max-w-[360px] truncate">
//                         {node.urlBase}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-slate-400">
//                       {node.localidad}
//                     </td>

//                     <td className="px-6 py-4 text-slate-300">
//                       {node.prioridad}
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
//                           node.estado === "activo"
//                             ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
//                             : "border border-red-500/20 bg-red-500/10 text-red-400"
//                         }`}
//                       >
//                         {node.estado}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex flex-wrap gap-2">
//                         <Link
//                           href={`/configuracion/streaming/${node._id}/edit`}
//                           className="inline-flex rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
//                         >
//                           Editar
//                         </Link>

//                         <form
//                           action={`/api/configuracion/streaming/${node._id}/toggle-status`}
//                           method="POST"
//                         >
//                           <button
//                             type="submit"
//                             className={`inline-flex rounded-xl px-3 py-2 text-xs font-semibold transition ${
//                               node.estado === "activo"
//                                 ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
//                                 : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
//                             }`}
//                           >
//                             {node.estado === "activo" ? "Suspender" : "Activar"}
//                           </button>
//                         </form>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </section>
//   );
// }

import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllStreamingNodes } from "@/services/streaming.service";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-AR");
  } catch {
    return "—";
  }
}

function HealthBadge({
  healthStatus,
}: {
  healthStatus?: "unknown" | "online" | "offline" | string;
}) {
  const status = healthStatus || "unknown";

  if (status === "online") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        Online
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        Offline
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      Unknown
    </span>
  );
}

function StateBadge({
  estado,
  habilitado,
}: {
  estado: string;
  habilitado?: boolean;
}) {
  if (estado !== "activo") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        Suspendido
      </span>
    );
  }

  if (habilitado === false) {
    return (
      <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
        Deshabilitado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
      Activo
    </span>
  );
}

export default async function StreamingPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const nodes = await getAllStreamingNodes();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
                Configuración
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Nodos de streaming
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Administrá origin y edges, su estado operativo y el health check
                del servicio.
              </p>
            </div>

            <Link
              href="/configuracion/streaming/new"
              className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Nuevo nodo
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success === "node-created" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Nodo creado correctamente.
          </div>
        )}

        {success === "node-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Nodo actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Estado del nodo actualizado correctamente.
          </div>
        )}

        {success === "health-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Health check actualizado correctamente.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900/95">
              <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800">
                <th className="px-6 py-4 font-semibold">Nodo</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">URL / Host</th>
                <th className="px-6 py-4 font-semibold">Health</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {nodes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No hay nodos registrados.
                  </td>
                </tr>
              ) : (
                nodes.map((node) => (
                  <tr
                    key={node._id}
                    className="border-b border-slate-200 text-slate-700 last:border-b-0 dark:border-slate-800/80 dark:text-slate-300"
                  >
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {node.nombre}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Código: {node.codigo}
                        </p>
                        {node.observaciones ? (
                          <p className="max-w-[280px] text-xs text-slate-500 dark:text-slate-400">
                            {node.observaciones}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          node.tipo === "origin"
                            ? "border border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300"
                            : "border border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300"
                        }`}
                      >
                        {node.tipo}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1 text-xs">
                        <p className="max-w-[340px] break-all text-slate-800 dark:text-slate-200">
                          {node.urlBase}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          Host: {node.host || "—"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          Puerto: {node.puerto}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          Path: {node.healthCheckPath || "/health"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        <HealthBadge healthStatus={node.healthStatus} />
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <p>Último check: {formatDate(node.lastCheckAt)}</p>
                          <p>Último seen: {formatDate(node.lastSeenAt)}</p>
                          <p>Fallos: {node.failureCount ?? 0}</p>
                          <p className="max-w-[220px] truncate">
                            Error: {node.lastError || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top text-slate-700 dark:text-slate-300">
                      {node.prioridad}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        <StateBadge
                          estado={node.estado}
                          habilitado={node.habilitado}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Timeout: {node.healthTimeoutMs} ms
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex max-w-[220px] flex-wrap gap-2">
                        <Link
                          href={`/configuracion/streaming/${node._id}/edit`}
                          className="inline-flex rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        >
                          Editar
                        </Link>

                        <form
                          action={`/api/configuracion/streaming/${node._id}/refresh-health`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="inline-flex rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-200 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                          >
                            Refresh health
                          </button>
                        </form>

                        <form
                          action={`/api/configuracion/streaming/${node._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              node.estado === "activo"
                                ? "border border-red-300 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                : "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            }`}
                          >
                            {node.estado === "activo" ? "Suspender" : "Activar"}
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