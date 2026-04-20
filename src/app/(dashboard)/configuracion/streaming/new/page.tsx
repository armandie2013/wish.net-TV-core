// import { requireAdminPageAccess } from "@/lib/auth-guards";

// export default async function NewStreamingNodePage({
//   searchParams,
// }: {
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

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
//             Nuevo servidor de streaming
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Registrá un origin o edge para la plataforma.
//           </p>
//         </div>

//         <form
//           action="/api/configuracion/streaming"
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 md:grid-cols-2">
//             <Field label="Nombre" name="nombre" required />

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Tipo
//               </label>
//               <select
//                 name="tipo"
//                 defaultValue="origin"
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               >
//                 <option value="origin">Origin</option>
//                 <option value="edge">Edge</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <Field label="URL base" name="urlBase" required />
//             </div>

//             <Field label="Host" name="host" />
//             <Field label="Puerto" name="puerto" type="number" defaultValue={80} min={1} required />
//             <Field label="Localidad" name="localidad" defaultValue="general" required />
//             <Field label="Prioridad" name="prioridad" type="number" defaultValue={1} min={1} required />

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Estado
//               </label>
//               <select
//                 name="estado"
//                 defaultValue="activo"
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
//               Guardar servidor
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

import { requireAdminPageAccess } from "@/lib/auth-guards";

export default async function NewStreamingNodePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Nuevo nodo de streaming
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Registrá un origin o edge con su endpoint de health. El código se
            genera automáticamente a partir del tipo y el nombre.
          </p>
        </div>

        <form
          action="/api/configuracion/streaming"
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Nombre"
                name="nombre"
                required
                placeholder="Ej: Origin Central o Edge Ancasti"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tipo
              </label>
              <select
                name="tipo"
                defaultValue="origin"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              >
                <option value="origin">Origin</option>
                <option value="edge">Edge</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                El código se generará automáticamente, por ejemplo:
                <span className="ml-1 font-semibold">ORIGIN-CENTRAL</span>
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Estado
              </label>
              <select
                name="estado"
                defaultValue="activo"
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
                required
                placeholder="http://192.168.10.30:4001"
              />
            </div>

            <Field
              label="Host"
              name="host"
              placeholder="192.168.10.30"
            />

            <Field
              label="Puerto"
              name="puerto"
              type="number"
              defaultValue={4001}
              min={1}
              required
            />

            <Field
              label="Prioridad"
              name="prioridad"
              type="number"
              defaultValue={1}
              min={1}
              required
            />

            <Field
              label="Ruta health"
              name="healthCheckPath"
              defaultValue="/health"
              required
            />

            <Field
              label="Timeout health (ms)"
              name="healthTimeoutMs"
              type="number"
              defaultValue={2500}
              min={500}
              required
            />

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                <input
                  type="checkbox"
                  name="habilitado"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-400 dark:focus:ring-cyan-500"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Habilitado para ser usado en la resolución de playback
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
                placeholder="Notas internas del nodo"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Guardar nodo
            </button>

            <a
              href="/configuracion/streaming"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Volver al listado
            </a>
          </div>
        </form>
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}