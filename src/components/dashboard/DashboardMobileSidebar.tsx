"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DashboardSidebarContent } from "@/components/dashboard/DashboardSidebar";

export default function DashboardMobileSidebar({
  appName,
}: {
  appName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={[
          "fixed inset-0 z-[70] transition lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute left-0 top-0 flex h-dvh min-h-0 w-[88vw] max-w-80 flex-col border-r border-slate-200 bg-white/95 shadow-2xl backdrop-blur-sm transition-transform dark:border-slate-800 dark:bg-slate-900/95",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-400">
              Menú
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <DashboardSidebarContent
              appName={appName}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </aside>
      </div>
    </>
  );
}