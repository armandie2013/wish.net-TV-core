import { requireAdminPageAccess } from "@/lib/auth-guards";
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

export default async function NewM3uSourcePage({
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
          title="Nueva fuente M3U"
          description="Registrá una fuente M3U para importar canales al catálogo del sistema."
          backHref="/configuracion/m3u-sources"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form
          action="/api/configuracion/m3u-sources"
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos de la fuente">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  required
                  placeholder="Ej: TVHeadend Central, Encoder Ancasti"
                  helper="Nombre interno para identificar la lista."
                />

                <FormField
                  label="Localidad"
                  name="localidad"
                  defaultValue="general"
                  required
                  placeholder="general"
                  helper="Podés usar general o el nombre de una localidad."
                />

                <FormSelect
                  label="Tipo de entrada"
                  name="tipoEntrada"
                  defaultValue="url"
                  options={[{ value: "url", label: "URL" }]}
                  helper="Por ahora la fuente se importa desde una URL."
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
                  <FormField
                    label="URL fuente"
                    name="urlFuente"
                    required
                    placeholder="http://192.168.10.100:9981/playlist/channels.m3u"
                    helper="URL completa de la lista M3U que entregará los canales."
                  />
                </div>
              </div>
            </FormCard>

            <FormCard title="Importación">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Prioridad"
                  name="prioridad"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  helper="Menor número = mayor prioridad."
                />

                <FormField
                  label="Intervalo (min)"
                  name="intervaloMinutos"
                  type="number"
                  min={1}
                  defaultValue={60}
                  required
                  helper="Cada cuántos minutos se importará automáticamente."
                />

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    Importación automática
                  </label>

                  <label className="flex min-h-[36px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                    <input
                      type="checkbox"
                      name="importacionAutomatica"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-400 dark:focus:ring-cyan-500"
                    />

                    <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                      Activar importación automática
                    </span>
                  </label>

                  <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
                    Si se activa, el sistema podrá actualizar los canales según
                    el intervalo configurado.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <FormTextarea
                    label="Descripción"
                    name="descripcion"
                    rows={5}
                    placeholder="Notas internas: origen de la lista, proveedor, red, observaciones del encoder, etc."
                  />
                </div>
              </div>
            </FormCard>
          </FormGrid>

          <FormActions
            cancelHref="/configuracion/m3u-sources"
            submitLabel="Guardar fuente"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}