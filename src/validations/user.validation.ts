import { z } from "zod";

const optionalObjectId = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : ""));

const optionalText = z.string().trim().optional().or(z.literal(""));

export const TOKEN_EXPIRES_IN_OPTIONS = [
  "8h",
  "12h",
  "24h",
  "48h",
  "10d",
  "20d",
  "30d",
  "60d",
] as const;

export type TokenExpiresInOption =
  (typeof TOKEN_EXPIRES_IN_OPTIONS)[number];

export function getDefaultTokenExpiresInByRole(
  rol?: string
): TokenExpiresInOption {
  const normalized = String(rol || "").toLowerCase();

  if (normalized === "admin") return "8h";
  if (normalized === "operador") return "24h";

  return "30d";
}

export function normalizeTokenExpiresIn(
  value?: string | null,
  rol?: string
): TokenExpiresInOption {
  const normalized = String(value || "").trim();

  if (
    TOKEN_EXPIRES_IN_OPTIONS.includes(normalized as TokenExpiresInOption)
  ) {
    return normalized as TokenExpiresInOption;
  }

  return getDefaultTokenExpiresInByRole(rol);
}

export function tokenExpiresInToSeconds(value?: string | null): number {
  const normalized = normalizeTokenExpiresIn(value);
  const amount = Number(normalized.slice(0, -1));
  const unit = normalized.slice(-1);

  if (!Number.isFinite(amount) || amount <= 0) return 60 * 60 * 8;

  if (unit === "d") return amount * 24 * 60 * 60;

  return amount * 60 * 60;
}

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

  tokenExpiresIn: z.enum(TOKEN_EXPIRES_IN_OPTIONS),

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