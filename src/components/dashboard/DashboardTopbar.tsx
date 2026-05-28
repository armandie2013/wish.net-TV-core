// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { usePathname } from "next/navigation";
// import ThemeToggle from "@/components/ThemeToggle";
// import DashboardMobileSidebar from "@/components/dashboard/DashboardMobileSidebar";
// import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
// import { Shield, UserCircle2 } from "lucide-react";

// type CurrentUser = {
//   nombre: string;
//   email: string;
//   rol: string;
//   estado: string;
//   localidad?: string;
//   mustChangePassword?: boolean;
// };

// function getTitle(pathname: string) {
//   if (pathname.startsWith("/users")) return "Usuarios";
//   if (pathname.startsWith("/clientes")) return "Clientes";
//   if (pathname.startsWith("/planes")) return "Planes";
//   if (pathname.startsWith("/canales")) return "Canales";
//   if (pathname.startsWith("/playlists")) return "Playlists";
//   if (pathname.startsWith("/logs")) return "Logs";
//   if (pathname.startsWith("/configuracion")) return "Configuración";

//   return "Dashboard";
// }

// function getSubtitle(pathname: string) {
//   if (pathname.startsWith("/users")) return "Gestión de usuarios del sistema";
//   if (pathname.startsWith("/clientes")) return "Administración de clientes";
//   if (pathname.startsWith("/planes")) return "Configuración de planes";
//   if (pathname.startsWith("/canales")) return "Listado de canales IPTV";
//   if (pathname.startsWith("/playlists")) return "Gestión de playlists";
//   if (pathname.startsWith("/logs")) return "Eventos y registros del sistema";
//   if (pathname.startsWith("/configuracion"))
//     return "Ajustes generales del sistema";

//   return "Vista general del sistema";
// }

// function formatRole(rol?: string) {
//   if (!rol) return "Usuario";
//   return rol.charAt(0).toUpperCase() + rol.slice(1);
// }

// function StatusBadge({ estado }: { estado?: string }) {
//   const active = estado === "activo";

//   return (
//     <span
//       className={[
//         "inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide",
//         active
//           ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
//           : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
//       ].join(" ")}
//     >
//       {estado || "—"}
//     </span>
//   );
// }

// export default function DashboardTopbar({ appName }: { appName: string }) {
//   const pathname = usePathname();
//   const [user, setUser] = useState<CurrentUser | null>(null);

//   const title = useMemo(() => getTitle(pathname), [pathname]);
//   const subtitle = useMemo(() => getSubtitle(pathname), [pathname]);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadUser() {
//       try {
//         const res = await fetch("/api/auth/me", {
//           method: "GET",
//           credentials: "include",
//           cache: "no-store",
//         });

//         if (!res.ok) return;

//         const data = await res.json();

//         if (!cancelled && data?.ok && data?.user) {
//           setUser(data.user);
//         }
//       } catch {
//         // noop
//       }
//     }

//     loadUser();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <header className="shrink-0 border-b border-slate-300 bg-slate-100/90 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/85">
//       <div className="flex min-h-[64px] items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
//         <div className="flex min-w-0 items-center gap-3">
//           <div className="shrink-0 lg:hidden">
//             <DashboardMobileSidebar appName={appName} />
//           </div>

//           <div className="min-w-0">
//             <p
//               className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400 lg:hidden"
//               title={appName}
//             >
//               {appName}
//             </p>

//             <DashboardBreadcrumbs />

//             <h2 className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
//               {title}
//             </h2>

//             <p className="truncate text-[11px] leading-tight text-slate-600 dark:text-slate-400 sm:text-xs">
//               {subtitle}
//             </p>
//           </div>
//         </div>

//         <div className="flex shrink-0 items-center gap-2">
//           {user && (
//             <div className="hidden items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-2.5 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 md:flex">
//               <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
//                 <UserCircle2 className="h-4 w-4" />
//               </div>

//               <div className="min-w-0">
//                 <p
//                   className="max-w-[150px] truncate text-[12px] font-semibold leading-tight text-slate-800 dark:text-slate-100"
//                   title={user.nombre}
//                 >
//                   {user.nombre}
//                 </p>

