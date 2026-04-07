// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { verifyAuthToken } from "@/lib/auth";

// export default function ChangePasswordPage({
//   searchParams,
// }: {
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

//   const error =
//     searchParams?.error === "datos-invalidos"
//       ? "Revisá los datos ingresados"
//       : searchParams?.error
//       ? decodeURIComponent(searchParams.error)
//       : "";

//   return (
//     <main className="min-h-screen bg-slate-950 px-4 py-10">
//       <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
//         <div className="border-b border-slate-800 px-6 py-6">
//           <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
//             Seguridad
//           </p>
//           <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
//             Cambiá tu contraseña
//           </h1>
//           <p className="mt-2 text-sm text-slate-400">
//             Es obligatorio cambiar la contraseña temporal antes de continuar.
//           </p>
//         </div>

//         <form
//           action="/api/auth/change-password"
//           method="POST"
//           className="space-y-6 p-6"
//         >
//           <div className="grid gap-5 md:grid-cols-2">
//             <PasswordField
//               label="Nueva contraseña"
//               name="password"
//             />

//             <PasswordField
//               label="Confirmar contraseña"
//               name="confirmPassword"
//             />
//           </div>

//           {error && (
//             <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//               {error}
//             </div>
//           )}

//           <div className="border-t border-slate-800 pt-5">
//             <button
//               type="submit"
//               className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
//             >
//               Guardar nueva contraseña
//             </button>
//           </div>
//         </form>
//       </div>
//     </main>
//   );
// }

// function PasswordField({
//   label,
//   name,
// }: {
//   label: string;
//   name: string;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-semibold text-slate-200">
//         {label}
//       </label>
//       <input
//         type="password"
//         name={name}
//         required
//         className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
//       />
//     </div>
//   );
// }

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

export default function ChangePasswordPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    redirect("/login");
  }

  const error =
    searchParams?.error === "datos-invalidos"
      ? "Revisá los datos ingresados"
      : searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : "";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
            Seguridad
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Cambiá tu contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Es obligatorio cambiar la contraseña temporal antes de continuar.
          </p>
        </div>

        <form
          action="/api/auth/change-password"
          method="POST"
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <PasswordField label="Nueva contraseña" name="password" />
            <PasswordField
              label="Confirmar contraseña"
              name="confirmPassword"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="border-t border-slate-300 pt-5 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Guardar nueva contraseña
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function PasswordField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <input
        type="password"
        name={name}
        required
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      />
    </div>
  );
}