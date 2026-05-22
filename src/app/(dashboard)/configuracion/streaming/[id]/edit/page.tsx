import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getStreamingNodeById } from "@/services/streaming.service";
import StreamingConnectionFields from "@/components/streaming/StreamingConnectionFields";
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
} from "@/components/ui/form-ui";

type StreamingNodeItem = {
  _id: string;
  nombre: string;
  codigo: string;
  tipo: "origin" | "edge";
  host?: string;
  puerto?: number;
  urlBase?: string;
  estado: "activo" | "suspendido";
  habilitado?: boolean;
  prioridad?: number;
  healthStatus?: "online" | "offline" | "unknown";
  healthCheckPath?: string;
  healthTimeoutMs?: number;
  failureCount?: number;
  lastError?: string;
};

export default async function EditStreamingNodePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let node: StreamingNodeItem;

  try {
    node = (await getStreamingNodeById(params.id)) as StreamingNodeItem;
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
    <FormSection>
      <FormShell>
        <FormHeader
          eyebrow="Configuración"
          title="Editar nodo de streaming"
          description="Modificá la conexión, prioridad y health check del nodo de streaming."
          backHref="/configuracion/streaming"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error ? <AlertBox tone="red">{error}</AlertBox> : null}

            {success === "node-updated" ? (
              <AlertBox>Nodo actualizado correctamente.</AlertBox>
            ) : null}
          </div>
        )}

        <form
          action={`/api/configuracion/streaming/${node._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos del nodo">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  defaultValue={node.nombre}
                  required
                  placeholder="Ej: Origin Central V2, Edge Ancasti 01"
                  helper="Nombre visible en configuración, localidades y logs."
                />

                <FormField
                  label="Código"
                  name="codigo"
                  defaultValue={node.codigo}
                  readOnly
                  helper="Solo lectura. El código identifica internamente al nodo."
                />

                <FormSelect
                  label="Tipo"
                  name="tipo"
                  defaultValue={node.tipo || "edge"}
                  options={[
                    { value: "origin", label: "Origin" },
                    { value: "edge", label: "Edge" },
                  ]}
                  helper="Origin es cabecera central. Edge es nodo local de distribución."
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={node.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <FormField
                  label="Prioridad"
                  name="prioridad"
                  type="number"
                  defaultValue={node.prioridad ?? 10}
                  min={1}
                  max={999}
                  helper="Menor número = mayor prioridad."
                />

                <FormSelect
                  label="Habilitado"
                  name="habilitado"
                  defaultValue={node.habilitado === false ? "false" : "true"}
                  options={[
                    { value: "true", label: "Sí" },
                    { value: "false", label: "No" },
                  ]}
                  helper="Permite deshabilitar el nodo sin cambiar su estado principal."
                />
              </div>
            </FormCard>

            <FormCard title="Conexión">
              <StreamingConnectionFields
                initialHost={node.host || ""}
                initialPuerto={node.puerto ?? ""}
                initialUrlBase={node.urlBase || ""}
              />
            </FormCard>
          </FormGrid>

          <FormCard title="Health check">
            <div className="grid gap-3 md:grid-cols-3">
              <FormField
                label="Path"
                name="healthCheckPath"
                defaultValue={node.healthCheckPath || "/health"}
                placeholder="/health"
                helper="Endpoint que responde el estado del nodo."
              />

              <FormField
                label="Timeout MS"
                name="healthTimeoutMs"
                type="number"
                defaultValue={node.healthTimeoutMs ?? 2500}
                min={500}
                max={30000}
                helper="Tiempo máximo de espera por health check."
              />

              <FormField
                label="Fallos"
                name="failureCount"
                type="number"
                defaultValue={node.failureCount ?? 0}
                min={0}
                max={999}
                helper="Contador actual de fallos."
              />

              <div className="md:col-span-3">
                <FormField
                  label="Último error"
                  name="lastErrorVisible"
                  defaultValue={node.lastError || "—"}
                  readOnly
                  helper="Solo lectura. Se actualiza automáticamente al ejecutar health check."
                />
              </div>
            </div>
          </FormCard>

          <FormActions
            cancelHref="/configuracion/streaming"
            submitLabel="Guardar cambios"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}