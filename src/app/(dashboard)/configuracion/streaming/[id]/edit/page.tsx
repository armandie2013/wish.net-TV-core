// import { redirect } from "next/navigation";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getStreamingNodeById } from "@/services/streaming.service";

// export default async function EditStreamingNodePage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   let node;

//   try {
//     node = await getStreamingNodeById(params.id);
//   } catch {
//     redirect("/configuracion/streaming");
//   }

//   const error =
//     searchParams?.error === "datos-invalidos"
//       ? "Revisá los datos ingresados"
//       : searchParams?.error
//       ? decodeURIComponent(searchParams.error)
//       : "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
//             Configuración
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
//             Editar servidor de streaming
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Modificá los datos del nodo de streaming.
//           </p>
//         </div>

//         <form
//           action={`/api/configuracion/streaming/${node._id}`}
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 md:grid-cols-2">
//             <Field label="Nombre" name="nombre" defaultValue={node.nombre} required />

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Tipo
//               </label>
//               <select
//                 name="tipo"
//                 defaultValue={node.tipo}
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               >
//                 <option value="origin">Origin</option>
//                 <option value="edge">Edge</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <Field label="URL base" name="urlBase" defaultValue={node.urlBase} required />
//             </div>

//             <Field label="Host" name="host" defaultValue={node.host} />
//             <Field label="Puerto" name="puerto" type="number" defaultValue={node.puerto} min={1} required />
//             <Field label="Localidad" name="localidad" defaultValue={node.localidad} required />
//             <Field label="Prioridad" name="prioridad" type="number" defaultValue={node.prioridad} min={1} required />

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Estado
//               </label>
//               <select
//                 name="estado"
//                 defaultValue={node.estado}
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               >
//                 <option value="activo">Activo</option>
//                 <option value="suspendido">Suspendido</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Observaciones
//               </label>
//               <textarea
//                 name="observaciones"
//                 rows={4}
//                 defaultValue={node.observaciones}
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               {error}
//             </div>
//           )}

//           <div className="flex flex-wrap items-center gap-3">
//             <button
//               type="submit"
//               className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
//             >
//               Guardar cambios
//             </button>

//             <a
//               href="/configuracion/streaming"
//               className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
//             >
//               Volver al listado
//             </a>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// function Field({
//   label,
//   name,
//   type = "text",
//   required,
//   defaultValue,
//   min,
// }: {
//   label: string;
//   name: string;
//   type?: string;
//   required?: boolean;
//   defaultValue?: string | number;
//   min?: number;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//         {label}
//       </label>
//       <input
//         type={type}
//         name={name}
//         defaultValue={defaultValue}
//         min={min}
//         className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//         required={required}
//       />
//     </div>
//   );
// }

import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getStreamingNodeById } from "@/services/streaming.service";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-AR");
  } catch {
    return "—";
  }
}

export default async function EditStreamingNodePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let node;

  try {
    node = await getStreamingNodeById(params.id);
  } catch {
    redirect("/configuracion/streaming");
  }

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Editar nodo de streaming
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Modificá el origin o edge y revisá su estado actual.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form
            action={`/api/configuracion/streaming/${node._id}`}
            method="POST"
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Nombre"
                name="nombre"
                defaultValue={node.nombre}
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Código generado automáticamente
                </label>
                <input
                  type="text"
                  value={node.codigo}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue={node.tipo}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                >
                  <option value="origin">Origin</option>
                  <option value="edge">Edge</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Estado
                </label>
                <select
                  name="estado"
                  defaultValue={node.estado}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                >
                  <option value="activo">Activo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Field
                  label="URL base"
                  name="urlBase"
                  defaultValue={node.urlBase}
                  required
                />
              </div>

              <Field label="Host" name="host" defaultValue={node.host} />

              <Field
                label="Puerto"
                name="puerto"
                type="number"
                defaultValue={node.puerto}
                min={1}
                required
              />

              <Field
                label="Prioridad"
                name="prioridad"
                type="number"
                defaultValue={node.prioridad}
                min={1}
                required
              />

              <Field
                label="Ruta health"
                name="healthCheckPath"
                defaultValue={node.healthCheckPath || "/health"}
                required
              />

              <Field
                label="Timeout health (ms)"
                name="healthTimeoutMs"
                type="number"
                defaultValue={node.healthTimeoutMs || 2500}
                min={500}
                required
              />

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <input
                    type="checkbox"
                    name="habilitado"
                    value="true"
                    defaultChecked={Boolean(node.habilitado)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-400 dark:focus:ring-cyan-500"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Habilitado para la resolución de playback
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  rows={4}
                  defaultValue={node.observaciones || ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                Estado actualizado correctamente.
              </div>
            )}

            {success === "health-updated" && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                Health check actualizado correctamente.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
              >
                Guardar cambios
              </button>

              <a
                href="/configuracion/streaming"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Volver al listado
              </a>
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-slate-300 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              Estado actual
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <Info label="Health status" value={node.healthStatus || "unknown"} />
              <Info
                label="Último health check"
                value={formatDate(node.lastCheckAt)}
              />
              <Info label="Último seen" value={formatDate(node.lastSeenAt)} />
              <Info
                label="Fallos acumulados"
                value={String(node.failureCount ?? 0)}
              />
              <Info
                label="Último error"
                value={node.lastError || "—"}
                breakWords
              />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <form
                action={`/api/configuracion/streaming/${node._id}/refresh-health`}
                method="POST"
              >
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                >
                  Ejecutar health check
                </button>
              </form>

              <form
                action={`/api/configuracion/streaming/${node._id}/toggle-status`}
                method="POST"
              >
                <button
                  type="submit"
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    node.estado === "activo"
                      ? "border border-red-300 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      : "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  }`}
                >
                  {node.estado === "activo" ? "Suspender nodo" : "Activar nodo"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}

function Info({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-slate-800 dark:text-slate-200 ${
          breakWords ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}