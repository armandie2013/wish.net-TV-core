import { z } from "zod";

const optionalObjectId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : ""));

export const createLocationSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),

  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar los 30 caracteres"),

  descripcion: z
    .string()
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),

  streamingNodeId: optionalObjectId,
  fallbackStreamingNodeId: optionalObjectId,

  estado: z.enum(["activo", "suspendido"]),
});

export const updateLocationSchema = createLocationSchema;

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;