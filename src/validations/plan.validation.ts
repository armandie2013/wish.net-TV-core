import { z } from "zod";

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "on" ||
      normalized === "yes"
    );
  }
  return false;
}

function parseGridValue(value: unknown) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

const grillaCanalSchema = z.object({
  numero: z.coerce.number().int().min(1),
  orden: z.coerce.number().int().min(1),
  channelId: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
  nombreVisible: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
  habilitado: z
    .any()
    .optional()
    .transform((value) => parseBoolean(value)),
  logo: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
  categoria: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
  sourceName: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
});

const planBaseSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),

  precio: z.coerce
    .number({
      invalid_type_error: "El precio debe ser un número",
    })
    .min(0, "El precio no puede ser negativo")
    .optional()
    .default(0),

  estado: z.enum(["activo", "suspendido"]),

  cantidadCanales: z.coerce
    .number({
      invalid_type_error: "La cantidad de canales debe ser un número",
    })
    .int("Debe ser un número entero")
    .min(1, "Debés indicar al menos 1 canal")
    .max(500, "La cantidad de canales no puede superar 500"),

  grillaCanalesJson: z.any().optional(),
  grillaCanales: z.any().optional(),
});

export const createPlanSchema = planBaseSchema
  .transform((data, ctx) => {
    const rawGrid =
      data.grillaCanales !== undefined
        ? data.grillaCanales
        : data.grillaCanalesJson;

    const parsedGrid = parseGridValue(rawGrid);

    const validatedGrid = z.array(grillaCanalSchema).safeParse(parsedGrid);

    if (!validatedGrid.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La grilla de canales es inválida",
        path: ["grillaCanalesJson"],
      });

      return z.NEVER;
    }

    const normalizedGrid = validatedGrid.data
      .slice(0, data.cantidadCanales)
      .map((item, index) => ({
        numero: index + 1,
        orden: index + 1,
        channelId: item.channelId || "",
        nombreVisible: item.nombreVisible || "",
        habilitado: item.habilitado ?? true,
        logo: item.logo || "",
        categoria: item.categoria || "",
        sourceName: item.sourceName || "",
      }));

    while (normalizedGrid.length < data.cantidadCanales) {
      const next = normalizedGrid.length + 1;
      normalizedGrid.push({
        numero: next,
        orden: next,
        channelId: "",
        nombreVisible: "",
        habilitado: false,
        logo: "",
        categoria: "",
        sourceName: "",
      });
    }

    return {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: data.precio ?? 0,
      estado: data.estado,
      cantidadCanales: data.cantidadCanales,
      grillaCanales: normalizedGrid,
    };
  })
  .superRefine((data, ctx) => {
    const usedChannels = new Set<string>();

    data.grillaCanales.forEach((item, index) => {
      if (!item.channelId) return;

      if (usedChannels.has(item.channelId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El canal de la fila ${index + 1} está repetido`,
          path: ["grillaCanales", index, "channelId"],
        });
      }

      usedChannels.add(item.channelId);
    });
  });

export const updatePlanSchema = createPlanSchema;

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;