//                 <div className="mt-1 flex items-center gap-1.5">
//                   <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
//                     <Shield className="h-2.5 w-2.5" />
//                     {formatRole(user.rol)}
//                   </span>

//                   <StatusBadge estado={user.estado} />
//                 </div>
//               </div>
//             </div>
//           )}

//           <ThemeToggle />

//           <form action="/api/auth/logout" method="POST">
//             <button
//               type="submit"
//               className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-3 text-[12px] font-semibold text-slate-800 transition hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 sm:px-4"
//             >
//               Cerrar sesión
//             </button>
//           </form>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardMobileSidebar from "@/components/dashboard/DashboardMobileSidebar";
import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
import { Shield, UserCircle2 } from "lucide-react";

type CurrentUser = {
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  localidad?: string;
  mustChangePassword?: boolean;
};

function getTitle(pathname: string) {
  if (pathname.startsWith("/users")) return "Usuarios";
  if (pathname.startsWith("/clientes")) return "Clientes";
  if (pathname.startsWith("/planes")) return "Planes";
  if (pathname.startsWith("/canales")) return "Canales";
  if (pathname.startsWith("/playlists")) return "Playlists";
  if (pathname.startsWith("/logs")) return "Logs";
  if (pathname.startsWith("/configuracion")) return "Configuración";

  return "Dashboard";
}

function getSubtitle(pathname: string) {
  if (pathname.startsWith("/users")) return "Gestión de usuarios del sistema";
  if (pathname.startsWith("/clientes")) return "Administración de clientes";
  if (pathname.startsWith("/planes")) return "Configuración de planes";
  if (pathname.startsWith("/canales")) return "Listado de canales IPTV";
  if (pathname.startsWith("/playlists")) return "Gestión de playlists";
  if (pathname.startsWith("/logs")) return "Eventos y registros del sistema";
  if (pathname.startsWith("/configuracion")) {
    return "Ajustes generales del sistema";
  }

  return "Vista general del sistema";
}

function formatRole(rol?: string) {
  if (!rol) return "Usuario";
  return rol.charAt(0).toUpperCase() + rol.slice(1);
}

function StatusBadge({ estado }: { estado?: string }) {
  const active = estado === "activo";

  return (
    <span
      className={[
        "inline-flex h-4 items-center rounded-full border px-1.5 text-[8px] font-semibold uppercase leading-[1.1] tracking-wide",
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
      ].join(" ")}
    >
      {estado || "—"}
    </span>
  );
}

export default function DashboardTopbar({ appName }: { appName: string }) {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);

  const title = useMemo(() => getTitle(pathname), [pathname]);
  const subtitle = useMemo(() => getSubtitle(pathname), [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled && data?.ok && data?.user) {
          setUser(data.user);
        }
      } catch {
        // noop
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="shrink-0 border-b border-slate-300 bg-slate-100/90 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-1.5 sm:px-4 2xl:min-h-[54px]">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="shrink-0 lg:hidden">
            <DashboardMobileSidebar appName={appName} />
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-cyan-400 lg:hidden"
              title={appName}
            >
              {appName}
            </p>

            <DashboardBreadcrumbs />

            <div className="mt-0.5 flex min-w-0 items-baseline gap-2">
              <h2 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white 2xl:text-base">
                {title}
              </h2>

              <p className="hidden truncate text-[11px] leading-tight text-slate-600 dark:text-slate-400 md:block 2xl:text-xs">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 2xl:gap-2">
          {user && (
            <div className="hidden h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-2 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 md:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                <UserCircle2 className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <p
                  className="max-w-[130px] truncate text-[11px] font-semibold leading-[1.15] text-slate-800 dark:text-slate-100 2xl:max-w-[160px]"
                  title={user.nombre}
                >
                  {user.nombre}
                </p>

                <div className="mt-[2px] flex items-center gap-1">
                  <span className="inline-flex h-4 items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-1.5 text-[8px] font-semibold uppercase leading-[1.1] tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Shield className="h-2.5 w-2.5" />
                    {formatRole(user.rol)}
                  </span>

                  <StatusBadge estado={user.estado} />
                </div>
              </div>
            </div>
          )}

          <ThemeToggle />

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-200 px-3 text-[11px] font-medium text-slate-800 transition hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}