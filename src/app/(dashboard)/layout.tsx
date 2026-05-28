// import type { ReactNode } from "react";
// import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
// import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
// import { getGeneralSettings } from "@/services/general-settings.service";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const settings = await getGeneralSettings();

//   return (
//     <div className="h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
//       <div className="pointer-events-none fixed inset-0 opacity-[0.18] dark:opacity-[0.12]">
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />
//       </div>

//       <div className="pointer-events-none fixed inset-0">
//         <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
//         <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
//       </div>

//       <div className="relative z-10 flex h-screen min-h-0">
//         <DashboardSidebar appName={settings.nombreEmpresa} />

//         <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
//           <DashboardTopbar appName={settings.nombreEmpresa} />

//           <main className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
//             <div className="mx-auto h-full min-h-0 w-full max-w-[1600px]">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] dark:opacity-[0.1]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]" />
      </div>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-140px] top-[-140px] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-[-140px] right-[-140px] h-80 w-80 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
      </div>

      <div className="relative z-10 flex h-dvh min-h-0">
        <DashboardSidebar appName={settings.nombreEmpresa} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopbar appName={settings.nombreEmpresa} />

          <main className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3 2xl:px-4 2xl:py-4">
            <div className="mx-auto h-full min-h-0 w-full max-w-[1680px]">
              <div className="hidden h-full min-h-0 max-[900px]:flex">
                <div className="m-auto w-full max-w-md rounded-2xl border border-slate-300 bg-white/90 p-5 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-400">
                    Panel administrativo IPTV
                  </p>

                  <h1 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Pantalla no optimizada
                  </h1>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Este panel está optimizado para pantallas de escritorio.
                    Usá una notebook, PC o monitor para una mejor experiencia.
                  </p>
                </div>
              </div>

              <div className="h-full min-h-0 max-[900px]:hidden">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}