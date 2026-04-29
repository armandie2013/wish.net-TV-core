import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllStreamingNodes } from "@/services/streaming.service";

type StreamingNodeOption = {
  _id: string;
  nombre: string;
  codigo?: string;
  tipo: string;
  estado: string;
};

export default async function NewLocationPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const nodes = (await getAllStreamingNodes()) as StreamingNodeOption[];

  const activeNodes = nodes
    .filter((node) => node.estado === "activo")
    .sort((a, b) => {
      const priority: Record<string, number> = {
        origin: 0,
        edge: 1,
      };

      const pa = priority[String(a.tipo || "").toLowerCase()] ?? 99;
      const pb = priority[String(b.tipo || "").toLowerCase()] ?? 99;

      if (pa !== pb) return pa - pb;

      return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
    });

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
                Nueva localidad
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Asociá una localidad a un nodo principal y, opcionalmente, a un
                nodo fallback. El código se genera automáticamente desde el
                backend.
              </p>
            </div>

            <Link
              href="/configuracion/localidades"
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
          action="/api/configuracion/localidades"
          method="POST"
          className="space-y-3 p-3"
        >
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
            <Panel title="Datos de la localidad">
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Nombre"
                  name="nombre"
                  required
                  placeholder="Ej: Ancasti, Villa Vil, Catamarca"
                  helper="Nombre visible para asignar clientes y organizar nodos."
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

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    Descripción
                  </label>

                  <textarea
                    name="descripcion"
                    rows={5}
                    placeholder="Notas de referencia: zona, ISP, red, transporte, VLAN, responsable, etc."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Nodos asignados">
              <div className="grid gap-3">
                <SelectField
                  label="Nodo principal"
                  name="streamingNodeId"
                  defaultValue=""
                  helper="Nodo que se usará primero para resolver el playback."
                  options={[
                    { value: "", label: "Sin asignar" },
                    ...activeNodes.map((node) => ({
                      value: node._id,
                      label: formatNodeOption(node),
                    })),
                  ]}
                />

                <SelectField
                  label="Nodo fallback"
                  name="fallbackStreamingNodeId"
                  defaultValue=""
                  helper="Nodo de respaldo si el principal no está disponible."
                  options={[
                    { value: "", label: "Sin fallback" },
                    ...activeNodes.map((node) => ({
                      value: node._id,
                      label: formatNodeOption(node),
                    })),
                  ]}
                />

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Sugerencia:
                  </span>{" "}
                  usá un edge como nodo principal cuando la localidad tenga un
                  servidor local. El origin puede quedar como fallback o como
                  principal si todavía no hay edge instalado.
                </div>
              </div>
            </Panel>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
            <Link
              href="/configuracion/localidades"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Guardar localidad
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function formatNodeOption(node: StreamingNodeOption) {
  const tipo = String(node.tipo || "").toUpperCase();
  const codigo = node.codigo ? ` · ${node.codigo}` : "";

  return `${node.nombre} · ${tipo}${codigo}`;
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