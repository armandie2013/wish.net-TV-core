// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getAllChannels } from "@/services/channel.service";

// export default async function NewPlanPage({
//   searchParams,
// }: {
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   const channels = await getAllChannels();

//   const error =
//     searchParams?.error === "datos-invalidos"
//       ? "Revisá los datos ingresados"
//       : searchParams?.error
//       ? decodeURIComponent(searchParams.error)
//       : "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
//             Planes
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
//             Nuevo plan
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Creá un nuevo plan para la plataforma.
//           </p>
//         </div>

//         <form action="/api/planes" method="POST" className="space-y-6 p-6">
//           <div className="grid gap-5 md:grid-cols-2">
//             <Field label="Nombre" name="nombre" required />
//             <Field
//               label="Precio en pesos"
//               name="precio"
//               type="number"
//               step="0.01"
//               required
//             />
//             <Field
//               label="Conexiones permitidas"
//               name="conexionesPermitidas"
//               type="number"
//               defaultValue={1}
//               min={1}
//               required
//             />

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
//                 Descripción
//               </label>
//               <textarea
//                 name="descripcion"
//                 rows={4}
//                 className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//               />
//             </div>

//             <div className="md:col-span-2">
//               <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
//                 <div className="mb-4">
//                   <h2 className="text-sm font-semibold text-slate-100">
//                     Canales permitidos
//                   </h2>
//                   <p className="mt-1 text-xs text-slate-500">
//                     Seleccioná los canales que estarán disponibles para este plan.
//                   </p>
//                 </div>

//                 {channels.length === 0 ? (
//                   <p className="text-sm text-slate-500">
//                     No hay canales cargados todavía.
//                   </p>
//                 ) : (
//                   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//                     {channels.map((channel) => (
//                       <label
//                         key={channel._id}
//                         className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-300"
//                       >
//                         <input
//                           type="checkbox"
//                           name="canalesPermitidos"
//                           value={channel._id}
//                           className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
//                         />

//                         <div className="min-w-0">
//                           <p className="font-medium text-slate-100">
//                             {channel.nombre}
//                           </p>
//                           <p className="text-xs text-slate-500">
//                             {channel.categoria}
//                           </p>
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>
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
//               Guardar plan
//             </button>

//             <a
//               href="/planes"
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
//   step,
// }: {
//   label: string;
//   name: string;
//   type?: string;
//   required?: boolean;
//   defaultValue?: string | number;
//   min?: number;
//   step?: string;
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
//         step={step}
//         className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
//         required={required}
//       />
//     </div>
//   );
// }


import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllChannels } from "@/services/channel.service";

type Channel = {
  _id: string;
  nombre: string;
  categoria?: string;
};

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const channels = (await getAllChannels()) as Channel[];

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  const groupedChannels = groupChannelsByCategory(channels);

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Planes
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              Nuevo plan
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Creá un nuevo plan para la plataforma.
            </p>
          </div>

          <form action="/api/planes" method="POST" className="space-y-6 p-6">
            {/* Datos del plan */}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nombre" name="nombre" required />

              <Field
                label="Precio en pesos"
                name="precio"
                type="number"
                step="0.01"
                required
              />

              <Field
                label="Conexiones permitidas"
                name="conexionesPermitidas"
                type="number"
                defaultValue={1}
                min={1}
                required
              />

              <SelectField label="Estado" name="estado" defaultValue="activo">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </SelectField>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            {/* Canales agrupados */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    Canales permitidos
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Seleccioná los canales disponibles para este plan. Están
                    agrupados por categoría.
                  </p>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Buscar canal..."
                    className="h-10 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <p className="text-sm text-slate-300">
                  Total de canales disponibles:{" "}
                  <span className="font-semibold text-cyan-400">
                    {channels.length}
                  </span>
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {channels.length === 0 ? (
                  <p className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-sm text-slate-500">
                    No hay canales cargados todavía.
                  </p>
                ) : (
                  Object.entries(groupedChannels).map(([groupName, items]) => (
                    <details
                      key={groupName}
                      open
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/40">
                        <span className="truncate">{groupName}</span>
                        <span className="shrink-0 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-400">
                          {items.length} canales
                        </span>
                      </summary>

                      <div className="border-t border-slate-800 p-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {items.map((channel) => (
                            <label
                              key={channel._id}
                              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-300 transition hover:border-cyan-500/30 hover:bg-slate-900"
                            >
                              <input
                                type="checkbox"
                                name="canalesPermitidos"
                                value={channel._id}
                                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
                              />

                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-100">
                                  {channel.nombre}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {channel.categoria || "Sin categoría"}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
              >
                Guardar plan
              </button>

              <a
                href="/planes"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Volver al listado
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function groupChannelsByCategory(channels: Channel[]) {
  return channels.reduce<Record<string, Channel[]>>((acc, channel) => {
    const group = channel.categoria?.trim() || "Sin categoría";

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(channel);
    return acc;
  }, {});
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        step={step}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}