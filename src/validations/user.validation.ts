import { z } from "zod";

// 🔹 reutilizable para ObjectId opcional (plan, localidad, etc.)
const optionalObjectId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : ""));

// 🔹 CREATE
export const createUserSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  rol: z.enum(["admin", "operador", "cliente"]),
  estado: z.enum(["activo", "suspendido"]),

  // 👇 esto lo dejamos como texto (UI)
  localidad: z.string().min(2, "La localidad es obligatoria"),

  // 👇 NUEVO (relación real con Localidades)
  localidadId: optionalObjectId,

  conexionesPermitidas: z.coerce
    .number()
    .min(1, "Debe ser al menos 1"),

  planId: optionalObjectId,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// 🔹 UPDATE
export const updateUserSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  rol: z.enum(["admin", "operador", "cliente"]),
  estado: z.enum(["activo", "suspendido"]),

  localidad: z.string().min(2, "La localidad es obligatoria"),
  localidadId: optionalObjectId,

  conexionesPermitidas: z.coerce
    .number()
    .min(1, "Debe ser al menos 1"),

  planId: optionalObjectId,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// 🔹 PASSWORD
export const updateUserPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La confirmación debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type UpdateUserPasswordInput = z.infer<
  typeof updateUserPasswordSchema
>;