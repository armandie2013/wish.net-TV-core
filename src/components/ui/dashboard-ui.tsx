// import Link from "next/link";

// type Tone =
//   | "neutral"
//   | "cyan"
//   | "blue"
//   | "green"
//   | "red"
//   | "amber"
//   | "violet"
//   | "slate";

// function cn(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// function getToneClasses(tone: Tone = "neutral") {
//   const tones: Record<
//     Tone,
//     {
//       border: string;
//       bg: string;
//       text: string;
//       hover: string;
//       kpiValue: string;
//     }
//   > = {
//     neutral: {
//       border: "border-slate-300 dark:border-slate-800",
//       bg: "bg-white dark:bg-slate-950/30",
//       text: "text-slate-900 dark:text-slate-100",
//       hover: "hover:bg-slate-200 dark:hover:bg-slate-700",
//       kpiValue: "text-slate-900 dark:text-slate-100",
//     },
//     slate: {
//       border: "border-slate-300 dark:border-slate-500/40",
//       bg: "bg-slate-100 dark:bg-slate-500/10",
//       text: "text-slate-600 dark:text-slate-300",
//       hover: "hover:bg-slate-200 dark:hover:bg-slate-500/20",
//       kpiValue: "text-slate-700 dark:text-slate-200",
//     },
//     cyan: {
//       border: "border-cyan-300 dark:border-cyan-500/30",
//       bg: "bg-cyan-50 dark:bg-cyan-500/10",
//       text: "text-cyan-700 dark:text-cyan-200",
//       hover: "hover:bg-cyan-100 dark:hover:bg-cyan-500/20",
//       kpiValue: "text-cyan-700 dark:text-cyan-200",
//     },
//     blue: {
//       border: "border-blue-200 dark:border-cyan-500/30",
//       bg: "bg-blue-50 dark:bg-cyan-500/10",
//       text: "text-blue-800 dark:text-cyan-200",
//       hover: "hover:bg-blue-100 dark:hover:bg-cyan-500/20",
//       kpiValue: "text-blue-700 dark:text-cyan-200",
//     },
//     green: {
//       border: "border-emerald-300 dark:border-emerald-500/30",
//       bg: "bg-emerald-50 dark:bg-emerald-500/10",
//       text: "text-emerald-700 dark:text-emerald-200",
//       hover: "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
//       kpiValue: "text-emerald-700 dark:text-emerald-200",
//     },
//     red: {
//       border: "border-red-300 dark:border-red-500/30",
//       bg: "bg-red-50 dark:bg-red-500/10",
//       text: "text-red-700 dark:text-red-200",
//       hover: "hover:bg-red-100 dark:hover:bg-red-500/20",
//       kpiValue: "text-red-700 dark:text-red-200",
//     },
//     amber: {
//       border: "border-amber-300 dark:border-amber-500/30",
//       bg: "bg-amber-50 dark:bg-amber-500/10",
//       text: "text-amber-700 dark:text-amber-200",
//       hover: "hover:bg-amber-100 dark:hover:bg-amber-500/20",
//       kpiValue: "text-amber-700 dark:text-amber-200",
//     },
//     violet: {
//       border: "border-violet-300 dark:border-violet-400/40",
//       bg: "bg-violet-50 dark:bg-violet-500/10",
//       text: "text-violet-700 dark:text-violet-200",
//       hover: "hover:bg-violet-100 dark:hover:bg-violet-500/20",
//       kpiValue: "text-violet-700 dark:text-violet-200",
//     },
//   };

//   return tones[tone];
// }

// export function DashboardSection({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
//       {children}
//     </section>
//   );
// }

// export function DashboardPanel({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
//       {children}
//     </div>
//   );
// }

// export function DashboardHeader({
//   eyebrow = "Configuración",
//   title,
//   description,
//   actionHref,
//   actionLabel,
// }: {
//   eyebrow?: string;
//   title: string;
//   description: string;
//   actionHref?: string;
//   actionLabel?: string;
// }) {
//   return (
//     <div className="border-b border-slate-200 px-3 py-4 dark:border-slate-800">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-cyan-400">
//             {eyebrow}
//           </p>

