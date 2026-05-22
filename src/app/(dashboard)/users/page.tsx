import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllUsers } from "@/services/user.service";
import { isProtectedAdminEmail } from "@/services/auth.service";
import {
  ActionButton,
  ActionLink,
  AlertBox,
  CodeBadge,
  DashboardFooterNote,
  DashboardHeader,
  DashboardPanel,
  DashboardSection,
  EmptyTableRow,
  KpiCard,
  StatusBadge,
  TableBody,
  TableHead,
  TableRow,
  TableShell,
} from "@/components/ui/dashboard-ui";

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
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function getRoleTone(rol: string) {
  if (rol === "admin") return "violet";
  if (rol === "operador") return "blue";
  return "cyan";
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

  const activeUsers = users.filter((user: any) => user.estado === "activo")
    .length;

  const suspendedUsers = users.filter(
    (user: any) => user.estado === "suspendido"
  ).length;

  const clientUsers = users.filter((user: any) => user.rol === "cliente").length;

  return (
    <DashboardSection>
      <DashboardPanel>
        <DashboardHeader
          eyebrow="Administración"
          title="Usuarios"
          description="Administrá cuentas, roles, estados, planes y restablecimiento de contraseñas."
          actionHref="/users/new"
          actionLabel="Nuevo usuario"
        />

        {(error || success) && (
          <div className="space-y-2 px-3 pt-3">
            {error && (
              <AlertBox tone="red">
                {error === "datos-invalidos"
                  ? "Revisá los datos ingresados."
                  : error}
              </AlertBox>
            )}

            {success === "user-created" && (
              <AlertBox>
                Usuario creado correctamente.
                {email && tempPassword ? (
                  <span className="ml-1">
                    Email: <strong>{email}</strong> — Contraseña temporal:{" "}
                    <strong>{tempPassword}</strong>
                  </span>
                ) : null}
              </AlertBox>
            )}

            {success === "user-updated" && (
              <AlertBox>Usuario actualizado correctamente.</AlertBox>
            )}

            {success === "status-updated" && (
              <AlertBox>Estado actualizado correctamente.</AlertBox>
            )}

            {success === "password-reset" && (
              <AlertBox tone="amber">
                Contraseña reseteada.
                {email && tempPassword ? (
                  <span className="ml-1">
                    Email: <strong>{email}</strong> — Nueva contraseña temporal:{" "}
                    <strong>{tempPassword}</strong>
                  </span>
                ) : null}
              </AlertBox>
            )}

            {success === "user-deleted" && (
              <AlertBox>Usuario eliminado correctamente.</AlertBox>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-3 py-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            title="Total"
            value={users.length}
            desc="Cuentas registradas"
          />

          <KpiCard
            title="Activos"
            value={activeUsers}
            desc="Pueden ingresar"
            tone="green"
          />

          <KpiCard
            title="Suspend."
            value={suspendedUsers}
            desc="Acceso bloqueado"
            tone={suspendedUsers > 0 ? "red" : "green"}
          />

          <KpiCard
            title="Clientes"
            value={clientUsers}
            desc="Usuarios de TV"
            tone="cyan"
          />

          <KpiCard
            title="Protegidos"
            value={protectedUsers}
            desc="Admins críticos"
            tone={protectedUsers > 0 ? "violet" : "neutral"}
          />
        </div>

        <div className="px-3 pb-3">
          <TableShell minWidth="min-w-[1180px]">
            <TableHead>
              <tr>
                <th className="w-[260px] px-3 py-2 text-left font-medium">
                  Usuario
                </th>

                <th className="w-[110px] px-3 py-2 text-left font-medium">
                  Rol
                </th>

                <th className="w-[120px] px-3 py-2 text-left font-medium">
                  Estado
                </th>

                <th className="w-[160px] px-3 py-2 text-left font-medium">
                  Localidad
                </th>

                <th className="w-[160px] px-3 py-2 text-left font-medium">
                  Plan
                </th>

                <th className="w-[80px] px-3 py-2 text-center font-medium">
                  Conex.
                </th>

                <th className="w-[90px] px-3 py-2 text-center font-medium">
                  Token
                </th>

                <th className="w-[90px] px-3 py-2 text-left font-medium">
                  Creado
                </th>

                <th className="w-[250px] px-3 py-2 text-center font-medium">
                  Acciones
                </th>
              </tr>
            </TableHead>

            <TableBody>
              {users.length === 0 ? (
                <EmptyTableRow colSpan={9}>
                  No hay usuarios cargados.
                </EmptyTableRow>
              ) : (
                users.map((user: any, index: number) => {
                  const protectedUser = isUserProtected(user);
                  const resetAllowed = canResetPassword(currentUser, user);
                  const toggleAllowed = canToggleStatus(currentUser, user);
                  const deleteAllowed = canDeleteUser(currentUser, user);
                  const isActive = user.estado === "activo";

                  return (
                    <TableRow key={user._id} index={index}>
                      <td className="px-3 py-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="max-w-[170px] truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                              {user.nombre}
                            </p>

                            {protectedUser ? (
                              <StatusBadge tone="violet">Protegido</StatusBadge>
                            ) : null}
                          </div>

                          <p className="max-w-[220px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>

                          {user.mustChangePassword ? (
                            <div className="mt-1">
                              <StatusBadge tone="amber" className="h-5">
                                Cambiar contraseña
                              </StatusBadge>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <StatusBadge
                          tone={getRoleTone(user.rol) as any}
                          className="w-[82px]"
                        >
                          {user.rol}
                        </StatusBadge>
                      </td>

                      <td className="px-3 py-2">
                        <StatusBadge
                          tone={isActive ? "green" : "red"}
                          className="w-[92px]"
                        >
                          {user.estado}
                        </StatusBadge>
                      </td>

                      <td className="px-3 py-2">
                        <span className="block max-w-[140px] truncate text-[11px] text-slate-600 dark:text-slate-300">
                          {user.localidadId?.nombre ||
                            user.localidad ||
                            "principal"}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <span className="block max-w-[140px] truncate text-[11px] text-slate-600 dark:text-slate-300">
                          {user.planId?.nombre || "—"}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <CodeBadge>{user.conexionesPermitidas || 1}</CodeBadge>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <CodeBadge>
                          {TOKEN_EXPIRES_IN_LABELS[user.tokenExpiresIn] ||
                            user.tokenExpiresIn ||
                            "—"}
                        </CodeBadge>
                      </td>

                      <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ActionLink href={`/users/${user._id}/edit`}>
                            Edit.
                          </ActionLink>

                          <form
                            action={`/api/users/${user._id}/toggle-status`}
                            method="POST"
                          >
                            <ActionButton
                              type="submit"
                              disabled={!toggleAllowed}
                              tone={isActive ? "red" : "green"}
                            >
                              {isActive ? "Susp." : "Act."}
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </TableShell>

          <DashboardFooterNote>
            Los usuarios protegidos no pueden borrarse ni suspenderse. Su
            contraseña solo puede ser restablecida por otro administrador
            protegido.
          </DashboardFooterNote>
        </div>
      </DashboardPanel>
    </DashboardSection>
  );
}