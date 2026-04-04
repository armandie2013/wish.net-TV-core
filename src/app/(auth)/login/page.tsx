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
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Grid técnico suave */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.35]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
      </div>

      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] sm:p-8">
            {/* Header técnico */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-400">
                  IPTV CORE
                </span>

                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  ONLINE
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Authentication Required
              </h1>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter credentials to access system console
              </p>
            </div>

            {/* Formulario */}
            <form
              action="/api/auth/login"
              method="POST"
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="user@system.local"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 active:scale-[0.98] dark:bg-cyan-500 dark:text-slate-900 dark:hover:bg-cyan-400"
              >
                Access System
              </button>

              {success && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {success}
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}
            </form>

            {/* Footer técnico */}
            <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
              <div className="flex items-center justify-between">
                <span>Node: CATAMARCA-CORE</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}