//           <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
//             {title}
//           </h1>

//           <p className="mt-1 max-w-3xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
//             {description}
//           </p>
//         </div>

//         {actionHref && actionLabel ? (
//           <Link
//             href={actionHref}
//             className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
//           >
//             {actionLabel}
//           </Link>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// export function AlertBox({
//   children,
//   tone = "green",
// }: {
//   children: React.ReactNode;
//   tone?: "green" | "red" | "cyan" | "amber";
// }) {
//   const toneClasses = getToneClasses(tone);

//   return (
//     <div
//       className={cn(
//         "rounded-lg border px-3 py-2 text-xs",
//         toneClasses.border,
//         toneClasses.bg,
//         toneClasses.text
//       )}
//     >
//       {children}
//     </div>
//   );
// }

// export function KpiCard({
//   title,
//   value,
//   desc,
//   tone = "neutral",
// }: {
//   title: string;
//   value: string | number;
//   desc: string;
//   tone?: Tone;
// }) {
//   const toneClasses = getToneClasses(tone);

//   return (
//     <div
//       className={cn(
//         "rounded-xl border px-3 py-3 shadow-sm dark:shadow-none",
//         toneClasses.border,
//         "bg-white dark:bg-slate-950/30"
//       )}
//     >
//       <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
//         {title}
//       </div>

//       <div
//         className={cn(
//           "mt-1 text-xl font-semibold leading-none",
//           toneClasses.kpiValue
//         )}
//       >
//         {value}
//       </div>

//       <div className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
//         {desc}
//       </div>
//     </div>
//   );
// }

// export function StatusBadge({
//   children,
//   tone = "slate",
//   className,
// }: {
//   children: React.ReactNode;
//   tone?: Tone;
//   className?: string;
// }) {
//   const toneClasses = getToneClasses(tone);

//   return (
//     <span
//       className={cn(
//         "inline-flex h-5 items-center justify-center rounded-full border px-2 text-[9px] font-medium uppercase leading-none",
//         toneClasses.border,
//         toneClasses.bg,
//         toneClasses.text,
//         className
//       )}
//     >
//       {children}
//     </span>
//   );
// }

// export function CodeBadge({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <span
//       className={cn(
//         "inline-flex h-6 min-w-[38px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-2 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200",
//         className
//       )}
//     >
//       {children}
//     </span>
//   );
// }

// export function ActionLink({
//   href,
//   children,
//   tone = "neutral",
//   className,
// }: {
//   href: string;
//   children: React.ReactNode;
//   tone?: Tone;
//   className?: string;
// }) {
//   const toneClasses = getToneClasses(tone);

//   return (
//     <Link
//       href={href}
//       className={cn(
//         "inline-flex h-7 w-[64px] items-center justify-center rounded-md border px-2 text-[10px] font-medium leading-none transition",
//         toneClasses.border,
//         tone === "neutral"
//           ? "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
//           : cn(toneClasses.bg, toneClasses.text, toneClasses.hover),
//         className
//       )}
//     >
//       {children}
//     </Link>
//   );
// }

// export function ActionButton({
//   children,
//   tone = "neutral",
//   type = "submit",
//   disabled = false,
//   className,
// }: {
//   children: React.ReactNode;
//   tone?: Tone;
//   type?: "button" | "submit";
//   disabled?: boolean;
//   className?: string;
// }) {
//   const toneClasses = getToneClasses(tone);

//   const disabledClass =
//     "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";

//   return (
//     <button
//       type={type}
//       disabled={disabled}
//       className={cn(
//         "inline-flex h-7 w-[64px] items-center justify-center rounded-md border px-2 text-[10px] font-medium leading-none transition",
//         disabled
//           ? disabledClass
//           : tone === "neutral"
//             ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
//             : cn(toneClasses.border, toneClasses.bg, toneClasses.text, toneClasses.hover),
//         className
//       )}
//     >
//       {children}
//     </button>
//   );
// }

