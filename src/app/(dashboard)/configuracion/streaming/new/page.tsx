import { requireAdminPageAccess } from "@/lib/auth-guards";
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
    <FormSection>
      <FormShell>
        <FormHeader
          eyebrow="Configuración"
          title="Nuevo nodo de streaming"
          description="Registrá un origin o edge para resolver rutas de reproducción, health check y fallback de servicio."
          backHref="/configuracion/streaming"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form
          action="/api/configuracion/streaming"
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos del nodo">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  required
                  placeholder="Ej: Origin Central V2, Edge Ancasti 01"
                  helper="Nombre visible en configuración, localidades y logs."
                />

                <FormField
                  label="Código"
                  name="codigo"
                  required
                  placeholder="Ej: ORIGIN-CENTRAL-V2"
                  helper="Identificador interno del nodo. Usá mayúsculas y guiones."
                />

                <FormSelect
                  label="Tipo"
                  name="tipo"
                  defaultValue="edge"
                  options={[
                    { value: "origin", label: "Origin" },
                    { value: "edge", label: "Edge" },
                  ]}
                  helper="Origin es cabecera central. Edge es nodo local de distribución."
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

                <FormField
                  label="Prioridad"
                  name="prioridad"
                  type="number"
                  defaultValue={10}
                  min={1}
                  max={999}
                  helper="Menor número = mayor prioridad."
                />

                <FormSelect
                  label="Habilitado"
                  name="habilitado"
                  defaultValue="true"
                  options={[
                    { value: "true", label: "Sí" },
                    { value: "false", label: "No" },
                  ]}
                  helper="Permite deshabilitar el nodo sin cambiar su estado principal."
                />
              </div>
            </FormCard>

            <FormCard title="Conexión">
              <StreamingConnectionFields />
            </FormCard>
          </FormGrid>

          <FormCard title="Health check">
            <div className="grid gap-3 md:grid-cols-3">
              <FormField
                label="Path"
                name="healthCheckPath"
                defaultValue="/health"
                placeholder="/health"
                helper="Endpoint que responde el estado del nodo."
              />

              <FormField
                label="Timeout MS"
                name="healthTimeoutMs"
                type="number"
                defaultValue={2500}
                min={500}
                max={30000}
                helper="Tiempo máximo de espera por health check."
              />

              <FormField
                label="Fallos iniciales"
                name="failureCount"
                type="number"
                defaultValue={0}
                min={0}
                max={999}
                helper="Normalmente dejar en 0."
              />
            </div>
          </FormCard>

          <FormActions
            cancelHref="/configuracion/streaming"
            submitLabel="Guardar nodo"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}