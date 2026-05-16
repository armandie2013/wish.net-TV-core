import Link from "next/link";
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

  const channels: Channel[] = rawChannels
    .map((channel) => ({
      _id: String(channel._id),
      nombre: channel.nombre || "",
      categoria: channel.categoria || "",
      logo: channel.logo || "",
      sourceName: channel.sourceName || "",
      estado: channel.estado || "",
    }))
    .sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
    );

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
      ? "Revisá los datos ingresados."
      : searchParams?.error
        ? decodeURIComponent(searchParams.error)
        : "";

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Planes
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Editar plan
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Modificá los datos principales y la grilla lineal de este plan.
              </p>
            </div>

            <Link
              href="/planes"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Volver al listado
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-3 mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form
          action={`/api/planes/${plan._id}`}
          method="POST"
          className="space-y-2 p-3 pb-2"
        >
          <Panel title="Datos del plan">
            <div className="grid gap-2 md:grid-cols-12">
              <div className="md:col-span-7">
                <Field
                  label="Nombre del plan"
                  name="nombre"
                  defaultValue={plan.nombre}
                  required
                  maxLength={50}
                  placeholder="Ej: Básico, Full HD, Premium"
                  helper="Máximo 50 caracteres."
                />
              </div>

              <div className="md:col-span-2">
                <SelectField
                  label="Estado"
                  name="estado"
                  defaultValue={plan.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />
              </div>

              <div className="hidden md:col-span-3 md:block" />

              <div className="md:col-span-12">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  rows={2}
                  maxLength={180}
                  defaultValue={plan.descripcion || ""}
                  placeholder="Detalle interno del plan, alcance, cantidad de señales, zona o condiciones."
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                />
              </div>
            </div>
          </Panel>

          <input type="hidden" name="precio" value={String(plan.precio || 0)} />

          <Panel title="Grilla del plan">
            <div className="h-[calc(100vh-565px)] min-h-[200px] overflow-y-auto overscroll-contain pr-1">
              <PlanGridEditor
                channels={channels}
                initialCantidad={plan.cantidadCanales || initialGrid.length || 1}
                initialGrid={initialGrid}
              />
            </div>
          </Panel>

          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <Link
              href="/planes"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {title}
      </div>

      <div className="p-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
  maxLength,
  placeholder,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  maxLength?: number;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        min={min}
        maxLength={maxLength}
        placeholder={placeholder}
        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        required={required}
      />

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <select
        name={name}
        defaultValue={defaultValue}
        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-3 text-[11px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}