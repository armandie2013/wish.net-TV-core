import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getUserById } from "@/services/user.service";

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

  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : "";

  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-amber-600 dark:text-amber-300">
                Seguridad
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Restablecer contraseña
              </h1>

              <p className="mt-1 max-w-2xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
                Generá una nueva contraseña temporal para este usuario. La
                contraseña actual quedará invalidada.
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

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3 p-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Panel title="Usuario seleccionado">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoBox label="Usuario" value={user.nombre || "—"} />

                <InfoBox label="Email" value={user.email || "—"} breakWords />

                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    Rol
                  </p>

                  <div className="mt-1">
                    <RoleBadge rol={user.rol} />
                  </div>
                </div>
              </div>
            </Panel>

            <aside className="h-fit rounded-lg border border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
              <div className="border-b border-amber-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700 dark:border-amber-500/20 dark:text-amber-200">
                Atención
              </div>

              <div className="space-y-2 p-3 text-[11px] leading-snug text-amber-800 dark:text-amber-200">
                <p>
                  Esta acción invalida la contraseña actual del usuario y genera
                  una nueva contraseña temporal.
                </p>

                <p>
                  En el próximo inicio de sesión, el usuario deberá cambiarla
                  obligatoriamente.
                </p>

                <p className="font-medium">
                  La nueva contraseña se mostrará una sola vez después de
                  confirmar.
                </p>
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

            <form action={`/api/users/${params.id}/password`} method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
              >
                Confirmar restablecimiento
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
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

function InfoBox({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-[12px] leading-snug text-slate-800 dark:text-slate-200 ${
          breakWords ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}