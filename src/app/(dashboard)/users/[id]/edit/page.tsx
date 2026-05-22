import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getUserById } from "@/services/user.service";
import { getAllPlans } from "@/services/plan.service";
import { getAllLocations } from "@/services/location.service";
import { isProtectedAdminEmail } from "@/services/auth.service";
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

function getId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return "";
}

function isUserProtected(user: any) {
  return Boolean(user?.isProtected) || isProtectedAdminEmail(user?.email);
}

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  const currentUser = await requireAdminPageAccess();

  let user: any;

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const plansRaw = (await getAllPlans()) as PlanItem[];
  const locationsRaw = (await getAllLocations()) as LocationItem[];

  const plans = sortByName(
    plansRaw.filter((plan) => plan.estado !== "suspendido")
  );

  const locations = sortByName(
    locationsRaw.filter((location) => location.estado !== "suspendido")
  );

  const protectedUser = isUserProtected(user);
  const editingSelf = String(currentUser._id) === String(user._id);

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
          eyebrow="Administración"
          title="Editar usuario"
          description="Modificá los datos de acceso, rol, estado, plan, localidad, conexiones y duración del token."
          backHref="/users"
        />

        {(error || success || protectedUser) && (
          <div className="space-y-2 px-3 pt-3">
            {error ? <AlertBox tone="red">{error}</AlertBox> : null}

            {success === "user-updated" ? (
              <AlertBox>Usuario actualizado correctamente.</AlertBox>
            ) : null}

            {protectedUser ? (
              <AlertBox tone="amber">
                Este usuario está protegido. Algunas acciones sensibles pueden
                estar limitadas desde el dashboard.
              </AlertBox>
            ) : null}
          </div>
        )}

        <form
          action={`/api/users/${user._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <FormGrid>
            <FormCard title="Datos del usuario">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  label="Nombre"
                  name="nombre"
                  defaultValue={user.nombre}
                  required
                  placeholder="Ej: Juan Pérez"
                  helper="Nombre visible en el panel y en los logs."
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  readOnly={protectedUser}
                  autoComplete="email"
                  placeholder="usuario@email.com"
                  helper={
                    protectedUser
                      ? "Solo lectura para usuarios protegidos."
                      : "Se usará para iniciar sesión."
                  }
                />

                <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
                  Para cambiar la contraseña de este usuario, usá el botón{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Reset
                  </span>{" "}
                  desde el listado de usuarios. El sistema generará una nueva
                  contraseña temporal automáticamente.
                </div>
              </div>
            </FormCard>

            <FormCard title="Acceso y seguridad">
              <div className="grid gap-3 md:grid-cols-2">
                <FormSelect
                  label="Rol"
                  name="rol"
                  defaultValue={user.rol || "cliente"}
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "operador", label: "Operador" },
                    { value: "cliente", label: "Cliente" },
                  ]}
                  helper={
                    protectedUser
                      ? "Evitá modificar el rol de usuarios protegidos."
                      : "Define qué partes del sistema puede administrar."
                  }
                />

                <FormSelect
                  label="Estado"
                  name="estado"
                  defaultValue={user.estado || "activo"}
                  options={[
                    { value: "activo", label: "Activo" },
                    { value: "suspendido", label: "Suspendido" },
                  ]}
                  helper={
                    editingSelf
                      ? "No conviene suspender el usuario con sesión actual."
                      : undefined
                  }
                />

                <FormField
                  label="Conexiones permitidas"
                  name="conexionesPermitidas"
                  type="number"
                  defaultValue={user.conexionesPermitidas || 1}
                  min={1}
                  max={20}
                  helper="Cantidad de dispositivos simultáneos permitidos."
                />

                <FormSelect
                  label="Duración del token"
                  name="tokenExpiresIn"
                  defaultValue={user.tokenExpiresIn || "30d"}
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
                  helper="El cambio aplica al próximo token emitido."
                />
              </div>
            </FormCard>
          </FormGrid>

          <FormCard title="Asignación IPTV">
            <div className="grid gap-3 md:grid-cols-2">
              <FormSelect
                label="Plan"
                name="planId"
                defaultValue={getId(user.planId)}
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
                defaultValue={getId(user.localidadId)}
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

          <FormActions cancelHref="/users" submitLabel="Guardar cambios" />
        </form>
      </FormShell>
    </FormSection>
  );
}