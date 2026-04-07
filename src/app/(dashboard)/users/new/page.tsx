// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getAllPlans } from "@/services/plan.service";

// export default async function NewUserPage({
//   searchParams,
// }: {
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   const plans = await getAllPlans();

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
//             Nuevo usuario
//           </h1>
//           <p className="mt-2 max-w-3xl text-sm text-slate-400">
//             Creá una nueva cuenta para el sistema. La contraseña temporal se
//             generará automáticamente y el usuario deberá cambiarla en su primer
//             ingreso.
//           </p>
//         </div>

//         <form action="/api/users" method="POST" className="space-y-6 p-6">
//           <div className="grid gap-5 lg:grid-cols-2">
//             <Field label="Nombre" name="nombre" required />

//             <Field label="Email" name="email" type="email" required />

//             <Field
//               label="Localidad"
//               name="localidad"
//               defaultValue="principal"
//               required
//             />

//             <SelectField label="Rol" name="rol" defaultValue="cliente">
//               <option value="admin">Admin</option>
//               <option value="operador">Operador</option>
//               <option value="cliente">Cliente</option>
//             </SelectField>

//             <SelectField label="Estado" name="estado" defaultValue="activo">
//               <option value="activo">Activo</option>
//               <option value="suspendido">Suspendido</option>
//             </SelectField>

//             <Field
//               label="Conexiones permitidas"
//               name="conexionesPermitidas"
//               type="number"
//               defaultValue={1}
//               min={1}
//               required
//             />

//             <div className="lg:col-span-2">
//               <SelectField label="Plan asignado" name="planId" defaultValue="">
//                 <option value="">Sin plan</option>
//                 {plans
//                   .filter((plan) => plan.estado === "activo")
//                   .map((plan) => (
//                     <option key={plan._id} value={plan._id}>
//                       {plan.nombre}
//                     </option>
//                   ))}
//               </SelectField>
//             </div>
//           </div>

//           <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
//             La contraseña inicial se genera automáticamente y se mostrará una
//             sola vez al crear el usuario.
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
//                 Guardar usuario
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

import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllPlans } from "@/services/plan.service";
import { getAllLocations } from "@/services/location.service";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const locations = await getAllLocations();
  const plans = await getAllPlans();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-950 dark:to-slate-950">
          <div className="border-b border-slate-300 px-5 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700 dark:text-cyan-400">
                  Usuarios
                </p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  Nuevo usuario
                </h1>
                <p className="mt-1 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                  Creá una nueva cuenta. La contraseña temporal se genera
                  automáticamente y se mostrará una sola vez.
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
              action="/api/users"
              method="POST"
              className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex min-h-0 flex-1 flex-col justify-between">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Nombre" name="nombre" required />

                  <Field label="Email" name="email" type="email" required />

                  <Field
                    label="Localidad"
                    name="localidad"
                    defaultValue="principal"
                    required
                  />

                  <SelectField label="Localidad técnica" name="localidadId" defaultValue="">
                    <option value="">Sin asociar</option>
                    {locations
                      .filter((location) => location.estado === "activo")
                      .map((location) => (
                        <option key={location._id} value={location._id}>
                          {location.nombre}
                          {location.codigo ? ` · ${location.codigo}` : ""}
                        </option>
                      ))}
                  </SelectField>

                  <SelectField label="Rol" name="rol" defaultValue="cliente">
                    <option value="admin">Admin</option>
                    <option value="operador">Operador</option>
                    <option value="cliente">Cliente</option>
                  </SelectField>

                  <SelectField
                    label="Estado"
                    name="estado"
                    defaultValue="activo"
                  >
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </SelectField>

                  <Field
                    label="Conexiones permitidas"
                    name="conexionesPermitidas"
                    type="number"
                    defaultValue={1}
                    min={1}
                    required
                  />

                  <div className="md:col-span-2">
                    <SelectField label="Plan asignado" name="planId" defaultValue="">
                      <option value="">Sin plan</option>
                      {plans
                        .filter((plan) => plan.estado === "activo")
                        .map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.nombre}
                          </option>
                        ))}
                    </SelectField>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-300 pt-4 dark:border-slate-800">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 sm:text-sm dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                    La contraseña inicial se genera automáticamente y se mostrará
                    una sola vez al crear el usuario.
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-xs text-red-700 sm:text-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Verificá rol, plan, localidad técnica y conexiones antes de guardar.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
                      >
                        Guardar usuario
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <aside className="hidden w-[400px] min-h-0 xl:flex xl:flex-col xl:gap-4">
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Configuración
                </p>

                <div className="mt-4 flex flex-1 flex-col gap-3">
                  <InfoCard
                    title="Rol"
                    text="Define el nivel de acceso y las pantallas visibles del usuario."
                  />
                  <InfoCard
                    title="Estado"
                    text="Controla si la cuenta puede ingresar al sistema."
                  />
                  <InfoCard
                    title="Plan"
                    text="Permite asignar desde el alta el servicio correspondiente."
                  />
                  <InfoCard
                    title="Localidad técnica"
                    text="Relaciona al usuario con una localidad real del sistema para resolver nodos de streaming."
                  />
                  <InfoCard
                    title="Conexiones"
                    text="Limita la cantidad de dispositivos o sesiones permitidas."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-300 bg-emerald-100 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Recomendación
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-700/90 dark:text-emerald-200/80">
                  Para clientes finales, dejá el rol en{" "}
                  <span className="font-semibold">Cliente</span>, asigná el plan
                  y, si corresponde, vinculá una{" "}
                  <span className="font-semibold">localidad técnica</span>.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        {...props}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-500 dark:focus:ring-cyan-500/10"
      />
    </div>
  );
}

function SelectField({ label, name, children, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <select
        name={name}
        {...props}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-cyan-500 dark:focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}

function InfoCard({ title, text }: any) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-xs font-semibold uppercase text-slate-800 dark:text-slate-500">{title}</p>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
}