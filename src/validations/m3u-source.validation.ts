import { z } from "zod";

export const createM3uSourceSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),

  tipoEntrada: z.enum(["url"]),

  urlFuente: z
    .string()
    .trim()
    .url("La URL de la fuente debe ser válida"),

  estado: z.enum(["activo", "suspendido"]),

  prioridad: z.coerce
    .number({
      invalid_type_error: "La prioridad debe ser un número",
    })
    .int("La prioridad debe ser un número entero")
    .min(1, "La prioridad mínima es 1"),

  localidad: z
    .string()
    .trim()
    .min(2, "La localidad debe tener al menos 2 caracteres")
    .max(100, "La localidad no puede superar los 100 caracteres"),

  importacionAutomatica: z.coerce.boolean(),

  intervaloMinutos: z.coerce
    .number({
      invalid_type_error: "El intervalo debe ser un número",
    })
    .int("El intervalo debe ser un número entero")
    .min(1, "El intervalo mínimo es 1 minuto"),
});

export const updateM3uSourceSchema = createM3uSourceSchema;

export type CreateM3uSourceInput = z.infer<typeof createM3uSourceSchema>;
export type UpdateM3uSourceInput = z.infer<typeof updateM3uSourceSchema>;