import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getUserById } from "@/services/user.service";

export default async function ResetUserPasswordPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  await requireAdminPageAccess();

  let user;

  try {
    user = await getUserById(params.id);
  } catch {
    redirect("/users");
  }

  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">
            Seguridad
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Restablecer contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Vas a generar una nueva contraseña temporal para este usuario.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Usuario
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {user.nombre}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-300">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Rol
                </p>
                <p className="mt-1">
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                    {user.rol}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-300">
            <p className="font-semibold text-amber-200">Atención</p>
            <p className="mt-1">
              Esta acción invalida la contraseña actual del usuario y genera una
              nueva contraseña temporal.
            </p>
            <p className="mt-1">
              En el próximo inicio de sesión, el usuario deberá cambiarla
              obligatoriamente.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800 pt-5">
            <div className="flex flex-wrap gap-3">
              <form action={`/api/users/${params.id}/password`} method="POST">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
                >
                  Confirmar restablecimiento
                </button>
              </form>

              <Link
                href="/users"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}