// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { requireAdminPageAccess } from "@/lib/auth-guards";
// import { getUserById } from "@/services/user.service";

// export default async function ResetUserPasswordPage({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { error?: string };
// }) {
//   await requireAdminPageAccess();

//   let user;

//   try {
//     user = await getUserById(params.id);
//   } catch {
//     redirect("/users");
//   }

//   const error = searchParams?.error
//     ? decodeURIComponent(searchParams.error)
//     : "";

//   return (
//     <section className="space-y-6">
//       <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">
//             Seguridad
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//             Restablecer contraseña
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Vas a generar una nueva contraseña temporal para este usuario.
//           </p>
//         </div>

//         <div className="space-y-6 p-6">
//           <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
//             <div className="grid gap-3 sm:grid-cols-3">
//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                   Usuario
//                 </p>
//                 <p className="mt-1 text-sm font-medium text-slate-100">
//                   {user.nombre}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                   Email
//                 </p>
//                 <p className="mt-1 break-all text-sm text-slate-300">
//                   {user.email}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                   Rol
//                 </p>
//                 <p className="mt-1">
//                   <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
//                     {user.rol}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-300">
//             <p className="font-semibold text-amber-200">Atención</p>
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
//             <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               {error}
//             </div>
//           )}

//           <div className="border-t border-slate-800 pt-5">
//             <div className="flex flex-wrap gap-3">
//               <form action={`/api/users/${params.id}/password`} method="POST">
//                 <button
//                   type="submit"
//                   className="inline-flex items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
//                 >
//                   Confirmar restablecimiento
//                 </button>
//               </form>

//               <Link
//                 href="/users"
//                 className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80"
//               >
//                 Cancelar
//               </Link>
//             </div>
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
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        
        {/* HEADER */}
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Seguridad
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Restablecer contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Vas a generar una nueva contraseña temporal para este usuario.
          </p>
        </div>

        <div className="space-y-6 p-6">

          {/* INFO USER */}
          <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Usuario
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user.nombre}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Rol
                </p>
                <p className="mt-1">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                    {user.rol}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* ALERTA */}
          <div className="rounded-2xl border border-amber-300 bg-amber-100 px-4 py-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
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

          {/* ERROR */}
          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="border-t border-slate-300 pt-5 dark:border-slate-800">
            <div className="flex flex-wrap gap-3">

              <form action={`/api/users/${params.id}/password`} method="POST">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                >
                  Confirmar restablecimiento
                </button>
              </form>

              <Link
                href="/users"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800/80"
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