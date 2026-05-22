import Link from "next/link";

type FormOption = {
  value: string;
  label: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FormSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-3 text-[12px] font-normal text-slate-800 dark:text-slate-200">
      {children}
    </section>
  );
}

export function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {children}
    </div>
  );
}

export function FormHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Volver al listado",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <div className="border-b border-slate-200 px-3 py-4 dark:border-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-cyan-400">
            {eyebrow}
          </p>

          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>

          <p className="mt-1 max-w-3xl text-[12px] leading-snug text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <Link
          href={backHref}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

export function FormCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
      <div className="border-b border-slate-200 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {title}
      </div>

      <div className="p-3">{children}</div>
    </div>
  );
}

export function FormGrid({
  children,
  columns = "xl:grid-cols-2",
}: {
  children: React.ReactNode;
  columns?: string;
}) {
  return <div className={cn("grid gap-3", columns)}>{children}</div>;
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  readOnly = false,
  defaultValue,
  min,
  max,
  maxLength,
  placeholder,
  helper,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: string | number | null;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  helper?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        className={
          readOnly
            ? "h-9 w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 text-[12px] text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500"
            : "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        }
      />

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  options,
  required = false,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: FormOption[];
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  defaultValue,
  placeholder,
  helper,
  rows = 5,
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  helper?: string;
  rows?: number;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
      />

      {helper ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function FormActions({
  cancelHref,
  cancelLabel = "Cancelar",
  submitLabel,
}: {
  cancelHref: string;
  cancelLabel?: string;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
      <Link
        href={cancelHref}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 text-[12px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        {cancelLabel}
      </Link>

      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-[12px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function FormStickyActions({
  cancelHref,
  cancelLabel = "Cancelar",
  submitLabel,
}: {
  cancelHref: string;
  cancelLabel?: string;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
      <Link
        href={cancelHref}
        className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 text-[11px] font-medium text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        {cancelLabel}
      </Link>

      <button
        type="submit"
        className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
      >
        {submitLabel}
      </button>
    </div>
  );
}