import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getStreamingNodeById } from "@/services/streaming.service";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function HealthBadge({
  healthStatus,
}: {
  healthStatus?: "unknown" | "online" | "offline" | string;
}) {
  const status = String(healthStatus || "unknown").toLowerCase();

  if (status === "online") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        Online
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
        Offline
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
      Unknown
    </span>
  );
}

function StateBadge({
  estado,
  habilitado,
}: {
  estado: string;
  habilitado?: boolean;
}) {
  if (estado !== "activo") {
    return (
      <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
        Suspendido
      </span>
    );
  }

  if (habilitado === false) {
    return (
      <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        Deshabilitado
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
      Activo
    </span>
  );
}

function TypeBadge({ tipo }: { tipo: string }) {
  const normalized = String(tipo || "").toLowerCase();

  if (normalized === "origin") {
    return (
      <span className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
        Origin
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
      Edge
    </span>
  );
}

export default async function EditStreamingNodePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let node;

  try {
    node = await getStreamingNodeById(params.id);
  } catch {
    redirect("/configuracion/streaming");
  }

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
        ? decodeURIComponent(searchParams.error)
        : "";

  const success = searchParams?.success || "";

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
                Editar nodo de streaming
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Modificá el origin o edge, revisá su health actual y ejecutá
                acciones rápidas sobre el nodo.
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

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado actualizado correctamente.
              </div>
            )}

            {success === "health-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Health check actualizado correctamente.
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_310px]">
          <form
            action={`/api/configuracion/streaming/${node._id}`}
            method="POST"
            className="space-y-3"
          >
            <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
              <Panel title="Datos principales">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    label="Nombre"
                    name="nombre"
                    defaultValue={node.nombre}
                    required
                  />

                  <ReadOnlyField
                    label="Código generado"
                    value={node.codigo}
                    helper="El código lo genera el backend."
                  />

                  <SelectField
                    label="Tipo"
                    name="tipo"
                    defaultValue={node.tipo}
                    options={[
                      { value: "origin", label: "Origin" },
                      { value: "edge", label: "Edge" },
                    ]}
                  />

                  <SelectField
                    label="Estado"
                    name="estado"
                    defaultValue={node.estado}
                    options={[
                      { value: "activo", label: "Activo" },
                      { value: "suspendido", label: "Suspendido" },
                    ]}
                  />

                  <Field
                    label="Prioridad"
                    name="prioridad"
                    type="number"
                    defaultValue={node.prioridad}
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
                        defaultChecked={Boolean(node.habilitado)}
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
                      defaultValue={node.urlBase}
                      required
                      helper="Debe incluir protocolo, IP o dominio y puerto."
                    />
                  </div>

                  <Field
                    label="Host"
                    name="host"
                    defaultValue={node.host}
                    helper="IP o dominio del nodo."
                  />

                  <Field
                    label="Puerto"
                    name="puerto"
                    type="number"
                    defaultValue={node.puerto}
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
                    defaultValue={node.healthCheckPath || "/health"}
                    required
                    helper="Endpoint que responde el estado del servicio."
                  />

                  <Field
                    label="Timeout health (ms)"
                    name="healthTimeoutMs"
                    type="number"
                    defaultValue={node.healthTimeoutMs || 2500}
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
                  defaultValue={node.observaciones || ""}
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
                Guardar cambios
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-lg border border-slate-300 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
            <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Estado actual
            </div>

            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Health
                  </p>
                  <div className="mt-1">
                    <HealthBadge healthStatus={node.healthStatus} />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Tipo
                  </p>
                  <div className="mt-1">
                    <TypeBadge tipo={node.tipo} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Estado
                  </p>
                  <div className="mt-1">
                    <StateBadge
                      estado={node.estado}
                      habilitado={node.habilitado}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Prioridad
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {node.prioridad ?? "—"}
                  </p>
                </div>
              </div>

              <Info
                label="Último health check"
                value={formatDate(node.lastCheckAt)}
              />

              <Info label="Último seen" value={formatDate(node.lastSeenAt)} />

              <Info
                label="Fallos acumulados"
                value={String(node.failureCount ?? 0)}
              />

              <Info
                label="Último error"
                value={node.lastError || "—"}
                breakWords
              />

              <div className="space-y-2 pt-1">
                <form
                  action={`/api/configuracion/streaming/${node._id}/refresh-health`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                  >
                    Ejecutar health check
                  </button>
                </form>

                <form
                  action={`/api/configuracion/streaming/${node._id}/toggle-status`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className={`w-full rounded-lg px-3 py-2 text-[12px] font-medium transition ${
                      node.estado === "activo"
                        ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                        : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                    }`}
                  >
                    {node.estado === "activo" ? "Suspender nodo" : "Activar nodo"}
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
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
        defaultValue={defaultValue ?? ""}
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

function ReadOnlyField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-[12px] text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400"
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

function Info({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-[12px] leading-snug text-slate-800 dark:text-slate-200 ${
          breakWords ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}