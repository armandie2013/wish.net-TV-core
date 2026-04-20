import { requireAdminPageAccess } from "@/lib/auth-guards";
import { getGeneralSettings } from "@/services/general-settings.service";

export default async function GeneralSettingsPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  await requireAdminPageAccess();

  const settings = await getGeneralSettings();

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados."
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  const success = searchParams?.success || "";

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            General
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Definí el nombre comercial que querés mostrar en el panel y en la
            pestaña del navegador.
          </p>
        </div>

        <form
          action="/api/configuracion/general"
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="max-w-2xl">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nombre de la empresa
            </label>

            <input
              type="text"
              name="nombreEmpresa"
              defaultValue={settings.nombreEmpresa}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Ej: WishNet IPTV"
              required
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Este nombre se usa en el encabezado lateral, en la vista mobile y
              en el título del navegador.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {success === "general-settings-updated" && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Configuración general actualizada correctamente.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Guardar cambios
            </button>

            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Volver al dashboard
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}