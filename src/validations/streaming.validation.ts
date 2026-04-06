import { z } from "zod";

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
    .url("La URL base debe ser válida"),

  host: z
    .string()
    .trim()
    .max(150, "El host no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),

  puerto: z.coerce
    .number({
      invalid_type_error: "El puerto debe ser un número",
    })
    .int("El puerto debe ser un número entero")
    .min(1, "El puerto debe ser mayor a 0"),

  localidad: z
    .string()
    .trim()
    .min(2, "La localidad debe tener al menos 2 caracteres")
    .max(100, "La localidad no puede superar los 100 caracteres"),

  prioridad: z.coerce
    .number({
      invalid_type_error: "La prioridad debe ser un número",
    })
    .int("La prioridad debe ser un número entero")
    .min(1, "La prioridad mínima es 1"),

  estado: z.enum(["activo", "suspendido"]),

  observaciones: z
    .string()
    .trim()
    .max(400, "Las observaciones no pueden superar los 400 caracteres")
    .optional()
    .or(z.literal("")),
});

export const updateStreamingNodeSchema = createStreamingNodeSchema;

export type CreateStreamingNodeInput = z.infer<
  typeof createStreamingNodeSchema
>;
export type UpdateStreamingNodeInput = z.infer<
  typeof updateStreamingNodeSchema
>;