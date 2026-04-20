import { z } from "zod";

const normalizeOptionalString = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

const normalizePath = z
  .string()
  .trim()
  .min(1, "La ruta health es obligatoria")
  .max(120, "La ruta health no puede superar los 120 caracteres")
  .transform((value) => {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    return value.startsWith("/") ? value : `/${value}`;
  });

export const createStreamingNodeSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),

  tipo: z.enum(["origin", "edge"]),

  urlBase: z
    .string()
    .trim()
    .url("La URL base debe ser válida")
    .transform((value) => value.replace(/\/+$/, "")),

  host: normalizeOptionalString(
    150,
    "El host no puede superar los 150 caracteres"
  ),

  puerto: z.coerce
    .number({
      invalid_type_error: "El puerto debe ser un número",
    })
    .int("El puerto debe ser un número entero")
    .min(1, "El puerto debe ser mayor a 0"),

  prioridad: z.coerce
    .number({
      invalid_type_error: "La prioridad debe ser un número",
    })
    .int("La prioridad debe ser un número entero")
    .min(1, "La prioridad mínima es 1"),

  estado: z.enum(["activo", "suspendido"]),

  habilitado: z.coerce.boolean().default(true),

  healthCheckPath: normalizePath.default("/health"),

  healthTimeoutMs: z.coerce
    .number({
      invalid_type_error: "El timeout debe ser un número",
    })
    .int("El timeout debe ser entero")
    .min(500, "El timeout mínimo es 500 ms")
    .max(15000, "El timeout máximo es 15000 ms")
    .default(2500),

  observaciones: normalizeOptionalString(
    400,
    "Las observaciones no pueden superar los 400 caracteres"
  ),
});

export const updateStreamingNodeSchema = createStreamingNodeSchema;

export type CreateStreamingNodeInput = z.infer<
  typeof createStreamingNodeSchema
>;
export type UpdateStreamingNodeInput = z.infer<
  typeof updateStreamingNodeSchema
>;