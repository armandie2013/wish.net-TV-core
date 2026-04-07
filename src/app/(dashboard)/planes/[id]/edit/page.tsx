// import { redirect } from "next/navigation";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getPlanById } from "@/services/plan.service";
// import { getAllChannels } from "@/services/channel.service";

// export default async function EditPlanPage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   let plan;
//   const channels = await getAllChannels();

//   try {
//     plan = await getPlanById(params.id);
//   } catch {
//     redirect("/planes");
//   }

//   const selectedChannelIds = new Set(
//     (plan.canalesPermitidos || []).map((channel: any) =>
//       String(channel._id)
//     )
//   );

//   const error =
//     searchParams?.error === "datos-invalidos"
//       ? "Revisá los datos ingresados"
//       : searchParams?.error
//       ? decodeURIComponent(searchParams.error)
//       : "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         {/* HEADER */}
//         <div className="border-b border-slate-800 px-6 py-6">
//           <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
//             Planes
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//             Editar plan
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Modificá los datos del plan.
//           </p>
//         </div>

//         {/* FORM */}
//         <form
//           action={`/api/planes/${plan._id}`}
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 lg:grid-cols-2">
//             <Field
//               label="Nombre"
//               name="nombre"
//               defaultValue={plan.nombre}
//               required
//             />

//             <Field
//               label="Precio en pesos"
//               name="precio"
//               type="number"
//               step="0.01"
//               defaultValue={plan.precio}
//               required
//             />

//             <Field
//               label="Conexiones permitidas"
//               name="conexionesPermitidas"
//               type="number"
//               min={1}
//               defaultValue={plan.conexionesPermitidas}
//               required
//             />

//             <SelectField label="Estado" name="estado" defaultValue={plan.estado}>
//               <option value="activo">Activo</option>
//               <option value="suspendido">Suspendido</option>
//             </SelectField>

//             <div className="lg:col-span-2">
//               <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                 Descripción
//               </label>
//               <textarea
//                 name="descripcion"
//                 rows={4}
//                 defaultValue={plan.descripcion}
//                 className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
//               />
//             </div>

//             {/* CANALES */}
//             <div className="lg:col-span-2">
//               <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
//                 <div className="mb-4">
//                   <h2 className="text-sm font-semibold text-slate-100">
//                     Canales permitidos
//                   </h2>
//                   <p className="mt-1 text-xs text-slate-500">
//                     Seleccioná los canales disponibles para este plan.
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
//                         className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-900/90"
//                       >
//                         <input
//                           type="checkbox"
//                           name="canalesPermitidos"
//                           value={channel._id}
//                           defaultChecked={selectedChannelIds.has(
//                             String(channel._id)
//                           )}
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

//           {/* ERROR */}
//           {error && (
//             <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               {error}
//             </div>
//           )}

//           {/* ACTIONS */}
//           <div className="border-t border-slate-800 pt-5">
//             <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
//               <button
//                 type="submit"
//                 className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
//               >
//                 Guardar cambios
//               </button>

//               <a
//                 href="/planes"
//                 className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
//               >
//                 Volver al listado
//               </a>
//             </div>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }

// /* ================= COMPONENTES ================= */

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
//         required={required}
//         className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
//       />
//     </div>
//   );
// }

// function SelectField({
//   label,
//   name,
//   defaultValue,
//   children,
// }: {
//   label: string;
//   name: string;
//   defaultValue?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//         {label}
//       </label>
//       <select
//         name={name}
//         defaultValue={defaultValue}
//         className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
//       >
//         {children}
//       </select>
//     </div>
//   );
// }

import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getPlanById } from "@/services/plan.service";
import { getAllChannels } from "@/services/channel.service";

type Channel = {
  _id: string;
  nombre: string;
  categoria?: string;
};

export default async function EditPlanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let plan;
  const channels = (await getAllChannels()) as Channel[];

  try {
    plan = await getPlanById(params.id);
  } catch {
    redirect("/planes");
  }

  const selectedChannelIds = new Set(
    (plan.canalesPermitidos || []).map((channel: any) => String(channel._id))
  );

  const groupedChannels = groupChannelsByCategory(channels);

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
          {/* HEADER */}
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Planes
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Editar plan
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Modificá los datos del plan.
            </p>
          </div>

          {/* FORM */}
          <form
            action={`/api/planes/${plan._id}`}
            method="POST"
            className="space-y-6 p-6"
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Field
                label="Nombre"
                name="nombre"
                defaultValue={plan.nombre}
                required
              />

              <Field
                label="Precio en pesos"
                name="precio"
                type="number"
                step="0.01"
                defaultValue={plan.precio}
                required
              />

              <Field
                label="Conexiones permitidas"
                name="conexionesPermitidas"
                type="number"
                min={1}
                defaultValue={plan.conexionesPermitidas}
                required
              />

              <SelectField label="Estado" name="estado" defaultValue={plan.estado}>
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </SelectField>

              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  rows={4}
                  defaultValue={plan.descripcion}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>

              {/* CANALES AGRUPADOS */}
              <div className="lg:col-span-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-100">
                        Canales permitidos
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Seleccioná los canales disponibles para este plan.
                        Están agrupados por categoría.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2">
                      <p className="text-xs text-slate-400 sm:text-sm">
                        Seleccionados actualmente:{" "}
                        <span className="font-semibold text-cyan-400">
                          {selectedChannelIds.size}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {channels.length === 0 ? (
                      <p className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-sm text-slate-500">
                        No hay canales cargados todavía.
                      </p>
                    ) : (
                      Object.entries(groupedChannels).map(([groupName, items]) => {
                        const selectedInGroup = items.filter((channel) =>
                          selectedChannelIds.has(String(channel._id))
                        ).length;

                        return (
                          <details
                            key={groupName}
                            open
                            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/40">
                              <div className="min-w-0">
                                <span className="truncate">{groupName}</span>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                {selectedInGroup > 0 && (
                                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                                    {selectedInGroup} seleccionados
                                  </span>
                                )}

                                <span className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-400">
                                  {items.length} canales
                                </span>
                              </div>
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
                                      defaultChecked={selectedChannelIds.has(
                                        String(channel._id)
                                      )}
                                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
                                    />

                                    <div className="min-w-0">
                                      <p className="font-medium text-slate-100">
                                        {channel.nombre}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {channel.categoria || "Sin categoría"}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </details>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="border-t border-slate-800 pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                >
                  Guardar cambios
                </button>

                <a
                  href="/planes"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
                >
                  Volver al listado
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ================= HELPERS ================= */

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

/* ================= COMPONENTES ================= */

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
        required={required}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
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
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}