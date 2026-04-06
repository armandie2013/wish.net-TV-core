import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getAllUsers } from "@/services/user.service";
import Link from "next/link";

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

  const users = await getAllUsers();

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  const success = searchParams?.success || "";
  const createdEmail = searchParams?.email || "";
  const tempPassword = searchParams?.tempPassword || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Usuarios
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Listado de usuarios
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Visualizá y administrá las cuentas registradas en el sistema.
              </p>
            </div>

            <Link
              href="/users/new"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Nuevo usuario
            </Link>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success === "user-created" && createdEmail && tempPassword && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            <p className="font-semibold text-emerald-200">
              Usuario creado correctamente
            </p>
            <p className="mt-1">
              Email:{" "}
              <span className="font-mono text-slate-100">{createdEmail}</span>
            </p>
            <p className="mt-1">
              Contraseña temporal:{" "}
              <span className="font-mono text-slate-100">{tempPassword}</span>
            </p>
            <p className="mt-2 text-xs text-emerald-400/90">
              Guardala ahora. El usuario deberá cambiarla al ingresar por
              primera vez.
            </p>
          </div>
        )}

        {success === "password-reset" && createdEmail && tempPassword && (
          <div className="mx-6 mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-4 text-sm text-yellow-300">
            <p className="font-semibold text-yellow-200">
              Contraseña restablecida correctamente
            </p>
            <p className="mt-1">
              Email:{" "}
              <span className="font-mono text-slate-100">{createdEmail}</span>
            </p>
            <p className="mt-1">
              Nueva contraseña temporal:{" "}
              <span className="font-mono text-slate-100">{tempPassword}</span>
            </p>
            <p className="mt-2 text-xs text-yellow-400/90">
              El usuario deberá cambiarla obligatoriamente en el próximo inicio
              de sesión.
            </p>
          </div>
        )}

        {success === "user-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Usuario actualizado correctamente.
          </div>
        )}

        {success === "status-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Estado del usuario actualizado correctamente.
          </div>
        )}

        {success === "password-updated" && (
          <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Contraseña actualizada correctamente.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Localidad</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Conexiones</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-800/80 text-slate-300 transition hover:bg-slate-950/30 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {user.nombre}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">{user.email}</td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                        {user.rol}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          user.estado === "activo"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 capitalize text-slate-400">
                      {user.localidad || "-"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {user.planId?.nombre || "-"}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-100">
                      {user.conexionesPermitidas}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/users/${user._id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/80"
                        >
                          Editar
                        </Link>

                        <Link
                          href={`/users/${user._id}/password`}
                          className="inline-flex items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                        >
                          Restablecer
                        </Link>

                        <form
                          action={`/api/users/${user._id}/toggle-status`}
                          method="POST"
                        >
                          <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              user.estado === "activo"
                                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {user.estado === "activo"
                              ? "Suspender"
                              : "Activar"}
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
    </section>
  );
}