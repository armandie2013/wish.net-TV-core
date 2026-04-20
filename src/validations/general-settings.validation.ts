import { z } from "zod";

export const updateGeneralSettingsSchema = z.object({
  nombreEmpresa: z
    .string()
    .trim()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres")
    .max(80, "El nombre de la empresa no puede superar los 80 caracteres"),
});

export type UpdateGeneralSettingsInput = z.infer<
  typeof updateGeneralSettingsSchema
>;