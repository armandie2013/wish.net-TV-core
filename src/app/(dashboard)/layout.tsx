import type { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { getGeneralSettings } from "@/services/general-settings.service";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getGeneralSettings();

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] dark:opacity-[0.12]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />
      </div>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
      </div>

      <div className="relative z-10 flex h-screen min-h-0">
        <DashboardSidebar appName={settings.nombreEmpresa} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopbar appName={settings.nombreEmpresa} />

          <main className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
            <div className="mx-auto h-full min-h-0 w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}