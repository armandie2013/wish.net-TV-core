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
import { getAllPlans } from "@/services/plan.service";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let user;
  const plans = await getAllPlans();

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-950 shadow-2xl">
          {/* Header */}
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Usuarios
                </p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  Editar usuario
                </h1>
                <p className="mt-1 max-w-2xl text-xs text-slate-400 sm:text-sm">
                  Modificá los datos de la cuenta seleccionada.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                  Edición rápida
                </span>
                <span className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                  Datos existentes
                </span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 xl:flex-row">
            {/* Formulario */}
            <form
              action={`/api/users/${user._id}`}
              method="POST"
              className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex min-h-0 flex-1 flex-col justify-between">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label="Nombre"
                    name="nombre"
                    defaultValue={user.nombre}
                    placeholder="Ej: Juan Pérez"
                    required
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="usuario@empresa.com"
                    required
                  />

                  <SelectField label="Rol" name="rol" defaultValue={user.rol}>
                    <option value="admin">Admin</option>
                    <option value="operador">Operador</option>
                    <option value="cliente">Cliente</option>
                  </SelectField>

                  <SelectField
                    label="Estado"
                    name="estado"
                    defaultValue={user.estado}
                  >
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                  </SelectField>

                  <Field
                    label="Localidad"
                    name="localidad"
                    defaultValue={user.localidad}
                    placeholder="Ej: principal"
                    required
                  />

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
                          (plan) =>
                            plan.estado === "activo" ||
                            plan._id === user.planId?._id
                        )
                        .map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.nombre}
                          </option>
                        ))}
                    </SelectField>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-300 sm:text-sm">
                    Revisá cuidadosamente rol, estado, plan y conexiones antes
                    de guardar los cambios.
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 sm:text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Los cambios impactan sobre la cuenta actual del usuario.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/15 px-5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
                      >
                        Guardar cambios
                      </button>

                      <a
                        href="/users"
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 px-5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                      >
                        Volver al listado
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Panel lateral */}
            <aside className="hidden w-[360px] min-h-0 xl:flex xl:flex-col xl:gap-4">
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
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
                    text="Permite mantener o cambiar el servicio asignado."
                  />
                  <InfoCard
                    title="Conexiones"
                    text="Limita la cantidad de dispositivos o sesiones permitidas."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-semibold text-emerald-300">
                  Recomendación
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-200/80">
                  Antes de guardar, verificá que el{" "}
                  <span className="font-semibold">plan</span> y el{" "}
                  <span className="font-semibold">estado</span> sigan siendo los
                  correctos para este usuario.
                </p>
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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-200">
        {label}
      </label>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 text-sm text-slate-100 shadow-inner shadow-black/20 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-200">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          defaultValue={defaultValue}
          className="h-10 w-full appearance-none rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 pr-11 text-sm text-slate-100 shadow-inner shadow-black/20 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
        >
          {children}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}