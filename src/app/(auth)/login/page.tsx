import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    const session = verifyAuthToken(token);

    if (session) {
      redirect(session.mustChangePassword ? "/change-password" : "/dashboard");
    }
  }

  const error =
    searchParams?.error === "credenciales"
      ? "Email o contraseña incorrectos"
      : searchParams?.error === "datos-invalidos"
      ? "Datos inválidos"
      : "";

  const success =
    searchParams?.success === "password-changed"
      ? "Contraseña actualizada correctamente. Iniciá sesión con la nueva contraseña."
      : "";

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-10 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-700 dark:bg-slate-800 md:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-10 text-white md:flex md:flex-col md:justify-between dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                wish.net-TV-core
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
                Panel administrativo IPTV
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100/90">
                Gestión centralizada de usuarios, planes, canales y playlists
                para la plataforma de streaming.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">Core administrativo</p>
                <p className="mt-1 text-sm text-blue-100/80">
                  Autenticación, catálogo, permisos y control operativo.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">Arquitectura escalable</p>
                <p className="mt-1 text-sm text-blue-100/80">
                  Preparado para origin, edge y múltiples localidades.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-8 sm:px-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Acceso
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Ingresá con tu cuenta administrativa para acceder al sistema.
                </p>
              </div>

              <form
                action="/api/auth/login"
                method="POST"
                className="space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue="admin@wishnet.local"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    defaultValue="Admin123456!"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-950"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Ingresar al panel
                </button>

                {success && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}