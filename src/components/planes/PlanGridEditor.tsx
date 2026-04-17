"use client";

import { useMemo, useRef, useState } from "react";

type Channel = {
  _id: string;
  nombre: string;
  categoria?: string;
  logo?: string;
  sourceName?: string;
  estado?: string;
};

type GridItem = {
  numero: number;
  orden: number;
  channelId: string;
  nombreVisible: string;
  habilitado: boolean;
  logo: string;
  categoria: string;
  sourceName: string;
};

type Props = {
  channels: Channel[];
  initialCantidad?: number;
  initialGrid?: GridItem[];
};

function normalizeGridItem(
  item: Partial<GridItem> | undefined,
  index: number,
  channels: Channel[]
): GridItem {
  const channel = item?.channelId
    ? channels.find((c) => String(c._id) === String(item.channelId))
    : null;

  return {
    numero: index + 1,
    orden: index + 1,
    channelId: item?.channelId || "",
    nombreVisible: item?.nombreVisible || channel?.nombre || "",
    habilitado:
      typeof item?.habilitado === "boolean" ? item.habilitado : true,
    logo: item?.logo || channel?.logo || "",
    categoria: item?.categoria || channel?.categoria || "",
    sourceName: item?.sourceName || channel?.sourceName || "",
  };
}

export default function PlanGridEditor({
  channels,
  initialCantidad = 1,
  initialGrid = [],
}: Props) {
  const safeInitialCantidad = Math.max(1, Number(initialCantidad) || 1);

  const initialState = useMemo(() => {
    const base =
      Array.isArray(initialGrid) && initialGrid.length > 0
        ? initialGrid.map((item, index) =>
            normalizeGridItem(item, index, channels)
          )
        : Array.from({ length: safeInitialCantidad }, (_, index) =>
            normalizeGridItem(undefined, index, channels)
          );

    while (base.length < safeInitialCantidad) {
      base.push(normalizeGridItem(undefined, base.length, channels));
    }

    return base.slice(0, safeInitialCantidad);
  }, [channels, initialGrid, safeInitialCantidad]);

  const [cantidadAplicada, setCantidadAplicada] = useState(safeInitialCantidad);
  const [cantidadInput, setCantidadInput] = useState(String(safeInitialCantidad));
  const [grid, setGrid] = useState<GridItem[]>(initialState);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const repeatedMap = useMemo(() => {
    const map: Record<string, number> = {};

    grid.forEach((item) => {
      if (!item.channelId) return;
      map[item.channelId] = (map[item.channelId] || 0) + 1;
    });

    return map;
  }, [grid]);

  function resizeGrid(nextSize: number) {
    setGrid((prev) => {
      const next = [...prev];

      if (next.length < nextSize) {
        for (let i = next.length; i < nextSize; i += 1) {
          next.push(normalizeGridItem(undefined, i, channels));
        }
      } else if (next.length > nextSize) {
        next.length = nextSize;
      }

      return next.map((item, index) => ({
        ...item,
        numero: index + 1,
        orden: index + 1,
      }));
    });
  }

  function applyCantidad() {
    const parsed = Math.max(1, Number(cantidadInput) || 1);

    if (parsed === cantidadAplicada) {
      setCantidadInput(String(cantidadAplicada));
      return;
    }

    if (parsed < cantidadAplicada) {
      const confirmed = window.confirm(
        `Vas a reducir la grilla de ${cantidadAplicada} a ${parsed} canales. Las posiciones ${
          parsed + 1
        } a ${cantidadAplicada} se quitarán al guardar. ¿Querés continuar?`
      );

      if (!confirmed) {
        setCantidadInput(String(cantidadAplicada));
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
    }

    setCantidadAplicada(parsed);
    setCantidadInput(String(parsed));
    resizeGrid(parsed);
  }

  function handleChannelChange(index: number, channelId: string) {
    const channel =
      channels.find((c) => String(c._id) === String(channelId)) || null;

    setGrid((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              channelId,
              nombreVisible: item.nombreVisible || channel?.nombre || "",
              logo: channel?.logo || "",
              categoria: channel?.categoria || "",
              sourceName: channel?.sourceName || "",
            }
          : item
      )
    );
  }

  function handleNombreVisibleChange(index: number, value: string) {
    setGrid((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, nombreVisible: value } : item
      )
    );
  }

  function handleHabilitadoChange(index: number, checked: boolean) {
    setGrid((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, habilitado: checked } : item
      )
    );
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-200">
            Cantidad de canales
          </label>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="number"
              min={1}
              value={cantidadInput}
              onChange={(e) => setCantidadInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCantidad();
                }
              }}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
              required
            />

            <button
              type="button"
              onClick={applyCantidad}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              Aplicar
            </button>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Escribí la cantidad y presioná <span className="font-semibold text-slate-400">Aplicar</span>. Si reducís la grilla, el sistema te pedirá confirmación.
          </p>
        </div>
      </div>

      <input
        type="hidden"
        name="cantidadCanales"
        value={cantidadAplicada}
        readOnly
      />

      <input
        type="hidden"
        name="grillaCanalesJson"
        value={JSON.stringify(grid)}
        readOnly
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="border-b border-slate-800 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Grilla del plan
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Elegí qué canal ocupa cada número. La app usará exactamente este orden.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 font-semibold">N°</th>
                <th className="px-4 py-3 font-semibold">Canal origen</th>
                <th className="px-4 py-3 font-semibold">Lista</th>
                <th className="px-4 py-3 font-semibold">Nombre visible</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold text-center">Hab.</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {grid.map((item, index) => {
                const repeated =
                  item.channelId && repeatedMap[item.channelId] > 1;

                return (
                  <tr
                    key={index}
                    className="border-b border-slate-800/80 align-top last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      {item.numero}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={item.channelId}
                        onChange={(e) =>
                          handleChannelChange(index, e.target.value)
                        }
                        className="w-[280px] rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                      >
                        <option value="">Seleccionar canal</option>
                        {channels.map((channel) => (
                          <option key={channel._id} value={channel._id}>
                            {channel.nombre}
                            {channel.sourceName
                              ? ` — ${channel.sourceName}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      {repeated ? (
                        <div className="mt-1 text-[11px] text-amber-400">
                          Canal repetido
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {item.sourceName || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        value={item.nombreVisible}
                        onChange={(e) =>
                          handleNombreVisibleChange(index, e.target.value)
                        }
                        className="w-[220px] rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                        placeholder="Nombre visible"
                      />
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {item.categoria || "-"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.habilitado}
                        onChange={(e) =>
                          handleHabilitadoChange(index, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}