"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Layers3,
  Radio,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";

type NavChild = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavChild[];
};

export const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Administración",
    items: [
      { label: "Usuarios", href: "/users", icon: Users },
      { label: "Planes", href: "/planes", icon: Layers3 },
    ],
  },
  {
    label: "IPTV",
    items: [{ label: "Canales", href: "/canales", icon: Radio }],
  },
  {
    label: "Sistema",
    items: [{ label: "Logs", href: "/logs", icon: FileText }],
  },
];

export const configItems: NavChild[] = [
  { label: "Fuentes M3U", href: "/configuracion/m3u-sources", icon: Settings },
  { label: "General", href: "/configuracion/general", icon: Settings },
  { label: "Streaming", href: "/configuracion/streaming", icon: Settings },
  { label: "Localidades", href: "/configuracion/localidades", icon: Settings },
  { label: "Acceso IPTV", href: "/configuracion/acceso-iptv", icon: Settings },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActive(pathname: string, items: NavChild[]) {
  return items.some((item) => isActivePath(pathname, item.href));
}

type SidebarContentProps = {
  onNavigate?: () => void;
  appName: string;
};

export function DashboardSidebarContent({
  onNavigate,
  appName,
}: SidebarContentProps) {
  const pathname = usePathname();

  const [configOpen, setConfigOpen] = useState(
    pathname.startsWith("/configuracion")
  );

  const configActive = groupHasActive(pathname, configItems);

  return (
    <>
      <div className="border-b border-slate-300 px-5 py-5 dark:border-slate-800">
        <div
          className="inline-flex max-w-full items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300"
          title={appName}
        >
          <span className="truncate">{appName}</span>
        </div>

        <h1 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          Panel administrativo
        </h1>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Gestión central del sistema IPTV
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {navGroups.map((group) => {
            const activeGroup = groupHasActive(pathname, group.items);

            return (
              <div key={group.label}>
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-500">
                    {group.label}
                  </span>

                  <ChevronDown
                    className={[
                      "h-4 w-4 transition",
                      activeGroup
                        ? "text-blue-600 dark:text-cyan-400"
                        : "text-slate-400 dark:text-slate-600",
                    ].join(" ")}
                  />
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onNavigate}
                        className={[
                          "group flex items-center rounded-2xl border px-3 py-2.5 text-sm font-medium transition",
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300"
                            : "border-transparent text-slate-800 hover:border-slate-300 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "mr-3 h-4 w-4 shrink-0 transition",
                            active
                              ? "text-blue-600 dark:text-cyan-400"
                              : "text-slate-500 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-cyan-400",
                          ].join(" ")}
                        />

                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div>
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-500">
                Configuración
              </span>

              <button
                onClick={() => setConfigOpen((prev) => !prev)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              >
                <ChevronDown
                  className={[
                    "h-4 w-4 transition",
                    configOpen ? "rotate-180" : "",
                    configActive
                      ? "text-blue-600 dark:text-cyan-400"
                      : "text-slate-400 dark:text-slate-600",
                  ].join(" ")}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setConfigOpen((prev) => !prev)}
                className={[
                  "group flex w-full items-center rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition",
                  configActive
                    ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300"
                    : "border-transparent text-slate-800 hover:border-slate-300 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white",
                ].join(" ")}
              >
                <Settings
                  className={[
                    "mr-3 h-4 w-4",
                    configActive
                      ? "text-blue-600 dark:text-cyan-400"
                      : "text-slate-500 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-cyan-400",
                  ].join(" ")}
                />

                Configuración
              </button>

              {configOpen && (
                <div className="ml-4 space-y-1 border-l border-slate-300 pl-3 dark:border-slate-800">
                  {configItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={[
                          "group flex items-center rounded-xl border px-3 py-2 text-sm transition",
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300"
                            : "border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white",
                        ].join(" ")}
                      >
                        <Icon
                          className={[
                            "mr-3 h-4 w-4",
                            active
                              ? "text-blue-600 dark:text-cyan-400"
                              : "text-slate-500 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-cyan-400",
                          ].join(" ")}
                        />

                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-300 px-4 py-4 dark:border-slate-800">
        <div className="rounded-2xl border border-slate-300 bg-slate-200/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
            Estado del sistema
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Core
            </span>

            <span className="rounded-full border border-emerald-400 bg-emerald-300 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardSidebar({ appName }: { appName: string }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-300 bg-slate-100/90 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/85 lg:flex lg:flex-col">
      <DashboardSidebarContent appName={appName} />
    </aside>
  );
}