// import { redirect } from "next/navigation";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getUserById } from "@/services/user.service";
// import { getAllPlans } from "@/services/plan.service";

// export default async function EditUserPage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   let user;
//   const plans = await getAllPlans();

//   try {
//     user = await getUserById(params.id);
//   } catch {
//     redirect("/users");
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
//           <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
//             Usuarios
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//             Editar usuario
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Modificá los datos de la cuenta seleccionada.
//           </p>
//         </div>

//         <form
//           action={`/api/users/${user._id}`}
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 lg:grid-cols-2">
//             <Field
//               label="Nombre"
//               name="nombre"
//               defaultValue={user.nombre}
//               required
//             />

//             <Field
//               label="Email"
//               name="email"
//               type="email"
//               defaultValue={user.email}
//               required
//             />

//             <SelectField label="Rol" name="rol" defaultValue={user.rol}>
//               <option value="admin">Admin</option>
//               <option value="operador">Operador</option>
//               <option value="cliente">Cliente</option>
//             </SelectField>

//             <SelectField label="Estado" name="estado" defaultValue={user.estado}>
//               <option value="activo">Activo</option>
//               <option value="suspendido">Suspendido</option>
//             </SelectField>

//             <Field
//               label="Localidad"
//               name="localidad"
//               defaultValue={user.localidad}
//               required
//             />

//             <Field
//               label="Conexiones permitidas"
//               name="conexionesPermitidas"
//               type="number"
//               defaultValue={user.conexionesPermitidas}
//               min={1}
//               required
//             />

//             <div className="lg:col-span-2">
//               <SelectField
//                 label="Plan asignado"
//                 name="planId"
//                 defaultValue={user.planId?._id || ""}
//               >
//                 <option value="">Sin plan</option>
//                 {plans
//                   .filter(
//                     (plan) =>
//                       plan.estado === "activo" || plan._id === user.planId?._id
//                   )
//                   .map((plan) => (
//                     <option key={plan._id} value={plan._id}>
//                       {plan.nombre}
//                     </option>
//                   ))}
//               </SelectField>
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               {error}
//             </div>
//           )}

//           <div className="border-t border-slate-800 pt-5">
//             <div className="flex flex-wrap items-center gap-3">
//               <button
//                 type="submit"
//                 className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
//               >
//                 Guardar cambios
//               </button>

//               <a
//                 href="/users"
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
import { getUserById } from "@/services/user.service";
import { getAllLocations } from "@/services/location.service";
import { getAllPlans } from "@/services/plan.service";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let user;

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const locations = await getAllLocations();
  const plans = await getAllPlans();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  const success = searchParams?.success || "";

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-950 dark:to-slate-950">
          <div className="border-b border-slate-300 px-5 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700 dark:text-cyan-400">
                  Users
                </p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  Editar usuario
                </h1>
                <p className="mt-1 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                  Modificá los datos generales y la localidad asociada.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/users"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Volver al listado
                </a>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 xl:flex-row">
            <form
              action={`/api/users/${user._id}`}
              method="POST"
              className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex min-h-0 flex-1 flex-col justify-between">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label="Nombre"
                    name="nombre"
                    defaultValue={user.nombre}
                    required
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                  />

                  <SelectField label="Rol" name="rol" defaultValue={user.rol}>
                    <option value="admin">Admin</option>
                    <option value="operador">Operador</option>
                    <option value="cliente">Cliente</option>
                  </SelectField>

                  <SelectField label="Estado" name="estado" defaultValue={user.estado}>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </SelectField>

                  <SelectField
                    label="Localidad"
                    name="localidadId"
                    defaultValue={user.localidadId?._id || ""}
                  >
                    <option value="">Sin asociar</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.nombre}
                        {location.codigo ? ` · ${location.codigo}` : ""}
                      </option>
                    ))}
                  </SelectField>

                  <Field
                    label="Conexiones permitidas"
                    name="conexionesPermitidas"
                    type="number"
                    defaultValue={user.conexionesPermitidas}
                    min={1}
                    required
                  />

                  <div className="md:col-span-2">
                    <SelectField
                      label="Plan asignado"
                      name="planId"
                      defaultValue={user.planId?._id || ""}
                    >
                      <option value="">Sin plan</option>
                      {plans
                        .filter(
                          (plan: any) =>
                            plan.estado === "activo" || plan._id === user.planId?._id
                        )
                        .map((plan: any) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.nombre}
                          </option>
                        ))}
                    </SelectField>
                  </div>
                </div>

                {success === "user-updated" && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    Usuario actualizado correctamente.
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="mt-5 border-t border-slate-300 pt-5 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                    >
                      Guardar cambios
                    </button>

                    <a
                      href="/users"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800/80"
                    >
                      Cancelar
                    </a>
                  </div>
                </div>
              </div>
            </form>

            <aside className="w-full xl:w-[320px]">
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
                  Resolución de servicio
                </h2>

                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    La localidad técnica define desde qué nodo se resolverá el
                    servicio.
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/70">
                    User → Localidad → Nodo principal → Fallback
                  </div>

                  <p>
                    Localidad actual:
                    <span className="ml-1 font-semibold text-slate-800 dark:text-slate-200">
                      {user.localidadId?.nombre || "Sin asociar"}
                    </span>
                  </p>
                </div>
              </div>
            </aside>
          </div>
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
        required={required}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100"
      >
        {children}
      </select>
    </div>
  );
}