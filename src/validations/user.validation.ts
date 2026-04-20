import { z } from "zod";

const optionalObjectId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : ""));

const optionalText = z.string().trim().optional().or(z.literal(""));

export const createUserSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  email: z
    .string()
    .trim()
    .email("Email inválido"),

  rol: z.enum(["admin", "operador", "cliente"]),
  estado: z.enum(["activo", "suspendido"]),

  localidad: optionalText,
  localidadId: optionalObjectId,

  conexionesPermitidas: z.coerce
    .number({
      invalid_type_error: "Las conexiones permitidas deben ser un número",
    })
    .int("Las conexiones permitidas deben ser enteras")
    .min(1, "Debe ser al menos 1"),

  planId: optionalObjectId,
});

export const updateUserSchema = createUserSchema;

export const updateUserPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "La confirmación debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPasswordInput = z.infer<
  typeof updateUserPasswordSchema
>;