import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getUserById } from "@/services/user.service";
import { getAllLocations } from "@/services/location.service";
import { getAllPlans } from "@/services/plan.service";

type LocationOption = {
  _id: string;
  nombre: string;
  codigo?: string;
  estado?: string;
};

type PlanOption = {
  _id: string;
  nombre: string;
  estado?: string;
};

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  let user;

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const locations = (await getAllLocations()) as LocationOption[];
  const plans = (await getAllPlans()) as PlanOption[];

  const currentLocationId = user.localidadId?._id
    ? String(user.localidadId._id)
    : "";

  const currentPlanId = user.planId?._id ? String(user.planId._id) : "";

  const sortedLocations = [...locations].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
  );

  const selectablePlans = plans
    .filter((plan) => plan.estado === "activo" || String(plan._id) === currentPlanId)
    .sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
    );

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
        ? decodeURIComponent(searchParams.error)
        : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Usuarios
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Editar usuario
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Modificá los datos generales, el rol, la localidad técnica y el
                plan asignado.
              </p>
            </div>

            <Link
              href="/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Volver al listado
            </Link>
          </div>
        </div>

        {(success || error) && (
          <div className="space-y-2 px-3 pt-3">
            {success === "user-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Usuario actualizado correctamente.
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        <form
          action={`/api/users/${user._id}`}
          method="POST"
          className="space-y-3 p-3"
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <Panel title="Datos de acceso">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    label="Nombre"
                    name="nombre"
                    defaultValue={user.nombre}
                    required
                    placeholder="Nombre del usuario"
                    helper="Nombre visible en el panel y en los registros."
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    placeholder="usuario@dominio.com"
                    helper="Se usará para iniciar sesión."
                  />

                  <SelectField
                    label="Rol"
                    name="rol"
                    defaultValue={user.rol}
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "operador", label: "Operador" },
                      { value: "cliente", label: "Cliente" },
                    ]}
                  />

                  <SelectField
                    label="Estado"
                    name="estado"
                    defaultValue={user.estado}
                    options={[
                      { value: "activo", label: "Activo" },
                      { value: "suspendido", label: "Suspendido" },
                    ]}
                  />
                </div>
              </Panel>

              <Panel title="Servicio asignado">
                <div className="grid gap-3 md:grid-cols-2">
                  <SelectField
                    label="Localidad"
                    name="localidadId"
                    defaultValue={currentLocationId}
                    helper="La localidad define el nodo principal y fallback."
                    options={[
                      { value: "", label: "Sin asociar" },
                      ...sortedLocations.map((location) => ({
                        value: location._id,
                        label: formatLocationOption(location),
                      })),
                    ]}
                  />

                  <Field
                    label="Conexiones permitidas"
                    name="conexionesPermitidas"
                    type="number"
                    defaultValue={user.conexionesPermitidas}
                    min={1}
                    required
                    helper="Cantidad máxima de conexiones simultáneas."
                  />

                  <div className="md:col-span-2">
                    <SelectField
                      label="Plan asignado"
                      name="planId"
                      defaultValue={currentPlanId}
                      helper="Plan de canales que recibirá el usuario."
                      options={[
                        { value: "", label: "Sin plan" },
                        ...selectablePlans.map((plan) => ({
                          value: plan._id,
                          label: formatPlanOption(plan, currentPlanId),
                        })),
                      ]}
                    />
                  </div>
                </div>
              </Panel>
            </div>

            <aside className="h-fit rounded-lg border border-slate-300 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
              <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
                Resolución de servicio
              </div>

              <div className="space-y-2 p-3">
                <InfoBox
                  label="Localidad actual"
                  value={user.localidadId?.nombre || "Sin asociar"}
                />

                <InfoBox
                  label="Plan actual"
                  value={user.planId?.nombre || "Sin plan asignado"}
                />

                <InfoBox
                  label="Resolución"
                  value="La localidad técnica define desde qué nodo se resolverá el servicio."
                />

                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Flujo
                  </p>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                      Usuario
                    </div>
                    <div className="pl-2 text-slate-400">↓</div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-950/40">
                      Localidad
                    </div>
                    <div className="pl-2 text-slate-400">↓</div>
                    <div className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
                      Nodo principal
                    </div>
                    <div className="pl-2 text-slate-400">↓</div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      Fallback
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
            <Link
              href="/users"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function formatLocationOption(location: LocationOption) {
  const codigo = location.codigo ? ` · ${location.codigo}` : "";
  const estado =
    location.estado && location.estado !== "activo"
      ? ` · ${location.estado}`
      : "";

  return `${location.nombre}${codigo}${estado}`;
}

function formatPlanOption(plan: PlanOption, currentPlanId: string) {
  const isCurrent = String(plan._id) === currentPlanId;
  const estado =
    plan.estado && plan.estado !== "activo" ? ` · ${plan.estado}` : "";

  return `${plan.nombre}${estado}${isCurrent ? " · actual" : ""}`;
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {title}
      </div>

      <div className="p-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
  placeholder,
  helper,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        min={min}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        required={required}
      />

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <select
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}