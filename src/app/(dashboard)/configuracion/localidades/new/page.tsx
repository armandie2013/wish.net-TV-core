// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getAllStreamingNodes } from "@/services/streaming.service";

// export default async function NewLocationPage({
//   searchParams,
// }: {
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   const nodes = await getAllStreamingNodes();

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
//             Nueva localidad
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Asociá una localidad a nodos de streaming.
//           </p>
//         </div>

//         <form
//           action="/api/configuracion/localidades"
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 md:grid-cols-2">
//             <Field label="Nombre" name="nombre" required />
//             <Field label="Código" name="codigo" required />

//             <div className="md:col-span-2">
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Descripción
//               </label>
//               <textarea
//                 name="descripcion"
//                 rows={3}
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Nodo principal
//               </label>
//               <select
//                 name="streamingNodeId"
//                 defaultValue=""
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               >
//                 <option value="">Sin asignar</option>
//                 {nodes
//                   .filter((node) => node.estado === "activo")
//                   .map((node) => (
//                     <option key={node._id} value={node._id}>
//                       {node.nombre} · {node.tipo}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Nodo fallback
//               </label>
//               <select
//                 name="fallbackStreamingNodeId"
//                 defaultValue=""
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               >
//                 <option value="">Sin fallback</option>
//                 {nodes
//                   .filter((node) => node.estado === "activo")
//                   .map((node) => (
//                     <option key={node._id} value={node._id}>
//                       {node.nombre} · {node.tipo}
//                     </option>
//                   ))}
//               </select>
//             </div>

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
//               Guardar localidad
//             </button>

//             <a
//               href="/configuracion/localidades"
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
//   required,
// }: {
//   label: string;
//   name: string;
//   required?: boolean;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//         {label}
//       </label>
//       <input
//         type="text"
//         name={name}
//         className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//         required={required}
//       />
//     </div>
//   );
// }

import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllStreamingNodes } from "@/services/streaming.service";

export default async function NewLocationPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const nodes = await getAllStreamingNodes();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
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
            Nueva localidad
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Asociá una localidad a nodos de streaming.
          </p>
        </div>

        <form
          action="/api/configuracion/localidades"
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nombre" name="nombre" required />
            <Field label="Código" name="codigo" required />

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Nodo principal
              </label>
              <select
                name="streamingNodeId"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              >
                <option value="">Sin asignar</option>
                {nodes
                  .filter((node) => node.estado === "activo")
                  .map((node) => (
                    <option key={node._id} value={node._id}>
                      {node.nombre} · {node.tipo}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Nodo fallback
              </label>
              <select
                name="fallbackStreamingNodeId"
                defaultValue=""
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              >
                <option value="">Sin fallback</option>
                {nodes
                  .filter((node) => node.estado === "activo")
                  .map((node) => (
                    <option key={node._id} value={node._id}>
                      {node.nombre} · {node.tipo}
                    </option>
                  ))}
              </select>
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
              Guardar localidad
            </button>

            <a
              href="/configuracion/localidades"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800"
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
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        type="text"
        name={name}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}