// export function TableShell({
//   children,
//   minWidth = "min-w-[940px]",
//   maxHeight = "max-h-[620px]",
// }: {
//   children: React.ReactNode;
//   minWidth?: string;
//   maxHeight?: string;
// }) {
//   return (
//     <div
//       className={cn(
//         "overflow-auto rounded-xl border border-slate-300 dark:border-slate-800",
//         maxHeight
//       )}
//     >
//       <table className={cn("w-full text-[11px]", minWidth)}>{children}</table>
//     </div>
//   );
// }

// export function TableHead({ children }: { children: React.ReactNode }) {
//   return (
//     <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-950/70 dark:text-slate-400">
//       {children}
//     </thead>
//   );
// }

// export function TableBody({ children }: { children: React.ReactNode }) {
//   return (
//     <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
//       {children}
//     </tbody>
//   );
// }

// export function TableRow({
//   children,
//   index = 0,
//   align = "middle",
// }: {
//   children: React.ReactNode;
//   index?: number;
//   align?: "top" | "middle";
// }) {
//   return (
//     <tr
//       className={cn(
//         align === "top" ? "align-top" : "align-middle",
//         "transition hover:bg-slate-100/70 dark:hover:bg-slate-950/30",
//         index % 2
//           ? "bg-slate-50 dark:bg-slate-900/30"
//           : "bg-white dark:bg-transparent"
//       )}
//     >
//       {children}
//     </tr>
//   );
// }

// export function EmptyTableRow({
//   colSpan,
//   children,
// }: {
//   colSpan: number;
//   children: React.ReactNode;
// }) {
//   return (
//     <tr>
//       <td
//         colSpan={colSpan}
//         className="px-3 py-8 text-center text-[12px] text-slate-500 dark:text-slate-400"
//       >
//         {children}
//       </td>
//     </tr>
//   );
// }

// export function DashboardFooterNote({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <p className="mt-2 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
//       {children}
//     </p>
//   );
// }

import Link from "next/link";

type Tone =
  | "neutral"
  | "cyan"
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "violet"
  | "slate";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToneClasses(tone: Tone = "neutral") {
  const tones: Record<
    Tone,
    {
      border: string;
      bg: string;
      text: string;
      hover: string;
      kpiValue: string;
    }
  > = {
    neutral: {
      border: "border-slate-300 dark:border-slate-800",
      bg: "bg-white dark:bg-slate-950/30",
      text: "text-slate-900 dark:text-slate-100",
      hover: "hover:bg-slate-200 dark:hover:bg-slate-700",
      kpiValue: "text-slate-900 dark:text-slate-100",
    },
    slate: {
      border: "border-slate-300 dark:border-slate-500/40",
      bg: "bg-slate-100 dark:bg-slate-500/10",
      text: "text-slate-600 dark:text-slate-300",
      hover: "hover:bg-slate-200 dark:hover:bg-slate-500/20",
      kpiValue: "text-slate-700 dark:text-slate-200",
    },
    cyan: {
      border: "border-cyan-300 dark:border-cyan-500/30",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      text: "text-cyan-700 dark:text-cyan-200",
      hover: "hover:bg-cyan-100 dark:hover:bg-cyan-500/20",
      kpiValue: "text-cyan-700 dark:text-cyan-200",
    },
    blue: {
      border: "border-blue-200 dark:border-cyan-500/30",
      bg: "bg-blue-50 dark:bg-cyan-500/10",
      text: "text-blue-800 dark:text-cyan-200",
      hover: "hover:bg-blue-100 dark:hover:bg-cyan-500/20",
      kpiValue: "text-blue-700 dark:text-cyan-200",
    },
    green: {
      border: "border-emerald-300 dark:border-emerald-500/30",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-200",
      hover: "hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
      kpiValue: "text-emerald-700 dark:text-emerald-200",
    },
    red: {
      border: "border-red-300 dark:border-red-500/30",
      bg: "bg-red-50 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-200",
      hover: "hover:bg-red-100 dark:hover:bg-red-500/20",
      kpiValue: "text-red-700 dark:text-red-200",
    },
    amber: {
      border: "border-amber-300 dark:border-amber-500/30",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-200",
      hover: "hover:bg-amber-100 dark:hover:bg-amber-500/20",
      kpiValue: "text-amber-700 dark:text-amber-200",
    },
    violet: {
      border: "border-violet-300 dark:border-violet-400/40",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-200",
      hover: "hover:bg-violet-100 dark:hover:bg-violet-500/20",
      kpiValue: "text-violet-700 dark:text-violet-200",
    },
  };

  return tones[tone];
}

