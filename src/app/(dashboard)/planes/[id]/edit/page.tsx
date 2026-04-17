// import { redirect } from "next/navigation";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getPlanById } from "@/services/plan.service";
// import { getAllChannels } from "@/services/channel.service";
// import PlanGridEditor from "@/components/planes/PlanGridEditor";

// type Channel = {
//   _id: string;
//   nombre: string;
//   categoria?: string;
//   logo?: string;
//   sourceName?: string;
//   estado?: string;
// };

// export default async function EditPlanPage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   const channels = (await getAllChannels()) as Channel[];

//   let plan: any;

//   try {
//     plan = await getPlanById(params.id);
//   } catch {
//     redirect("/planes");
//   }

//   const initialGrid =
//     Array.isArray(plan.grillaCanales) && plan.grillaCanales.length > 0
//       ? plan.grillaCanales.map((item: any, index: number) => ({
//           numero: item.numero || index + 1,
//           orden: item.orden || index + 1,
//           channelId:
//             typeof item.channelId === "object" && item.channelId?._id
//               ? String(item.channelId._id)
//               : typeof item.channelId === "string"
//               ? item.channelId
//               : "",
//           nombreVisible: item.nombreVisible || "",
//           habilitado: item.habilitado ?? true,
//           logo:
//             item.logo ||
//             (typeof item.channelId === "object" ? item.channelId?.logo || "" : ""),
//           categoria:
//             item.categoria ||
//             (typeof item.channelId === "object"
//               ? item.channelId?.categoria || ""
//               : ""),
//           sourceName:
//             item.sourceName ||
//             (typeof item.channelId === "object"
//               ? item.channelId?.sourceName || ""
//               : ""),
//         }))
//       : [];

//   const error =
//     searchParams?.error === "datos-invalidos"
//       ? "Revisá los datos ingresados"
//       : searchParams?.error
//       ? decodeURIComponent(searchParams.error)
//       : "";

//   return (
//     <section className="px-2 sm:px-4">
//       <div className="mx-auto max-w-7xl">
//         <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
//           <div className="border-b border-slate-800 px-6 py-6">
//             <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
//               Planes
//             </p>
//             <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//               Editar plan
//             </h1>
//             <p className="mt-2 text-sm text-slate-400">
//               Modificá la grilla lineal de este plan.
//             </p>
//           </div>

//           <form
//             action={`/api/planes/${plan._id}`}
//             method="POST"
//             className="space-y-6 p-6"
//           >
//             <div className="grid gap-5 lg:grid-cols-2">
//               <Field
//                 label="Nombre del plan"
//                 name="nombre"
//                 defaultValue={plan.nombre}
//                 required
//               />

//               <SelectField
//                 label="Estado"
//                 name="estado"
//                 defaultValue={plan.estado || "activo"}
//               >
//                 <option value="activo">Activo</option>
//                 <option value="suspendido">Suspendido</option>
//               </SelectField>

//               <div className="lg:col-span-2">
//                 <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//                   Descripción
//                 </label>
//                 <textarea
//                   name="descripcion"
//                   rows={4}
//                   defaultValue={plan.descripcion || ""}
//                   className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
//                 />
//               </div>
//             </div>

//             <input type="hidden" name="precio" value={String(plan.precio || 0)} />

//             <PlanGridEditor
//               channels={channels}
//               initialCantidad={plan.cantidadCanales || initialGrid.length || 1}
//               initialGrid={initialGrid}
//             />

//             {error && (
//               <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//                 {error}
//               </div>
//             )}

//             <div className="flex flex-wrap items-center gap-3">
//               <button
//                 type="submit"
//                 className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500"
//               >
//                 Guardar cambios
//               </button>

//               <a
//                 href="/planes"
//                 className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
//               >
//                 Volver al listado
//               </a>
//             </div>
//           </form>
//         </div>
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
//         className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
//         required={required}
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
//         className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
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
import PlanGridEditor from "@/components/planes/PlanGridEditor";

type Channel = {
  _id: string;
  nombre: string;
  categoria?: string;
  logo?: string;
  sourceName?: string;
  estado?: string;
};

export default async function EditPlanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const rawChannels = (await getAllChannels()) as any[];

  const channels: Channel[] = rawChannels.map((channel) => ({
    _id: String(channel._id),
    nombre: channel.nombre || "",
    categoria: channel.categoria || "",
    logo: channel.logo || "",
    sourceName: channel.sourceName || "",
    estado: channel.estado || "",
  }));

  let plan: any;

  try {
    plan = await getPlanById(params.id);
  } catch {
    redirect("/planes");
  }

  const initialGrid =
    Array.isArray(plan.grillaCanales) && plan.grillaCanales.length > 0
      ? plan.grillaCanales.map((item: any, index: number) => ({
          numero: item.numero || index + 1,
          orden: item.orden || index + 1,
          channelId:
            typeof item.channelId === "object" && item.channelId?._id
              ? String(item.channelId._id)
              : typeof item.channelId === "string"
                ? item.channelId
                : "",
          nombreVisible: item.nombreVisible || "",
          habilitado: item.habilitado ?? true,
          logo:
            item.logo ||
            (typeof item.channelId === "object"
              ? item.channelId?.logo || ""
              : ""),
          categoria:
            item.categoria ||
            (typeof item.channelId === "object"
              ? item.channelId?.categoria || ""
              : ""),
          sourceName:
            item.sourceName ||
            (typeof item.channelId === "object"
              ? item.channelId?.sourceName || ""
              : ""),
        }))
      : [];

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
            Planes
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Editar plan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Modificá la grilla lineal de este plan.
          </p>
        </div>

        <form
          action={`/api/planes/${plan._id}`}
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Nombre del plan"
              name="nombre"
              defaultValue={plan.nombre}
              required
            />

            <SelectField
              label="Estado"
              name="estado"
              defaultValue={plan.estado || "activo"}
            >
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </SelectField>

            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={4}
                defaultValue={plan.descripcion || ""}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              />
            </div>
          </div>

          <input
            type="hidden"
            name="precio"
            value={String(plan.precio || 0)}
          />

          <PlanGridEditor
            channels={channels}
            initialCantidad={plan.cantidadCanales || initialGrid.length || 1}
            initialGrid={initialGrid}
          />

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
              Guardar cambios
            </button>

            <a
              href="/planes"
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
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}