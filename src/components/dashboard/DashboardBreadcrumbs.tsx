// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { ChevronRight } from "lucide-react";

// type Crumb = {
//   label: string;
//   href?: string;
// };

// function getBreadcrumbs(pathname: string): Crumb[] {
//   if (pathname === "/dashboard") {
//     return [{ label: "Dashboard" }];
//   }

//   if (pathname === "/users") {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Usuarios" },
//     ];
//   }

//   if (pathname === "/users/new") {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Usuarios", href: "/users" },
//       { label: "Nuevo" },
//     ];
//   }

//   if (pathname.match(/^\/users\/[^/]+\/edit$/)) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Usuarios", href: "/users" },
//       { label: "Editar" },
//     ];
//   }

//   if (pathname.match(/^\/users\/[^/]+\/password$/)) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Usuarios", href: "/users" },
//       { label: "Restablecer contraseña" },
//     ];
//   }

//   if (pathname.startsWith("/clientes")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Clientes" },
//     ];
//   }

//   if (pathname.startsWith("/planes")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Planes" },
//     ];
//   }

//   if (pathname.startsWith("/canales")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Canales" },
//     ];
//   }

//   if (pathname.startsWith("/playlists")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Playlists" },
//     ];
//   }

//   if (pathname.startsWith("/logs")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Logs" },
//     ];
//   }

//   if (pathname.startsWith("/configuracion")) {
//     return [
//       { label: "Dashboard", href: "/dashboard" },
//       { label: "Configuración" },
//     ];
//   }

//   return [{ label: "Dashboard", href: "/dashboard" }];
// }

// export default function DashboardBreadcrumbs() {
//   const pathname = usePathname();
//   const breadcrumbs = getBreadcrumbs(pathname);

//   return (
//     <nav
//       aria-label="Breadcrumb"
//       className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
//     >
//       {breadcrumbs.map((crumb, index) => {
//         const isLast = index === breadcrumbs.length - 1;

//         return (
//           <div key={`${crumb.label}-${index}`} className="flex items-center gap-1">
//             {index > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}

//             {crumb.href && !isLast ? (
//               <Link
//                 href={crumb.href}
//                 className="transition hover:text-cyan-700 dark:hover:text-cyan-400"
//               >
//                 {crumb.label}
//               </Link>
//             ) : (
//               <span
//                 className={
//                   isLast
//                     ? "font-semibold text-slate-700 dark:text-slate-200"
//                     : ""
//                 }
//               >
//                 {crumb.label}
//               </span>
//             )}
//           </div>
//         );
//       })}
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
};

function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/dashboard") {
    return [{ label: "Dashboard" }];
  }

  if (pathname === "/users") {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Usuarios" },
    ];
  }

  if (pathname === "/users/new") {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Usuarios", href: "/users" },
      { label: "Nuevo" },
    ];
  }

  if (pathname.match(/^\/users\/[^/]+\/edit$/)) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Usuarios", href: "/users" },
      { label: "Editar" },
    ];
  }

  if (pathname.match(/^\/users\/[^/]+\/password$/)) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Usuarios", href: "/users" },
      { label: "Restablecer contraseña" },
    ];
  }

  if (pathname.startsWith("/clientes")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Clientes" },
    ];
  }

  if (pathname.startsWith("/planes")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Planes" },
    ];
  }

  if (pathname.startsWith("/canales")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Canales" },
    ];
  }

  if (pathname.startsWith("/playlists")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Playlists" },
    ];
  }

  if (pathname.startsWith("/logs")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Logs" },
    ];
  }

  if (pathname.startsWith("/configuracion")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Configuración" },
    ];
  }

  return [{ label: "Dashboard", href: "/dashboard" }];
}

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-0.5 text-[10px] leading-none text-slate-500 dark:text-slate-400 2xl:text-[11px]"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={`${crumb.label}-${index}`} className="flex items-center gap-0.5">
            {index > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}

            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="transition hover:text-cyan-700 dark:hover:text-cyan-400"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-semibold text-slate-700 dark:text-slate-200"
                    : ""
                }
              >
                {crumb.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}