import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getLocationById } from "@/services/location.service";
import { getAllStreamingNodes } from "@/services/streaming.service";
import { AlertBox } from "@/components/ui/dashboard-ui";
import {
  FormActions,
  FormCard,
  FormField,
  FormGrid,
  FormHeader,
  FormSection,
  FormSelect,
  FormShell,
  FormTextarea,
} from "@/components/ui/form-ui";

type StreamingNodeOption = {
  _id: string;
  nombre: string;
  codigo?: string;
  tipo: string;
  estado?: string;
};

type LocationItem = {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  estado: string;
  streamingNodeId?: StreamingNodeOption | null;
  fallbackStreamingNodeId?: StreamingNodeOption | null;
};

function formatNodeOption(node: StreamingNodeOption) {
  const tipo = String(node.tipo || "").toUpperCase();
  const codigo = node.codigo ? ` · ${node.codigo}` : "";
  const estado = node.estado && node.estado !== "activo" ? " · SUSPENDIDO" : "";

  return `${node.nombre} · ${tipo}${codigo}${estado}`;
}

function sortStreamingNodes(nodes: StreamingNodeOption[]) {
  return [...nodes].sort((a, b) => {
    const priority: Record<string, number> = {
      origin: 0,
      edge: 1,
    };

    const pa = priority[String(a.tipo || "").toLowerCase()] ?? 99;
    const pb = priority[String(b.tipo || "").toLowerCase()] ?? 99;

    if (pa !== pb) return pa - pb;

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

function buildNodeOptions(nodes: StreamingNodeOption[]) {
  return sortStreamingNodes(nodes).map((node) => ({
    value: node._id,
    label: formatNodeOption(node),
  }));
}

export default async function EditLocationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let location: LocationItem;

  try {
    location = (await getLocationById(params.id)) as LocationItem;
  } catch {
    redirect("/configuracion/localidades");
  }

  const nodes = (await getAllStreamingNodes()) as StreamingNodeOption[];
  const nodeOptions = buildNodeOptions(nodes);

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
        ? decodeURIComponent(searchParams.error)
        : "";

  const success = searchParams?.success || "";

  return (
    <FormSection>
      <FormShell>
        <FormHeader
          eyebrow="Configuración"
          title="Editar localidad"
          description="Modificá la localidad, su estado operativo y los nodos de reproducción asignados."
          backHref="/configuracion/localidades"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error ? <AlertBox tone="red">{error}</AlertBox> : null}

            {success === "location-updated" ? (
              <AlertBox>Localidad actualizada correctamente.</AlertBox>
            ) : null}
          </div>
        )}

        <form
          action={`/api/configuracion/localidades/${location._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos de la localidad">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  defaultValue={location.nombre}
                  required
                  placeholder="Ej: Ancasti, Villa Vil, Catamarca"
                  helper="Nombre visible para asignar clientes y organizar nodos."
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={location.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <FormField
                  label="Código"
                  name="codigoVisible"
                  defaultValue={location.codigo}
                  readOnly
                  helper="Solo lectura. El código real se genera automáticamente desde el backend."
                />

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Nota:
                  </span>{" "}
                  si cambiás el nombre, el backend recalcula el código interno
                  de la localidad.
                </div>

                <div className="md:col-span-2">
                  <FormTextarea
                    label="Descripción"
                    name="descripcion"
                    rows={5}
                    defaultValue={location.descripcion || ""}
                    placeholder="Notas de referencia: zona, ISP, red, transporte, VLAN, responsable, etc."
                  />
                </div>
              </div>
            </FormCard>

            <FormCard title="Nodos asignados">
              <div className="grid gap-3">
                <FormSelect
                  label="Nodo principal"
                  name="streamingNodeId"
                  defaultValue={location.streamingNodeId?._id || ""}
                  helper="Nodo que se usará primero para resolver el playback."
                  options={[
                    { value: "", label: "Sin asignar" },
                    ...nodeOptions,
                  ]}
                />

                <FormSelect
                  label="Nodo fallback"
                  name="fallbackStreamingNodeId"
                  defaultValue={location.fallbackStreamingNodeId?._id || ""}
                  helper="Nodo de respaldo si el principal no está disponible."
                  options={[
                    { value: "", label: "Sin fallback" },
                    ...nodeOptions,
                  ]}
                />

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Sugerencia:
                  </span>{" "}
                  mantené como principal el edge local de la localidad. Usá el
                  origin o un segundo edge como fallback para continuidad del
                  servicio.
                </div>
              </div>
            </FormCard>
          </FormGrid>

          <FormActions
            cancelHref="/configuracion/localidades"
            submitLabel="Guardar cambios"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}