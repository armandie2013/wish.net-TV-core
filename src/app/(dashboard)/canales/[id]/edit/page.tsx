import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getChannelById } from "@/services/channel.service";
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

export default async function EditChannelPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let channel;

  try {
    channel = await getChannelById(params.id);
  } catch {
    redirect("/canales");
  }

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
          eyebrow="Canales"
          title="Editar canal"
          description="Modificá los datos del canal, su categoría, logo y URL de origen."
          backHref="/canales"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form
          action={`/api/canales/${channel._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos del canal">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  defaultValue={channel.nombre}
                  required
                  placeholder="Ej: TyC Sports HD"
                  helper="Nombre visible en la app y en los planes."
                />

                <FormField
                  label="Categoría"
                  name="categoria"
                  defaultValue={channel.categoria}
                  required
                  placeholder="Ej: Deportes, Noticias, Cine"
                  helper="Sirve para ordenar el catálogo."
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={channel.estado}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />

                <FormField
                  label="Logo (URL)"
                  name="logo"
                  defaultValue={channel.logo}
                  placeholder="https://..."
                  helper="Opcional. URL del logo del canal."
                />
              </div>
            </FormCard>

            <FormCard title="Origen y descripción">
              <div className="grid gap-3">
                <FormField
                  label="URL origen"
                  name="urlOrigen"
                  defaultValue={channel.urlOrigen}
                  required
                  placeholder="http://192.168.10.100:9981/stream/channelid/1?profile=pass"
                  helper="URL directa del stream, M3U8, TS o fuente del encoder."
                />

                <FormTextarea
                  label="Descripción"
                  name="descripcion"
                  rows={5}
                  defaultValue={channel.descripcion || ""}
                  placeholder="Notas internas: origen, proveedor, encoder, calidad, observaciones, etc."
                />
              </div>
            </FormCard>
          </FormGrid>

          <FormActions cancelHref="/canales" submitLabel="Guardar cambios" />
        </form>
      </FormShell>
    </FormSection>
  );
}