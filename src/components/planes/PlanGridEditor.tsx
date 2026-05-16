"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type ChannelSelectProps = {
  value: string;
  channels: Channel[];
  suspended?: boolean;
  onChange: (channelId: string) => void;
};

function formatOrden(index: number) {
  return String(index + 1).padStart(3, "0");
}

function isSuspendedChannel(channel?: Channel | null) {
  return channel?.estado === "suspendido";
}

function isActiveChannel(channel?: Channel | null) {
  return channel?.estado === "activo";
}

function getChannelLabel(channel: Channel, index: number) {
  const estado = channel.estado === "suspendido" ? "[S]" : "[A]";
  const sourceName = channel.sourceName ? ` — ${channel.sourceName}` : "";

  return `${formatOrden(index)} - ${estado} ${channel.nombre}${sourceName}`;
}

function sortChannelsByName(channels: Channel[]) {
  return [...channels].sort((a, b) => {
    const estadoA = a.estado === "suspendido" ? 1 : 0;
    const estadoB = b.estado === "suspendido" ? 1 : 0;

    if (estadoA !== estadoB) return estadoA - estadoB;

    const nombreA = a.nombre || "";
    const nombreB = b.nombre || "";

    const compareNombre = nombreA.localeCompare(nombreB, "es", {
      sensitivity: "base",
      numeric: true,
    });

    if (compareNombre !== 0) return compareNombre;

    const categoriaA = a.categoria || "";
    const categoriaB = b.categoria || "";

    return categoriaA.localeCompare(categoriaB, "es", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

function normalizeGridItem(
  item: Partial<GridItem> | undefined,
  index: number,
  channels: Channel[]
): GridItem {
  const channel = item?.channelId
    ? channels.find((c) => String(c._id) === String(item.channelId))
    : null;

  const channelIsActive = isActiveChannel(channel);

  return {
    numero: index + 1,
    orden: index + 1,
    channelId: item?.channelId || "",
    nombreVisible: item?.nombreVisible || channel?.nombre || "",
    habilitado:
      channel && !channelIsActive
        ? false
        : typeof item?.habilitado === "boolean"
          ? item.habilitado
          : Boolean(channel),
    logo: item?.logo || channel?.logo || "",
    categoria: item?.categoria || channel?.categoria || "",
    sourceName: item?.sourceName || channel?.sourceName || "",
  };
}

function renumberGrid(items: GridItem[]) {
  return items.map((item, index) => ({
    ...item,
    numero: index + 1,
    orden: index + 1,
  }));
}

function ChannelSelect({
  value,
  channels,
  suspended = false,
  onChange,
}: ChannelSelectProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 340,
  });

  const selectedIndex = channels.findIndex(
    (channel) => String(channel._id) === String(value)
  );

  const selectedChannel = selectedIndex >= 0 ? channels[selectedIndex] : null;

  const selectedLabel = selectedChannel
    ? getChannelLabel(selectedChannel, selectedIndex)
    : "Seleccionar canal";

  const filteredChannels = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return channels
      .map((channel, index) => ({
        channel,
        index,
        label: getChannelLabel(channel, index),
      }))
      .filter((item) => {
        if (!normalizedSearch) return true;

        return (
          item.label.toLowerCase().includes(normalizedSearch) ||
          item.channel.nombre?.toLowerCase().includes(normalizedSearch) ||
          item.channel.sourceName?.toLowerCase().includes(normalizedSearch) ||
          item.channel.categoria?.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [channels, search]);

  function updateDropdownPosition() {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }

  function openDropdown() {
    updateDropdownPosition();
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
    setSearch("");
  }

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      closeDropdown();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    function handleResize() {
      closeDropdown();
    }

    function handleScroll(event: Event) {
      const target = event.target as Node;

      if (dropdownRef.current?.contains(target)) {
        return;
      }

      closeDropdown();
    }

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const buttonClass = suspended
    ? "flex h-8 w-[340px] items-center justify-between gap-2 rounded-lg border border-red-500/50 bg-red-50 px-3 text-left text-[11px] text-red-700 outline-none transition hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 dark:bg-red-950/40 dark:text-red-100"
    : "flex h-8 w-[340px] items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-[11px] text-slate-900 outline-none transition hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:border-cyan-500/40 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (open) {
            closeDropdown();
          } else {
            openDropdown();
          }
        }}
        className={buttonClass}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="shrink-0 text-[11px] opacity-70">▾</span>
      </button>

      {open ? (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
          }}
          className="z-[9999] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/60"
        >
          <div className="border-b border-slate-200 p-2 dark:border-slate-800">
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar canal..."
              className="h-8 w-full rounded-lg border border-slate-300 bg-white px-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                closeDropdown();
              }}
              className="flex w-full items-center px-3 py-2 text-left text-[11px] text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Seleccionar canal
            </button>

            {filteredChannels.length === 0 ? (
              <div className="px-3 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                No se encontraron canales.
              </div>
            ) : null}

            {filteredChannels.map(({ channel, label }) => {
              const optionSuspended = channel.estado === "suspendido";
              const selected = String(channel._id) === String(value);

              const optionClass = selected
                ? optionSuspended
                  ? "flex w-full items-center justify-between gap-2 bg-red-500/15 px-3 py-2 text-left text-[11px] text-red-700 dark:text-red-200"
                  : "flex w-full items-center justify-between gap-2 bg-blue-500/10 px-3 py-2 text-left text-[11px] text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-200"
                : optionSuspended
                  ? "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                  : "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900";

              return (
                <button
                  key={channel._id}
                  type="button"
                  onClick={() => {
                    onChange(channel._id);
                    closeDropdown();
                  }}
                  className={optionClass}
                >
                  <span className="truncate">{label}</span>

                  {optionSuspended ? (
                    <span className="shrink-0 rounded-md border border-red-400/40 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase text-red-600 dark:text-red-300">
                      Susp.
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function PlanGridEditor({
  channels,
  initialCantidad = 1,
  initialGrid = [],
}: Props) {
  const orderedChannels = useMemo(() => sortChannelsByName(channels), [channels]);

  const channelById = useMemo(() => {
    const map = new Map<string, Channel>();

    orderedChannels.forEach((channel) => {
      map.set(String(channel._id), channel);
    });

    return map;
  }, [orderedChannels]);

  const safeInitialCantidad = Math.max(1, Number(initialCantidad) || 1);

  const initialState = useMemo(() => {
    const base =
      Array.isArray(initialGrid) && initialGrid.length > 0
        ? initialGrid.map((item, index) =>
            normalizeGridItem(item, index, orderedChannels)
          )
        : Array.from({ length: safeInitialCantidad }, (_, index) =>
            normalizeGridItem(undefined, index, orderedChannels)
          );

    while (base.length < safeInitialCantidad) {
      base.push(normalizeGridItem(undefined, base.length, orderedChannels));
    }

    return base.slice(0, safeInitialCantidad);
  }, [orderedChannels, initialGrid, safeInitialCantidad]);

  const [cantidadAplicada, setCantidadAplicada] = useState(safeInitialCantidad);
  const [cantidadInput, setCantidadInput] = useState(String(safeInitialCantidad));
  const [grid, setGrid] = useState<GridItem[]>(initialState);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const gridForSubmit = useMemo(() => {
    return grid.map((item) => {
      const channel = item.channelId
        ? channelById.get(String(item.channelId))
        : null;

      const suspended = isSuspendedChannel(channel);

      return {
        ...item,
        habilitado: suspended
          ? false
          : Boolean(item.habilitado && item.channelId),
      };
    });
  }, [grid, channelById]);

  const repeatedMap = useMemo(() => {
    const map: Record<string, number> = {};

    grid.forEach((item) => {
      if (!item.channelId) return;
      map[item.channelId] = (map[item.channelId] || 0) + 1;
    });

    return map;
  }, [grid]);

  function syncCantidad(nextLength: number) {
    setCantidadAplicada(nextLength);
    setCantidadInput(String(nextLength));
  }

  function resizeGrid(nextSize: number) {
    setGrid((prev) => {
      const next = [...prev];

      if (next.length < nextSize) {
        for (let i = next.length; i < nextSize; i += 1) {
          next.push(normalizeGridItem(undefined, i, orderedChannels));
        }
      } else if (next.length > nextSize) {
        next.length = nextSize;
      }

      return renumberGrid(next);
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

  function insertRowAt(index: number) {
    setGrid((prev) => {
      const next = [...prev];
      next.splice(index, 0, normalizeGridItem(undefined, index, orderedChannels));

      const updated = renumberGrid(next);
      syncCantidad(updated.length);

      return updated;
    });
  }

  function removeRowAt(index: number) {
    if (grid.length <= 1) {
      window.alert("La grilla debe tener al menos una fila.");
      return;
    }

    const item = grid[index];

    const hasData =
      item.channelId ||
      item.nombreVisible ||
      item.logo ||
      item.categoria ||
      item.sourceName;

    if (hasData) {
      const confirmed = window.confirm(
        `Vas a quitar la fila ${item.numero}. Los canales de abajo se correrán hacia arriba. ¿Querés continuar?`
      );

      if (!confirmed) return;
    }

    setGrid((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const updated = renumberGrid(next);
      syncCantidad(updated.length);

      return updated;
    });
  }

  function handleChannelChange(index: number, channelId: string) {
    const channel =
      orderedChannels.find((c) => String(c._id) === String(channelId)) || null;

    const channelIsActive = isActiveChannel(channel);

    setGrid((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              channelId,
              nombreVisible: channel?.nombre || "",
              logo: channel?.logo || "",
              categoria: channel?.categoria || "",
              sourceName: channel?.sourceName || "",
              habilitado: channelIsActive,
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
      prev.map((item, i) => {
        if (i !== index) return item;

        const channel = item.channelId
          ? channelById.get(String(item.channelId))
          : null;

        if (!channel || isSuspendedChannel(channel)) {
          return {
            ...item,
            habilitado: false,
          };
        }

        return {
          ...item,
          habilitado: checked,
        };
      })
    );
  }

  return (
    <>
      <div className="mb-2 grid gap-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
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
              className="h-8 w-full rounded-lg border border-slate-300 bg-white px-3 text-[11px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
              required
            />

            <button
              type="button"
              onClick={applyCantidad}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-medium text-blue-800 transition hover:bg-blue-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20"
            >
              Aplicar
            </button>
          </div>

          <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
            Si reducís la grilla, el sistema pedirá confirmación.
          </p>
        </div>

        <div className="hidden lg:col-span-9 lg:block" />
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
        value={JSON.stringify(gridForSubmit)}
        readOnly
      />

      <div className="rounded-xl border border-slate-300 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="border-b border-slate-300 px-3 py-2 dark:border-slate-800">
          <h2 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
            Grilla del plan
          </h2>

          <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-500">
            Elegí qué canal ocupa cada número. Los canales suspendidos quedan
            visibles para administración, pero no se entregan a los clientes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead className="sticky top-0 z-10 bg-slate-100 text-left text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900/95">
              <tr className="border-b border-slate-300 dark:border-slate-800">
                <th className="w-[58px] px-3 py-2 text-center font-semibold">
                  N°
                </th>
                <th className="px-3 py-2 font-semibold">Canal origen</th>
                <th className="w-[180px] px-3 py-2 font-semibold">Lista</th>
                <th className="w-[220px] px-3 py-2 font-semibold">
                  Nombre visible
                </th>
                <th className="w-[160px] px-3 py-2 font-semibold">
                  Categoría
                </th>
                <th className="w-[70px] px-3 py-2 text-center font-semibold">
                  Hab.
                </th>
                <th className="w-[120px] px-3 py-2 text-center font-semibold">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="text-slate-700 dark:text-slate-300">
              {grid.map((item, index) => {
                const repeated =
                  item.channelId && repeatedMap[item.channelId] > 1;

                const selectedChannel = item.channelId
                  ? channelById.get(String(item.channelId))
                  : null;

                const suspended = isSuspendedChannel(selectedChannel);

                const rowClass = suspended
                  ? "border-b border-red-400/40 bg-red-50/80 align-middle transition last:border-b-0 dark:bg-red-950/20"
                  : "border-b border-slate-200 align-middle transition hover:bg-slate-100/70 last:border-b-0 dark:border-slate-800/80 dark:hover:bg-slate-950/30";

                return (
                  <tr key={`${item.orden}-${index}`} className={rowClass}>
                    <td className="px-3 py-2 text-center align-middle font-semibold text-slate-900 dark:text-slate-100">
                      <span className="inline-flex h-8 w-full items-center justify-center">
                        {item.numero}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <ChannelSelect
                          value={item.channelId}
                          channels={orderedChannels}
                          suspended={suspended}
                          onChange={(channelId) =>
                            handleChannelChange(index, channelId)
                          }
                        />

                        {repeated ? (
                          <span className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[9px] font-medium uppercase leading-none text-amber-700 dark:text-amber-300">
                            Repetido
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-1">
                        {item.sourceName || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <input
                        value={item.nombreVisible}
                        maxLength={50}
                        onChange={(e) =>
                          handleNombreVisibleChange(index, e.target.value)
                        }
                        className="h-8 w-[220px] rounded-lg border border-slate-300 bg-white px-3 text-[11px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-cyan-500/50 dark:focus:ring-cyan-500/10"
                        placeholder="Nombre visible"
                      />
                    </td>

                    <td className="px-3 py-2 align-middle text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-1">
                        {item.categoria || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          item.habilitado && item.channelId && !suspended
                        )}
                        disabled={!item.channelId || suspended}
                        onChange={(e) =>
                          handleHabilitadoChange(index, e.target.checked)
                        }
                        title={
                          suspended
                            ? "No se puede habilitar un canal suspendido"
                            : "Habilitar o deshabilitar este canal en el plan"
                        }
                        className="h-4 w-4 rounded border-slate-400 bg-white text-blue-600 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-cyan-500 dark:focus:ring-cyan-500/30"
                      />
                    </td>

                    <td className="px-3 py-2 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertRowAt(index)}
                          title={`Insertar una fila en la posición ${item.numero}`}
                          className="inline-flex h-6 w-[54px] items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-[9px] font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                        >
                          Insertar
                        </button>

                        <button
                          type="button"
                          onClick={() => removeRowAt(index)}
                          title={`Quitar la fila ${item.numero}`}
                          className="inline-flex h-6 w-[54px] items-center justify-center rounded-md border border-red-200 bg-red-50 text-[9px] font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                        >
                          Quitar
                        </button>
                      </div>
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