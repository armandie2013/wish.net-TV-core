"use client";

import { useEffect, useMemo, useState } from "react";

type StreamingConnectionFieldsProps = {
  initialHost?: string;
  initialPuerto?: string | number | null;
  initialUrlBase?: string;
};

function buildUrlBase(host: string, puerto: string) {
  const cleanHost = host.trim();
  const cleanPort = puerto.trim();

  if (!cleanHost || !cleanPort) return "";

  if (cleanHost.startsWith("http://") || cleanHost.startsWith("https://")) {
    try {
      const url = new URL(cleanHost);
      url.port = cleanPort;
      return url.toString().replace(/\/$/, "");
    } catch {
      return `${cleanHost}:${cleanPort}`;
    }
  }

  return `http://${cleanHost}:${cleanPort}`;
}

export default function StreamingConnectionFields({
  initialHost = "",
  initialPuerto = "",
  initialUrlBase = "",
}: StreamingConnectionFieldsProps) {
  const [host, setHost] = useState(initialHost);
  const [puerto, setPuerto] = useState(
    initialPuerto === null || initialPuerto === undefined
      ? ""
      : String(initialPuerto)
  );
  const [urlBase, setUrlBase] = useState(initialUrlBase);
  const [manualUrl, setManualUrl] = useState(Boolean(initialUrlBase));

  const suggestedUrl = useMemo(() => buildUrlBase(host, puerto), [host, puerto]);

  useEffect(() => {
    if (!manualUrl) {
      setUrlBase(suggestedUrl);
    }
  }, [suggestedUrl, manualUrl]);

  function handleUseSuggestedUrl() {
    setUrlBase(suggestedUrl);
    setManualUrl(false);
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="urlBase"
            className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
          >
            URL base
          </label>

          {suggestedUrl && urlBase !== suggestedUrl ? (
            <button
              type="button"
              onClick={handleUseSuggestedUrl}
              className="mb-1 inline-flex h-6 items-center justify-center rounded-md border border-cyan-300 bg-cyan-50 px-2 text-[10px] font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
            >
              Usar sugerida
            </button>
          ) : null}
        </div>

        <input
          id="urlBase"
          type="text"
          name="urlBase"
          value={urlBase}
          onChange={(event) => {
            setUrlBase(event.target.value);
            setManualUrl(true);
          }}
          placeholder="Ej: http://10.254.1.15:5001"
          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        />

        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          Se genera automáticamente con Host/IP + Puerto. También podés editarla
          manualmente si necesitás usar HTTPS, dominio o una URL especial.
        </p>
      </div>

      <div>
        <label
          htmlFor="host"
          className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
        >
          Host / IP
        </label>

        <input
          id="host"
          type="text"
          name="host"
          value={host}
          onChange={(event) => {
            setHost(event.target.value);
            setManualUrl(false);
          }}
          placeholder="Ej: 10.254.1.15"
          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        />

        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          IP o dominio del nodo.
        </p>
      </div>

      <div>
        <label
          htmlFor="puerto"
          className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
        >
          Puerto
        </label>

        <input
          id="puerto"
          type="number"
          name="puerto"
          value={puerto}
          onChange={(event) => {
            setPuerto(event.target.value);
            setManualUrl(false);
          }}
          min={1}
          max={65535}
          placeholder="Ej: 4001"
          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[12px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
        />

        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
          Ej: origin 4001, edge 5001.
        </p>
      </div>
    </div>
  );
}