// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { verifyAuthToken } from "@/lib/auth";
// import { getUserById } from "@/services/user.service";

// export default async function ResetUserPasswordPage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   const cookieStore = cookies();
//   const token = cookieStore.get("auth_token")?.value;

//   if (!token) {
//     redirect("/login");
//   }

//   const payload = verifyAuthToken(token);

//   if (!payload) {
//     redirect("/login");
//   }

//   if (payload.mustChangePassword) {
//     redirect("/change-password");
//   }

//   const user = await getUserById(params.id);

//   const error = searchParams?.error
//     ? decodeURIComponent(searchParams.error)
//     : "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-800">
//         <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-white px-6 py-6 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
//           <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
//             Seguridad
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
//             Restablecer contraseña
//           </h1>
//           <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
//             Vas a generar una nueva contraseña temporal para este usuario.
//           </p>
//         </div>

//         <div className="space-y-6 p-6">
//           <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
//             <p className="text-sm text-slate-600 dark:text-slate-300">
//               <span className="font-semibold text-slate-900 dark:text-white">
//                 Usuario:
//               </span>{" "}
//               {user.nombre}
//             </p>
//             <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
//               <span className="font-semibold text-slate-900 dark:text-white">
//                 Email:
//               </span>{" "}
//               {user.email}
//             </p>
//             <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
//               <span className="font-semibold text-slate-900 dark:text-white">
//                 Rol:
//               </span>{" "}
//               {user.rol}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
//             <p className="font-semibold">Atención</p>
//             <p className="mt-1">
//               Esta acción invalida la contraseña actual del usuario y genera una
//               nueva contraseña temporal.
//             </p>
//             <p className="mt-1">
//               En el próximo inicio de sesión, el usuario deberá cambiarla
//               obligatoriamente.
//             </p>
//           </div>

//           {error && (
//             <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
//               {error}
//             </div>
//           )}

//           <div className="flex flex-wrap gap-3">
//             <form action={`/api/users/${params.id}/password`} method="POST">
//               <button
//                 type="submit"
//                 className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
//               >
//                 Confirmar restablecimiento
//               </button>
//             </form>

//             <Link
//               href="/users"
//               className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
//             >
//               Cancelar
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

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
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-white px-6 py-6 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Seguridad
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Restablecer contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Vas a generar una nueva contraseña temporal para este usuario.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                Usuario:
              </span>{" "}
              {user.nombre}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                Email:
              </span>{" "}
              {user.email}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                Rol:
              </span>{" "}
              {user.rol}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <p className="font-semibold">Atención</p>
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
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <form action={`/api/users/${params.id}/password`} method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                Confirmar restablecimiento
              </button>
            </form>

            <Link
              href="/users"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}