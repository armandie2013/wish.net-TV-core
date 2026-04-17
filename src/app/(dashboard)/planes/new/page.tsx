import { requireAdminPageAccess } from "@/lib/auth-guards";
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

  return (
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Planes
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Nuevo plan
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Armá una grilla lineal para este plan de TV.
            </p>
          </div>

          <form action="/api/planes" method="POST" className="space-y-6 p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Nombre del plan" name="nombre" required />

              <SelectField label="Estado" name="estado" defaultValue="activo">
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
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            <input type="hidden" name="precio" value="0" />

            <PlanGridEditor
              channels={channels}
              initialCantidad={1}
              initialGrid={[]}
            />

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
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
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
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}