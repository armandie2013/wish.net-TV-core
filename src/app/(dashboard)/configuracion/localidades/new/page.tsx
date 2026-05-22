import { requireAdminPageAccess } from "@/lib/auth-guards";
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
  estado: string;
};

function formatNodeOption(node: StreamingNodeOption) {
  const tipo = String(node.tipo || "").toUpperCase();
  const codigo = node.codigo ? ` · ${node.codigo}` : "";
  const estado = node.estado !== "activo" ? " · SUSPENDIDO" : "";

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

export default async function NewLocationPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const nodes = (await getAllStreamingNodes()) as StreamingNodeOption[];

  const activeNodes = sortStreamingNodes(
    nodes.filter((node) => node.estado === "activo")
  );

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
        ? decodeURIComponent(searchParams.error)
        : "";

  return (
    <FormSection>
      <FormShell>
        <FormHeader
          eyebrow="Configuración"
          title="Nueva localidad"
          description="Asociá una localidad a un nodo principal y, opcionalmente, a un nodo fallback. El código se genera automáticamente desde el backend."
          backHref="/configuracion/localidades"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form
          action="/api/configuracion/localidades"
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos de la localidad">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  required
                  placeholder="Ej: Ancasti, Villa Vil, Catamarca"
                  helper="Nombre visible para asignar clientes y organizar nodos."
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue="activo"
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <div className="md:col-span-2">
                  <FormTextarea
                    label="Descripción"
                    name="descripcion"
                    rows={5}
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

                <FormSelect
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
            </FormCard>
          </FormGrid>

          <FormActions
            cancelHref="/configuracion/localidades"
            submitLabel="Guardar localidad"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}