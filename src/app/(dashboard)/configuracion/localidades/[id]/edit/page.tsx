import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getLocationById } from "@/services/location.service";
import { getAllStreamingNodes } from "@/services/streaming.service";

export default async function EditLocationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let location;
  const nodes = await getAllStreamingNodes();

  try {
    location = await getLocationById(params.id);
  } catch {
    redirect("/configuracion/localidades");
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
            Editar localidad
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modificá la asociación de nodos para esta localidad.
          </p>
        </div>

        <form
          action={`/api/configuracion/localidades/${location._id}`}
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Nombre"
              name="nombre"
              defaultValue={location.nombre}
              required
            />
            <Field
              label="Código"
              name="codigo"
              defaultValue={location.codigo}
              required
            />

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows={3}
                defaultValue={location.descripcion}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Nodo principal
              </label>
              <select
                name="streamingNodeId"
                defaultValue={location.streamingNodeId?._id || ""}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="">Sin asignar</option>
                {nodes.map((node) => (
                  <option key={node._id} value={node._id}>
                    {node.nombre} · {node.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Nodo fallback
              </label>
              <select
                name="fallbackStreamingNodeId"
                defaultValue={location.fallbackStreamingNodeId?._id || ""}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="">Sin fallback</option>
                {nodes.map((node) => (
                  <option key={node._id} value={node._id}>
                    {node.nombre} · {node.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-200">
                Estado
              </label>
              <select
                name="estado"
                defaultValue={location.estado}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              >
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
              </select>
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
              href="/configuracion/localidades"
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
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
        required={required}
      />
    </div>
  );
}