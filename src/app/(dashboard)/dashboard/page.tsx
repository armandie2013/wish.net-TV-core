import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    redirect("/login");
  }

  if (payload.mustChangePassword) {
    redirect("/change-password");
  }

  await connectDB();

  const user = await User.findById(payload.sub).select(
    "nombre email rol localidad estado"
  );

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-white px-6 py-6 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Inicio
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Bienvenido, {user.nombre}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Esta es la base del panel administrativo. Desde acá vas a poder
            gestionar usuarios, planes, canales y playlists del sistema.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Nombre
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {user.nombre}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Rol
            </p>
            <p className="mt-2 text-lg font-bold capitalize text-slate-900 dark:text-white">
              {user.rol}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Localidad
            </p>
            <p className="mt-2 text-lg font-bold capitalize text-slate-900 dark:text-white">
              {user.localidad}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Módulo
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Usuarios
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Alta, edición, roles y control de estado de cuentas.
          </p>
          <Link
            href="/users"
            className="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Ver usuarios
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Próximo módulo
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Planes
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Definición de permisos, conexiones y categorías habilitadas.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Próximo módulo
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Canales
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Catálogo, importación M3U y administración operativa.
          </p>
        </div>
      </div>
    </section>
  );
}