import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getM3uSourceById } from "@/services/m3u-source.service";
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

type M3uSourceItem = {
  _id: string;
  nombre: string;
  localidad?: string;
  tipoEntrada?: string;
  estado?: string;
  urlFuente: string;
  prioridad?: number;
  intervaloMinutos?: number;
  importacionAutomatica?: boolean;
  descripcion?: string | null;
};

export default async function EditM3uSourcePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let source: M3uSourceItem;

  try {
    source = (await getM3uSourceById(params.id)) as M3uSourceItem;
  } catch {
    redirect("/configuracion/m3u-sources");
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
          title="Editar fuente M3U"
          description="Modificá los datos de la fuente M3U, su prioridad y la configuración de importación."
          backHref="/configuracion/m3u-sources"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error ? <AlertBox tone="red">{error}</AlertBox> : null}

            {success === "source-updated" ? (
              <AlertBox>Fuente actualizada correctamente.</AlertBox>
            ) : null}
          </div>
        )}

        <form
          action={`/api/configuracion/m3u-sources/${source._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos de la fuente">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  defaultValue={source.nombre}
                  required
                  placeholder="Ej: TVHeadend Central, Encoder Ancasti"
                  helper="Nombre interno para identificar la lista."
                />

                <FormField
                  label="Localidad"
                  name="localidad"
                  defaultValue={source.localidad || "general"}
                  required
                  placeholder="general"
                  helper="Podés usar general o el nombre de una localidad."
                />

                <FormSelect
                  label="Tipo de entrada"
                  name="tipoEntrada"
                  defaultValue={source.tipoEntrada || "url"}
                  options={[{ value: "url", label: "URL" }]}
                  helper="Por ahora la fuente se importa desde una URL."
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={source.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="URL fuente"
                    name="urlFuente"
                    defaultValue={source.urlFuente}
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
                  defaultValue={source.prioridad ?? 1}
                  required
                  helper="Menor número = mayor prioridad."
                />

                <FormField
                  label="Intervalo (min)"
                  name="intervaloMinutos"
                  type="number"
                  min={1}
                  defaultValue={source.intervaloMinutos ?? 60}
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
                      defaultChecked={Boolean(source.importacionAutomatica)}
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
                    defaultValue={source.descripcion || ""}
                    placeholder="Notas internas: origen de la lista, proveedor, red, observaciones del encoder, etc."
                  />
                </div>
              </div>
            </FormCard>
          </FormGrid>

          <FormActions
            cancelHref="/configuracion/m3u-sources"
            submitLabel="Guardar cambios"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}