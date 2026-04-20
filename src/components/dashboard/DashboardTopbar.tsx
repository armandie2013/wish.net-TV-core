// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { usePathname } from "next/navigation";
// import ThemeToggle from "@/components/ThemeToggle";
// import DashboardMobileSidebar from "@/components/dashboard/DashboardMobileSidebar";
// import DashboardBreadcrumbs from "@/components/dashboard/DashboardBreadcrumbs";
// import { Shield, UserCircle2 } from "lucide-react";

// type CurrentUser = {
//     nombre: string;
//     email: string;
//     rol: string;
//     estado: string;
//     localidad?: string;
//     mustChangePassword?: boolean;
// };

// function getTitle(pathname: string) {
//     if (pathname.startsWith("/users")) return "Usuarios";
//     if (pathname.startsWith("/clientes")) return "Clientes";
//     if (pathname.startsWith("/planes")) return "Planes";
//     if (pathname.startsWith("/canales")) return "Canales";
//     if (pathname.startsWith("/playlists")) return "Playlists";
//     if (pathname.startsWith("/logs")) return "Logs";
//     if (pathname.startsWith("/configuracion")) return "Configuración";

//     return "Dashboard";
// }

// function getSubtitle(pathname: string) {
//     if (pathname.startsWith("/users")) return "Gestión de usuarios del sistema";
//     if (pathname.startsWith("/clientes")) return "Administración de clientes";
//     if (pathname.startsWith("/planes")) return "Configuración de planes";
//     if (pathname.startsWith("/canales")) return "Listado de canales IPTV";
//     if (pathname.startsWith("/playlists")) return "Gestión de playlists";
//     if (pathname.startsWith("/logs")) return "Eventos y registros del sistema";
//     if (pathname.startsWith("/configuracion")) return "Ajustes generales del sistema";

//     return "Vista general del sistema";
// }

// function formatRole(rol?: string) {
//     if (!rol) return "Usuario";
//     return rol.charAt(0).toUpperCase() + rol.slice(1);
// }

// export default function DashboardTopbar() {
//     const pathname = usePathname();
//     const [user, setUser] = useState<CurrentUser | null>(null);

//     const title = useMemo(() => getTitle(pathname), [pathname]);
//     const subtitle = useMemo(() => getSubtitle(pathname), [pathname]);

//     useEffect(() => {
//         let cancelled = false;

//         async function loadUser() {
//             try {
//                 const res = await fetch("/api/auth/me", {
//                     method: "GET",
//                     credentials: "include",
//                     cache: "no-store",
//                 });

//                 if (!res.ok) return;

//                 const data = await res.json();

//                 if (!cancelled && data?.ok && data?.user) {
//                     setUser(data.user);
//                 }
//             } catch {
//                 // noop
//             }
//         }

//         loadUser();

//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     return (
//         <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/85">
//             <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
//                 <div className="flex min-w-0 items-center gap-3">
//                     <div className="shrink-0 lg:hidden">
//                         <DashboardMobileSidebar />
//                     </div>

//                     <div className="min-w-0">
//                         <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-400 lg:hidden">
//                             wish.net-TV-core
//                         </p>

//                         <DashboardBreadcrumbs />

//                         <h2 className="mt-1 truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
//                             {title}
//                         </h2>

//                         <p className="text-xs text-slate-500 dark:text-slate-400">
//                             {subtitle}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-2 sm:gap-3">
//                     {user && (
//                         <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60 md:flex">
//                             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
//                                 <UserCircle2 className="h-5 w-5" />
//                             </div>

//                             <div className="min-w-0">
//                                 <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
//                                     {user.nombre}
//                                 </p>

//                                 <div className="mt-0.5 flex items-center gap-2">
//                                     <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
//                                         <Shield className="h-3 w-3" />
//                                         {formatRole(user.rol)}
//                                     </span>

//                                     <span
//                                         className={[
//                                             "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
//                                             user.estado === "activo"
//                                                 ? "border border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
//                                                 : "border border-red-300 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
//                                         ].join(" ")}
//                                     >
//                                         {user.estado}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     <ThemeToggle />

//                     <form action="/api/auth/logout" method="POST">
//                         <button
//                             type="submit"
//                             className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
//                         >
//                             Cerrar sesión
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </header>
//     );
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
  if (pathname.startsWith("/configuracion"))
    return "Ajustes generales del sistema";

  return "Vista general del sistema";
}

function formatRole(rol?: string) {
  if (!rol) return "Usuario";
  return rol.charAt(0).toUpperCase() + rol.slice(1);
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
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-slate-100/90 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 lg:hidden">
            <DashboardMobileSidebar appName={appName} />
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-400 lg:hidden"
              title={appName}
            >
              {appName}
            </p>

            <DashboardBreadcrumbs />

            <h2 className="mt-1 truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-200 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                <UserCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user.nombre}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Shield className="h-3 w-3" />
                    {formatRole(user.rol)}
                  </span>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      user.estado === "activo"
                        ? "border border-emerald-400 bg-emerald-200 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "border border-red-400 bg-red-200 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
                    ].join(" ")}
                  >
                    {user.estado}
                  </span>
                </div>
              </div>
            </div>
          )}

          <ThemeToggle />

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}