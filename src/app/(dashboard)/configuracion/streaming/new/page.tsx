import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";

export default async function NewStreamingNodePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

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
                Configuración
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Nuevo nodo de streaming
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Registrá un origin o edge con su URL base, host, puerto y
                endpoint de health. El código se genera automáticamente desde el
                backend.
              </p>
            </div>

            <Link
              href="/configuracion/streaming"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Volver al listado
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <form
          action="/api/configuracion/streaming"
          method="POST"
          className="space-y-3 p-3"
        >
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
            <Panel title="Datos principales">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Nombre"
                    name="nombre"
                    required
                    placeholder="Ej: Origin Central o Edge Ancasti"
                  />
                </div>

                <SelectField
                  label="Tipo"
                  name="tipo"
                  defaultValue="origin"
                  helper="El código se generará automáticamente. Ej: ORIGIN-CENTRAL."
                  options={[
                    { value: "origin", label: "Origin" },
                    { value: "edge", label: "Edge" },
                  ]}
                />

                <SelectField
                  label="Estado"
                  name="estado"
                  defaultValue="activo"
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <Field
                  label="Prioridad"
                  name="prioridad"
                  type="number"
                  defaultValue={1}
                  min={1}
                  required
                />

                <div>
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    Uso del nodo
                  </label>

                  <label className="flex min-h-[36px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                    <input
                      type="checkbox"
                      name="habilitado"
                      value="true"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-400 dark:focus:ring-cyan-500"
                    />

                    <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                      Habilitado para playback
                    </span>
                  </label>
                </div>
              </div>
            </Panel>

            <Panel title="Conexión">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="URL base"
                    name="urlBase"
                    required
                    placeholder="http://192.168.10.30:4001"
                    helper="Debe incluir protocolo, IP o dominio y puerto."
                  />
                </div>

                <Field
                  label="Host"
                  name="host"
                  placeholder="192.168.10.30"
                  helper="IP o dominio del nodo."
                />

                <Field
                  label="Puerto"
                  name="puerto"
                  type="number"
                  defaultValue={4001}
                  min={1}
                  required
                  helper="Ej: origin 4001, edge 5001."
                />
              </div>
            </Panel>
          </div>

          <div className="grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Health check">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <Field
                  label="Ruta health"
                  name="healthCheckPath"
                  defaultValue="/health"
                  required
                  helper="Endpoint que responde el estado del servicio."
                />

                <Field
                  label="Timeout health (ms)"
                  name="healthTimeoutMs"
                  type="number"
                  defaultValue={2500}
                  min={500}
                  required
                  helper="Tiempo máximo de espera para validar el nodo."
                />
              </div>
            </Panel>

            <Panel title="Observaciones">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                Notas internas
              </label>

              <textarea
                name="observaciones"
                rows={5}
                placeholder="Notas internas del nodo, ubicación, ISP, responsable, túnel, VLAN, etc."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              />
            </Panel>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
            <Link
              href="/configuracion/streaming"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Guardar nodo
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
      <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {title}
      </div>

      <div className="p-3">{children}</div>
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
  placeholder,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
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
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <select
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
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