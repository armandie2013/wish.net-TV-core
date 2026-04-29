import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllUsers } from "@/services/user.service";
import Link from "next/link";

type PlanMini = {
  _id?: string;
  nombre?: string;
};

type UserItem = {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  localidad?: string | null;
  planId?: PlanMini | null;
  conexionesPermitidas?: number;
};

function StateBadge({ estado }: { estado: string }) {
  if (estado === "activo") {
    return (
      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        Activo
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
      Suspendido
    </span>
  );
}

function RoleBadge({ rol }: { rol: string }) {
  const normalized = String(rol || "").toLowerCase();

  if (normalized === "admin") {
    return (
      <span className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
        Admin
      </span>
    );
  }

  if (normalized === "cliente") {
    return (
      <span className="inline-flex rounded-full border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200">
        Cliente
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
      {rol || "—"}
    </span>
  );
}

function Kpi({
  title,
  value,
  desc,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  desc: string;
  tone?: "neutral" | "cyan" | "green" | "red" | "amber" | "violet";
}) {
  const valueClass =
    tone === "cyan"
      ? "text-cyan-700 dark:text-cyan-200"
      : tone === "green"
        ? "text-emerald-700 dark:text-emerald-200"
        : tone === "red"
          ? "text-red-700 dark:text-red-200"
          : tone === "amber"
            ? "text-amber-700 dark:text-amber-200"
            : tone === "violet"
              ? "text-violet-700 dark:text-violet-200"
              : "text-slate-900 dark:text-slate-100";

  const borderClass =
    tone === "cyan"
      ? "border-cyan-300/70 dark:border-cyan-500/20"
      : tone === "green"
        ? "border-emerald-300/70 dark:border-emerald-500/20"
        : tone === "red"
          ? "border-red-300/70 dark:border-red-500/20"
          : tone === "amber"
            ? "border-amber-300/70 dark:border-amber-500/20"
            : tone === "violet"
              ? "border-violet-300/70 dark:border-violet-500/20"
              : "border-slate-300 dark:border-slate-800";

  return (
    <div
      className={`rounded-lg border ${borderClass} bg-white px-2 py-2 shadow-sm dark:bg-slate-900/60`}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {title}
      </div>

      <div className={`text-lg font-semibold leading-tight ${valueClass}`}>
        {value}
      </div>

      <div className="text-[10px] leading-tight text-slate-500 dark:text-slate-500">
        {desc}
      </div>
    </div>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td
        colSpan={8}
        className="px-3 py-8 text-center text-[12px] text-slate-500 dark:text-slate-400"
      >
        No hay usuarios registrados.
      </td>
    </tr>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: {
    error?: string;
    success?: string;
    email?: string;
    tempPassword?: string;
  };
}) {
  await requireAdminPageAccess();

  const users = (await getAllUsers()) as UserItem[];

  const sortedUsers = [...users].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
  );

  const totalUsers = sortedUsers.length;
  const activeUsers = sortedUsers.filter((user) => user.estado === "activo")
    .length;
  const suspendedUsers = sortedUsers.filter((user) => user.estado !== "activo")
    .length;
  const adminUsers = sortedUsers.filter(
    (user) => String(user.rol || "").toLowerCase() === "admin"
  ).length;
  const clientUsers = sortedUsers.filter(
    (user) => String(user.rol || "").toLowerCase() === "cliente"
  ).length;
  const totalConnections = sortedUsers.reduce(
    (acc, user) => acc + Number(user.conexionesPermitidas || 0),
    0
  );

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const createdEmail = searchParams?.email || "";
  const tempPassword = searchParams?.tempPassword || "";

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
                Listado de usuarios
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Visualizá y administrá las cuentas registradas, sus planes,
                roles, localidades y conexiones permitidas.
              </p>
            </div>

            <Link
              href="/users/new"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
            >
              Nuevo usuario
            </Link>
          </div>
        </div>

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success === "user-created" && createdEmail && tempPassword && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                <p className="font-semibold">Usuario creado correctamente</p>
                <p className="mt-1">
                  Email: <span className="font-mono">{createdEmail}</span>
                </p>
                <p className="mt-1">
                  Contraseña temporal:{" "}
                  <span className="font-mono">{tempPassword}</span>
                </p>
                <p className="mt-1 text-[10px] opacity-80">
                  Guardala ahora. El usuario deberá cambiarla al ingresar por
                  primera vez.
                </p>
              </div>
            )}

            {success === "password-reset" && createdEmail && tempPassword && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <p className="font-semibold">
                  Contraseña restablecida correctamente
                </p>
                <p className="mt-1">
                  Email: <span className="font-mono">{createdEmail}</span>
                </p>
                <p className="mt-1">
                  Nueva contraseña temporal:{" "}
                  <span className="font-mono">{tempPassword}</span>
                </p>
                <p className="mt-1 text-[10px] opacity-80">
                  El usuario deberá cambiarla en el próximo inicio de sesión.
                </p>
              </div>
            )}

            {success === "user-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Usuario actualizado correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado del usuario actualizado correctamente.
              </div>
            )}

            {success === "password-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Contraseña actualizada correctamente.
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi title="Total" value={totalUsers} desc="Usuarios cargados" />

          <Kpi
            title="Activos"
            value={activeUsers}
            desc="Habilitados"
            tone="green"
          />

          <Kpi
            title="Suspend."
            value={suspendedUsers}
            desc="Bloqueados"
            tone={suspendedUsers > 0 ? "red" : "green"}
          />

          <Kpi title="Admins" value={adminUsers} desc="Administradores" tone="violet" />

          <Kpi title="Clientes" value={clientUsers} desc="Cuentas cliente" tone="cyan" />

          <Kpi
            title="Conex."
            value={totalConnections}
            desc="Permitidas"
            tone="cyan"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="max-h-[620px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800/70">
            <table className="w-full min-w-[1120px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-[210px] px-2 py-2 text-left font-medium">
                    Usuario
                  </th>
                  <th className="w-[240px] px-2 py-2 text-left font-medium">
                    Email
                  </th>
                  <th className="w-[90px] px-2 py-2 text-center font-medium">
                    Rol
                  </th>
                  <th className="w-[110px] px-2 py-2 text-center font-medium">
                    Estado
                  </th>
                  <th className="w-[150px] px-2 py-2 text-left font-medium">
                    Localidad
                  </th>
                  <th className="w-[170px] px-2 py-2 text-left font-medium">
                    Plan
                  </th>
                  <th className="w-[100px] px-2 py-2 text-center font-medium">
                    Conex.
                  </th>
                  <th className="w-[250px] px-2 py-2 text-left font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sortedUsers.length === 0 ? (
                  <EmptyRow />
                ) : (
                  sortedUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`align-top hover:bg-slate-100 dark:hover:bg-slate-800/30 ${
                        index % 2 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        <p
                          className="max-w-[190px] truncate font-medium text-slate-900 dark:text-white"
                          title={user.nombre}
                        >
                          {user.nombre}
                        </p>
                      </td>

                      <td className="px-2 py-2">
                        <p
                          className="max-w-[220px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                          title={user.email}
                        >
                          {user.email}
                        </p>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <RoleBadge rol={user.rol} />
                      </td>

                      <td className="px-2 py-2 text-center">
                        <StateBadge estado={user.estado} />
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className="block max-w-[140px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                          title={user.localidad || "—"}
                        >
                          {user.localidad || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className="block max-w-[160px] truncate text-[11px] text-slate-600 dark:text-slate-400"
                          title={user.planId?.nombre || "—"}
                        >
                          {user.planId?.nombre || "—"}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {user.conexionesPermitidas ?? 0}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex max-w-[240px] flex-wrap gap-1.5">
                          <Link
                            href={`/users/${user._id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                          >
                            Editar
                          </Link>

                          <Link
                            href={`/users/${user._id}/password`}
                            className="inline-flex rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                          >
                            Reset
                          </Link>

                          <form
                            action={`/api/users/${user._id}/toggle-status`}
                            method="POST"
                          >
                            <button
                              type="submit"
                              className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                user.estado === "activo"
                                  ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                              }`}
                            >
                              {user.estado === "activo" ? "Susp." : "Activar"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}