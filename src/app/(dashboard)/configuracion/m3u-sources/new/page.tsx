import { requireAdminPageAccess } from "@/lib/auth-guards";

export default async function NewM3uSourcePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Nueva fuente M3U
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Registrá una nueva fuente para importar canales.
          </p>
        </div>

        <form
          action="/api/configuracion/m3u-sources"
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Nombre" name="nombre" required />

            <Field
              label="Localidad"
              name="localidad"
              defaultValue="general"
              required
            />

            <SelectField
              label="Tipo de entrada"
              name="tipoEntrada"
              defaultValue="url"
            >
              <option value="url">URL</option>
            </SelectField>

            <Field
              label="Prioridad"
              name="prioridad"
              type="number"
              min={1}
              defaultValue={1}
              required
            />

            <div className="lg:col-span-2">
              <Field label="URL fuente" name="urlFuente" required />
            </div>

            <SelectField label="Estado" name="estado" defaultValue="activo">
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </SelectField>

            <Field
              label="Intervalo de importación (minutos)"
              name="intervaloMinutos"
              type="number"
              min={1}
              defaultValue={60}
              required
            />

            <div className="lg:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm font-semibold text-slate-200">
                <input
                  type="checkbox"
                  name="importacionAutomatica"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
                />
                Importación automática
              </label>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={4}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
              >
                Guardar fuente
              </button>

              <a
                href="/configuracion/m3u-sources"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
              >
                Volver al listado
              </a>
            </div>
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
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