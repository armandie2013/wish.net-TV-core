import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllPlans } from "@/services/plan.service";
import { getAllLocations } from "@/services/location.service";
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

type PlanItem = {
  _id: string;
  nombre: string;
  estado?: string;
};

type LocationItem = {
  _id: string;
  nombre: string;
  estado?: string;
};

function sortByName<T extends { nombre?: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
      sensitivity: "base",
      numeric: true,
    })
  );
}

export default async function NewUserPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  const plansRaw = (await getAllPlans()) as PlanItem[];
  const locationsRaw = (await getAllLocations()) as LocationItem[];

  const plans = sortByName(
    plansRaw.filter((plan) => plan.estado !== "suspendido")
  );

  const locations = sortByName(
    locationsRaw.filter((location) => location.estado !== "suspendido")
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
          eyebrow="Administración"
          title="Nuevo usuario"
          description="Creá una cuenta de acceso. La contraseña temporal se genera automáticamente y se muestra al finalizar."
          backHref="/users"
        />

        {error ? (
          <div className="px-3 pt-3">
            <AlertBox tone="red">{error}</AlertBox>
          </div>
        ) : null}

        <form action="/api/users" method="POST" className="space-y-3 p-3">
          <FormGrid>
            <FormCard title="Datos del usuario">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  required
                  placeholder="Ej: Juan Pérez"
                  helper="Nombre visible en el panel y en los logs."
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@email.com"
                  helper="Se usará para iniciar sesión."
                />

                <div className="md:col-span-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  La contraseña temporal se genera automáticamente al crear el
                  usuario. El sistema la mostrará una sola vez en el listado de
                  usuarios.
                </div>
              </div>
            </FormCard>

            <FormCard title="Acceso y seguridad">
              <div className="grid gap-3 md:grid-cols-2">
                <FormSelect
                  label="Rol"
                  name="rol"
                  defaultValue="cliente"
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "operador", label: "Operador" },
                    { value: "cliente", label: "Cliente" },
                  ]}
                  helper="Define qué partes del sistema puede administrar."
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
                  label="Conexiones permitidas"
                  name="conexionesPermitidas"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={20}
                  helper="Cantidad de dispositivos simultáneos permitidos."
                />

                <FormSelect
                  label="Duración del token"
                  name="tokenExpiresIn"
                  defaultValue="30d"
                  options={[
                    { value: "8h", label: "8 horas" },
                    { value: "12h", label: "12 horas" },
                    { value: "24h", label: "24 horas" },
                    { value: "48h", label: "48 horas" },
                    { value: "10d", label: "10 días" },
                    { value: "20d", label: "20 días" },
                    { value: "30d", label: "30 días" },
                    { value: "60d", label: "60 días" },
                  ]}
                  helper="Para clientes conviene usar varios días; para admin, menos tiempo."
                />
              </div>
            </FormCard>
          </FormGrid>

          <FormCard title="Asignación IPTV">
            <div className="grid gap-3 md:grid-cols-2">
              <FormSelect
                label="Plan"
                name="planId"
                defaultValue=""
                options={[
                  { value: "", label: "Sin plan asignado" },
                  ...plans.map((plan) => ({
                    value: String(plan._id),
                    label: plan.nombre,
                  })),
                ]}
                helper="Plan de canales que recibirá el usuario en la app."
              />

              <FormSelect
                label="Localidad"
                name="localidadId"
                defaultValue=""
                options={[
                  { value: "", label: "Principal / sin localidad" },
                  ...locations.map((location) => ({
                    value: String(location._id),
                    label: location.nombre,
                  })),
                ]}
                helper="La localidad define el edge principal y fallback."
              />
            </div>
          </FormCard>

          <FormActions cancelHref="/users" submitLabel="Guardar usuario" />
        </form>
      </FormShell>
    </FormSection>
  );
}