export function DashboardSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col text-[12px] font-normal text-slate-800 dark:text-slate-200">
      {children}
    </section>
  );
}

export function DashboardPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {children}
    </div>
  );
}

export function DashboardHeader({
  eyebrow = "Configuración",
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="shrink-0 border-b border-slate-200 px-3 py-3 dark:border-slate-800 2xl:py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-cyan-400">
            {eyebrow}
          </p>

          <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white 2xl:text-xl">
            {title}
          </h1>

          <p className="mt-0.5 max-w-3xl text-[11px] leading-snug text-slate-500 dark:text-slate-400 2xl:text-[12px]">
            {description}
          </p>
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20 2xl:h-9 2xl:px-4 2xl:text-[12px]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function AlertBox({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "cyan" | "amber";
}) {
  const toneClasses = getToneClasses(tone);

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs",
        toneClasses.border,
        toneClasses.bg,
        toneClasses.text
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  title,
  value,
  desc,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  desc: string;
  tone?: Tone;
}) {
  const toneClasses = getToneClasses(tone);

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 shadow-sm dark:shadow-none 2xl:py-3",
        toneClasses.border,
        "bg-white dark:bg-slate-950/30"
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {title}
      </div>

      <div
        className={cn(
          "mt-1 text-lg font-semibold leading-none 2xl:text-xl",
          toneClasses.kpiValue
        )}
      >
        {value}
      </div>

      <div className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
        {desc}
      </div>
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const toneClasses = getToneClasses(tone);

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center justify-center rounded-full border px-2 text-[9px] font-medium uppercase leading-none",
        toneClasses.border,
        toneClasses.bg,
        toneClasses.text,
        className
      )}
    >
      {children}
    </span>
  );
}

export function CodeBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[38px] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-2 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ActionLink({
  href,
  children,
  tone = "neutral",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const toneClasses = getToneClasses(tone);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-7 w-[60px] items-center justify-center rounded-md border px-2 text-[10px] font-medium leading-none transition",
        toneClasses.border,
        tone === "neutral"
          ? "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          : cn(toneClasses.bg, toneClasses.text, toneClasses.hover),
        className
      )}
    >
      {children}
    </Link>
  );
}

export function ActionButton({
  children,
  tone = "neutral",
  type = "submit",
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const toneClasses = getToneClasses(tone);

  const disabledClass =
    "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-[60px] items-center justify-center rounded-md border px-2 text-[10px] font-medium leading-none transition",
        disabled
          ? disabledClass
          : tone === "neutral"
            ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            : cn(
                toneClasses.border,
                toneClasses.bg,
                toneClasses.text,
                toneClasses.hover
              ),
        className
      )}
    >
      {children}
    </button>
  );
}

export function TableShell({
  children,
  minWidth = "min-w-[940px]",
  maxHeight = "max-h-[calc(100dvh-315px)]",
}: {
  children: React.ReactNode;
  minWidth?: string;
  maxHeight?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 overflow-auto rounded-xl border border-slate-300 dark:border-slate-800",
        maxHeight
      )}
    >
      <table className={cn("w-full text-[11px]", minWidth)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-950/90 dark:text-slate-400">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  index = 0,
  align = "middle",
}: {
  children: React.ReactNode;
  index?: number;
  align?: "top" | "middle";
}) {
  return (
    <tr
      className={cn(
        align === "top" ? "align-top" : "align-middle",
        "transition hover:bg-slate-100/70 dark:hover:bg-slate-950/30",
        index % 2
          ? "bg-slate-50 dark:bg-slate-900/30"
          : "bg-white dark:bg-transparent"
      )}
    >
      {children}
    </tr>
  );
}

export function EmptyTableRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-3 py-6 text-center text-[12px] text-slate-500 dark:text-slate-400"
      >
        {children}
      </td>
    </tr>
  );
}

export function DashboardFooterNote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mt-2 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
      {children}
    </p>
  );
}