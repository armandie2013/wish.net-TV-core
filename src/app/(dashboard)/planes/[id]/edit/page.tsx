import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getPlanById } from "@/services/plan.service";
import { getAllChannels } from "@/services/channel.service";
import PlanGridEditor from "@/components/planes/PlanGridEditor";
import { AlertBox } from "@/components/ui/dashboard-ui";
import {
  FormCard,
  FormField,
  FormHeader,
  FormSection,
  FormSelect,
  FormShell,
  FormStickyActions,
  FormTextarea,
} from "@/components/ui/form-ui";

type Channel = {
  _id: string;
  nombre: string;
  categoria?: string;
  logo?: string;
  sourceName?: string;
  estado?: string;
};

export default async function EditPlanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const rawChannels = (await getAllChannels()) as any[];

  const channels: Channel[] = rawChannels
    .map((channel) => ({
      _id: String(channel._id),
      nombre: channel.nombre || "",
      categoria: channel.categoria || "",
      logo: channel.logo || "",
      sourceName: channel.sourceName || "",
      estado: channel.estado || "",
    }))
    .sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
        sensitivity: "base",
        numeric: true,
      })
    );

  let plan: any;

  try {
    plan = await getPlanById(params.id);
  } catch {
    redirect("/planes");
  }

  const initialGrid =
    Array.isArray(plan.grillaCanales) && plan.grillaCanales.length > 0
      ? plan.grillaCanales.map((item: any, index: number) => ({
          numero: item.numero || index + 1,
          orden: item.orden || index + 1,
          channelId:
            typeof item.channelId === "object" && item.channelId?._id
              ? String(item.channelId._id)
              : typeof item.channelId === "string"
                ? item.channelId
                : "",
          nombreVisible: item.nombreVisible || "",
          habilitado: item.habilitado ?? true,
          logo:
            item.logo ||
            (typeof item.channelId === "object"
              ? item.channelId?.logo || ""
              : ""),
          categoria:
            item.categoria ||
            (typeof item.channelId === "object"
              ? item.channelId?.categoria || ""
              : ""),
          sourceName:
            item.sourceName ||
            (typeof item.channelId === "object"
              ? item.channelId?.sourceName || ""
              : ""),
        }))
      : [];

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
          eyebrow="Planes"
          title="Editar plan"
          description="Modificá los datos principales y la grilla lineal de este plan."
          backHref="/planes"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form
          action={`/api/planes/${plan._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormCard title="Datos del plan">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-7">
                <FormField
                  label="Nombre del plan"
                  name="nombre"
                  defaultValue={plan.nombre}
                  required
                  maxLength={50}
                  placeholder="Ej: Básico, Full HD, Premium"
                  helper="Máximo 50 caracteres."
                />
              </div>

              <div className="md:col-span-2">
                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={plan.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                />
              </div>

              <div className="hidden md:col-span-3 md:block" />

              <div className="md:col-span-12">
                <FormTextarea
                  label="Descripción"
                  name="descripcion"
                  rows={2}
                  maxLength={180}
                  defaultValue={plan.descripcion || ""}
                  placeholder="Detalle interno del plan, alcance, cantidad de señales, zona o condiciones."
                />
              </div>
            </div>
          </FormCard>

          <input type="hidden" name="precio" value={String(plan.precio || 0)} />

          <FormCard title="Grilla del plan">
            <div className="h-[250px] overflow-y-auto overscroll-contain pr-1 sm:h-[270px] xl:h-[300px]">
              <PlanGridEditor
                channels={channels}
                initialCantidad={plan.cantidadCanales || initialGrid.length || 1}
                initialGrid={initialGrid}
              />
            </div>
          </FormCard>

          <FormStickyActions
            cancelHref="/planes"
            submitLabel="Guardar cambios"
          />
        </form>
      </FormShell>
    </FormSection>
  );
}