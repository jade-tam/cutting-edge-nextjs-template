import { z } from "zod";

const weakPasswords = new Set([
  "password123",
  "12345678",
  "qwerty123",
  "admin123",
  "welcome123",
]);

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("validation.email.invalid");

export const passwordSchema = z
  .string()
  .min(12, "validation.password.tooShort")
  .max(128, "validation.password.tooLong")
  .refine((value) => value.trim() === value, {
    message: "validation.password.noWhitespace",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "validation.password.missingUppercase",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "validation.password.missingLowercase",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "validation.password.missingNumber",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "validation.password.missingSymbol",
  })
  .refine((value) => !weakPasswords.has(value.toLowerCase()), {
    message: "validation.password.weakPassword",
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "validation.fullName.tooShort")
  .max(100, "validation.fullName.tooLong");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "validation.username.tooShort")
  .max(30, "validation.username.tooLong")
  .regex(/^[A-Za-z0-9_]+$/, "validation.username.invalidFormat");

export const confirmPasswordSchema = z.string();

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    username: usernameSchema,
    email: normalizedEmailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "validation.confirmPassword.mismatch",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
