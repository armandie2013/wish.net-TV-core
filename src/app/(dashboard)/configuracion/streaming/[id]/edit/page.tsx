import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getStreamingNodeById } from "@/services/streaming.service";

export default async function EditStreamingNodePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
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
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            Editar servidor de streaming
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modificá los datos del nodo de streaming.
          </p>
        </div>

        <form
          action={`/api/configuracion/streaming/${node._id}`}
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nombre" name="nombre" defaultValue={node.nombre} required />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Tipo
              </label>
              <select
                name="tipo"
                defaultValue={node.tipo}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="origin">Origin</option>
                <option value="edge">Edge</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Field label="URL base" name="urlBase" defaultValue={node.urlBase} required />
            </div>

            <Field label="Host" name="host" defaultValue={node.host} />
            <Field label="Puerto" name="puerto" type="number" defaultValue={node.puerto} min={1} required />
            <Field label="Localidad" name="localidad" defaultValue={node.localidad} required />
            <Field label="Prioridad" name="prioridad" type="number" defaultValue={node.prioridad} min={1} required />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Estado
              </label>
              <select
                name="estado"
                defaultValue={node.estado}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                rows={4}
                defaultValue={node.observaciones}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>
          </div>

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
              Guardar cambios
            </button>

            <a
              href="/configuracion/streaming"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}