// "use client";

// import { useEffect, useState } from "react";

// type LogItem = {
//   _id: string;
//   action: string;
//   message: string;
//   actorName: string | null;
//   actorEmail: string | null;
//   targetName: string | null;
//   targetEmail: string | null;
//   createdAt: string | null;
// };

// export default function LogsPage() {
//   const [logs, setLogs] = useState<LogItem[]>([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let mounted = true;

//     async function loadLogs() {
//       try {
//         const res = await fetch("/api/logs", {
//           credentials: "include",
//           cache: "no-store",
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           if (mounted) {
//             setError(data?.message || "No se pudieron cargar los logs");
//           }
//           return;
//         }

//         if (mounted && data.ok) {
//           setLogs(data.logs || []);
//           setError("");
//         }
//       } catch {
//         if (mounted) {
//           setError("No se pudo conectar con /api/logs");
//         }
//       }
//     }

//     loadLogs();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   return (
//     <div className="space-y-6">
//       {error && (
//         <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
//           {error}
//         </div>
//       )}

//       <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
//         <div className="mb-4">
//           <h1 className="text-lg font-extrabold tracking-tight text-slate-100">
//             Logs del sistema
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             Últimos eventos registrados en la plataforma.
//           </p>
//         </div>

//         <div className="overflow-x-auto">
//           <div className="max-h-[620px] overflow-y-auto rounded-xl border border-slate-800">
//             <table className="min-w-full text-sm">
//               <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
//                 <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
//                   <th className="px-4 py-3 font-semibold">Fecha</th>
//                   <th className="px-4 py-3 font-semibold">Acción</th>
//                   <th className="px-4 py-3 font-semibold">Actor</th>
//                   <th className="px-4 py-3 font-semibold">Destino</th>
//                   <th className="px-4 py-3 font-semibold">Mensaje</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {logs.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-4 py-10 text-center text-sm text-slate-500"
//                     >
//                       Todavía no hay logs registrados.
//                     </td>
//                   </tr>
//                 ) : (
//                   logs.map((log) => (
//                     <tr
//                       key={log._id}
//                       className="border-b border-slate-800/80 align-top text-slate-300 last:border-b-0"
//                     >
//                       <td className="px-4 py-3 whitespace-nowrap text-slate-400">
//                         {formatDate(log.createdAt)}
//                       </td>

//                       <td className="px-4 py-3">
//                         <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
//                           {log.action}
//                         </span>
//                       </td>

//                       <td className="px-4 py-3">
//                         <div>
//                           <p className="font-medium text-slate-100">
//                             {log.actorName || "Sistema"}
//                           </p>
//                           <p className="text-xs text-slate-500">
//                             {log.actorEmail || "-"}
//                           </p>
//                         </div>
//                       </td>

//                       <td className="px-4 py-3">
//                         <div>
//                           <p className="font-medium text-slate-100">
//                             {log.targetName || "-"}
//                           </p>
//                           <p className="text-xs text-slate-500">
//                             {log.targetEmail || "-"}
//                           </p>
//                         </div>
//                       </td>

//                       <td className="px-4 py-3 text-slate-300">
//                         {log.message}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function formatDate(value: string | null) {
//   if (!value) return "-";

//   const date = new Date(value);

//   return date.toLocaleString("es-AR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

"use client";

import { useEffect, useState } from "react";

type LogItem = {
  _id: string;
  action: string;
  message: string;
  actorName: string | null;
  actorEmail: string | null;
  targetName: string | null;
  targetEmail: string | null;
  createdAt: string | null;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadLogs() {
      try {
        const res = await fetch("/api/logs", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          if (mounted) {
            setError(data?.message || "No se pudieron cargar los logs");
          }
          return;
        }

        if (mounted && data.ok) {
          setLogs(data.logs || []);
          setError("");
        }
      } catch {
        if (mounted) {
          setError("No se pudo conectar con /api/logs");
        }
      }
    }

    loadLogs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-100 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-300 px-6 py-6 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400">
            Logs
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Logs del sistema
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Últimos eventos registrados en la plataforma.
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="max-h-[620px] overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900/95">
                  <tr className="border-b border-slate-300 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800">
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Acción</th>
                    <th className="px-4 py-3 font-semibold">Actor</th>
                    <th className="px-4 py-3 font-semibold">Destino</th>
                    <th className="px-4 py-3 font-semibold">Mensaje</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        Todavía no hay logs registrados.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log._id}
                        className="border-b border-slate-200 align-top text-slate-700 transition hover:bg-slate-100/70 last:border-b-0 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950/30"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-800 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                            {log.action}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {log.actorName || "Sistema"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {log.actorEmail || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {log.targetName || "-"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {log.targetEmail || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {log.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}