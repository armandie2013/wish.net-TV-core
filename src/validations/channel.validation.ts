import { z } from "zod";

export const createChannelSchema = z.object({
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

  categoria: z
    .string()
    .trim()
    .min(2, "La categoría debe tener al menos 2 caracteres")
    .max(80, "La categoría no puede superar los 80 caracteres"),

  logo: z
    .string()
    .trim()
    .url("El logo debe ser una URL válida")
    .optional()
    .or(z.literal("")),

  urlOrigen: z
    .string()
    .trim()
    .url("La URL origen debe ser válida"),

  estado: z.enum(["activo", "suspendido"]),
});

export const updateChannelSchema = createChannelSchema;

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;