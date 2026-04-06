import { z } from "zod";

const canalesPermitidosSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

export const createPlanSchema = z.object({
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
    .min(0, "El precio no puede ser negativo"),

  conexionesPermitidas: z.coerce
    .number({
      invalid_type_error: "Las conexiones permitidas deben ser un número",
    })
    .int("Debe ser un número entero")
    .min(1, "Debe permitir al menos 1 conexión"),

  estado: z.enum(["activo", "suspendido"]),

  canalesPermitidos: canalesPermitidosSchema,
});

export const updatePlanSchema = createPlanSchema;

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;