import { z } from "zod";

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("validation.email.invalid");

export const loginPasswordSchema = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "validation.password.required",
  });

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: loginPasswordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;
