import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllUsers } from "@/services/user.service";
import { isProtectedAdminEmail } from "@/services/auth.service";
import Link from "next/link";

const TOKEN_EXPIRES_IN_LABELS: Record<string, string> = {
  "8h": "8 h",
  "12h": "12 h",
  "24h": "24 h",
  "48h": "48 h",
  "10d": "10 días",
  "20d": "20 días",
  "30d": "30 días",
  "60d": "60 días",
};

function isUserProtected(user: any) {
  return Boolean(user?.isProtected) || isProtectedAdminEmail(user?.email);
}

function canResetPassword(currentUser: any, targetUser: any) {
  if (String(currentUser._id) === String(targetUser._id)) return false;

  if (isUserProtected(targetUser)) {
    return (
      Boolean(currentUser.isProtected) ||
      isProtectedAdminEmail(currentUser.email)
    );
  }

  return true;
}

function canToggleStatus(currentUser: any, targetUser: any) {
  if (String(currentUser._id) === String(targetUser._id)) return false;
  if (isUserProtected(targetUser)) return false;

  return true;
}

function canDeleteUser(currentUser: any, targetUser: any) {
  if (String(currentUser._id) === String(targetUser._id)) return false;
  if (isUserProtected(targetUser)) return false;

  return true;
}

function formatDate(value?: string | Date) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function getRoleBadgeClass(rol: string) {
  if (rol === "admin") {
    return "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200";
  }

  if (rol === "operador") {
    return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200";
  }

  return "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200";
}

function getStatusBadgeClass(estado: string) {
  if (estado === "activo") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200";
  }

  return "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200";
}

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/30">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  tone = "neutral",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex h-6 min-w-[58px] items-center justify-center rounded-md border px-2 text-[10px] font-medium leading-none transition";

  const toneClass =
    tone === "green"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
      : tone === "red"
        ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        : tone === "amber"
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
          : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700";

  const disabledClass =
    "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${disabled ? disabledClass : toneClass}`}
    >
      {children}
    </button>
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
  const currentUser = await requireAdminPageAccess();
  const users = await getAllUsers();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const email = searchParams?.email || "";
  const tempPassword = searchParams?.tempPassword || "";

  const protectedUsers = users.filter((user: any) =>
    isUserProtected(user)
  ).length;

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700 dark:text-cyan-400">
                Administración
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Usuarios
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Administrá cuentas, roles, estados, planes y restablecimiento
                de contraseñas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                Volver
              </Link>

              <Link
                href="/users/new"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
              >
                Nuevo usuario
              </Link>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                {error === "datos-invalidos"
                  ? "Revisá los datos ingresados."
                  : error}
              </div>
            )}

            {success === "user-created" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Usuario creado correctamente.
                {email && tempPassword ? (
                  <span className="ml-1">
                    Email: <strong>{email}</strong> — Contraseña temporal:{" "}
                    <strong>{tempPassword}</strong>
                  </span>
                ) : null}
              </div>
            )}

            {success === "user-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Usuario actualizado correctamente.
              </div>
            )}

            {success === "status-updated" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Estado actualizado correctamente.
              </div>
            )}

            {success === "password-reset" && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                Contraseña reseteada.
                {email && tempPassword ? (
                  <span className="ml-1">
                    Email: <strong>{email}</strong> — Nueva contraseña temporal:{" "}
                    <strong>{tempPassword}</strong>
                  </span>
                ) : null}
              </div>
            )}

            {success === "user-deleted" && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Usuario eliminado correctamente.
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total usuarios"
            value={users.length}
            helper="Cuentas registradas"
          />

          <MetricCard
            title="Activos"
            value={users.filter((user: any) => user.estado === "activo").length}
            helper="Pueden ingresar"
          />

          <MetricCard
            title="Suspendidos"
            value={
              users.filter((user: any) => user.estado === "suspendido").length
            }
            helper="Acceso bloqueado"
          />

          <MetricCard
            title="Clientes"
            value={users.filter((user: any) => user.rol === "cliente").length}
            helper="Usuarios de TV"
          />

          <MetricCard
            title="Protegidos"
            value={protectedUsers}
            helper="Admins críticos"
          />
        </div>

        <div className="px-3 pb-3">
          <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Usuario</th>
                    <th className="px-3 py-2 font-medium">Rol</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Localidad</th>
                    <th className="px-3 py-2 font-medium">Plan</th>
                    <th className="px-3 py-2 text-center font-medium">
                      Conex.
                    </th>
                    <th className="px-3 py-2 font-medium">Token</th>
                    <th className="px-3 py-2 font-medium">Creado</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                      >
                        No hay usuarios cargados.
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => {
                      const protectedUser = isUserProtected(user);
                      const resetAllowed = canResetPassword(currentUser, user);
                      const toggleAllowed = canToggleStatus(currentUser, user);
                      const deleteAllowed = canDeleteUser(currentUser, user);

                      return (
                        <tr
                          key={user._id}
                          className={`transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            protectedUser
                              ? "bg-violet-50/40 dark:bg-violet-950/10"
                              : "bg-white dark:bg-slate-900/30"
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-[12px] font-medium text-slate-900 dark:text-white">
                                  {user.nombre}
                                </p>

                                {protectedUser ? (
                                  <span className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[9px] font-medium uppercase leading-none text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
                                    Protegido
                                  </span>
                                ) : null}
                              </div>

                              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>

                              {user.mustChangePassword ? (
                                <p className="mt-1 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                                  Debe cambiar contraseña
                                </p>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${getRoleBadgeClass(
                                user.rol
                              )}`}
                            >
                              {user.rol}
                            </span>
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase ${getStatusBadgeClass(
                                user.estado
                              )}`}
                            >
                              {user.estado}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                            {user.localidadId?.nombre ||
                              user.localidad ||
                              "principal"}
                          </td>

                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                            {user.planId?.nombre || "-"}
                          </td>

                          <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-300">
                            {user.conexionesPermitidas || 1}
                          </td>

                          <td className="px-3 py-2">
                            <span className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {TOKEN_EXPIRES_IN_LABELS[user.tokenExpiresIn] ||
                                user.tokenExpiresIn ||
                                "-"}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              <Link
                                href={`/users/${user._id}/edit`}
                                className="inline-flex h-6 min-w-[58px] items-center justify-center rounded-md border border-slate-300 bg-slate-100 px-2 text-[10px] font-medium leading-none text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                              >
                                Edit.
                              </Link>

                              <form
                                action={`/api/users/${user._id}/toggle-status`}
                                method="POST"
                              >
                                <ActionButton
                                  type="submit"
                                  disabled={!toggleAllowed}
                                  tone={
                                    user.estado === "activo" ? "red" : "green"
                                  }
                                >
                                  {user.estado === "activo" ? "Susp." : "Act."}
                                </ActionButton>
                              </form>

                              <form
                                action={`/api/users/${user._id}/reset-password`}
                                method="POST"
                              >
                                <ActionButton
                                  type="submit"
                                  disabled={!resetAllowed}
                                  tone="amber"
                                >
                                  Reset
                                </ActionButton>
                              </form>

                              <form
                                action={`/api/users/${user._id}/delete`}
                                method="POST"
                              >
                                <ActionButton
                                  type="submit"
                                  disabled={!deleteAllowed}
                                  tone="red"
                                >
                                  Borrar
                                </ActionButton>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-2 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
            Los usuarios protegidos no pueden borrarse ni suspenderse. Su
            contraseña solo puede ser restablecida por otro administrador
            protegido.
          </p>
        </div>
      </div>
    </section>
  );
}