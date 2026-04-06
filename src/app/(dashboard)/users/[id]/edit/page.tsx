import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getUserById } from "@/services/user.service";
import { getAllPlans } from "@/services/plan.service";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let user;
  const plans = await getAllPlans();

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Usuarios
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Editar usuario
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modificá los datos de la cuenta seleccionada.
          </p>
        </div>

        <form
          action={`/api/users/${user._id}`}
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Nombre"
              name="nombre"
              defaultValue={user.nombre}
              required
            />

            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />

            <SelectField label="Rol" name="rol" defaultValue={user.rol}>
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
              <option value="cliente">Cliente</option>
            </SelectField>

            <SelectField label="Estado" name="estado" defaultValue={user.estado}>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </SelectField>

            <Field
              label="Localidad"
              name="localidad"
              defaultValue={user.localidad}
              required
            />

            <Field
              label="Conexiones permitidas"
              name="conexionesPermitidas"
              type="number"
              defaultValue={user.conexionesPermitidas}
              min={1}
              required
            />

            <div className="lg:col-span-2">
              <SelectField
                label="Plan asignado"
                name="planId"
                defaultValue={user.planId?._id || ""}
              >
                <option value="">Sin plan</option>
                {plans
                  .filter(
                    (plan) =>
                      plan.estado === "activo" || plan._id === user.planId?._id
                  )
                  .map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.nombre}
                    </option>
                  ))}
              </SelectField>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
              >
                Guardar cambios
              </button>

              <a
                href="/users"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
              >
                Volver al listado
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        min={min}
        required={required}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
      >
        {children}
      </select>
    </div>
  );
}