import { z } from "zod";

export const forgotPasswordEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("validation.email.invalid");

export const forgotPasswordSchema = z.object({
  email: forgotPasswordEmailSchema,
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
