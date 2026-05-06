import { z } from "zod";

const seoServerEnvSchema = {
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  BING_SITE_VERIFICATION: z.string().optional(),
};

const restServerEnvSchema = z.object({
  ...seoServerEnvSchema,
  DATA_PROVIDER: z.literal("rest"),
  AUTH_COOKIE_NAME: z.string().min(1),
  REST_API_BASE_URL: z.string().url(),
  FIREBASE_API_KEY: z.string().optional(),
  FIREBASE_AUTH_DOMAIN: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_APP_ID: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  USE_FIREBASE_EMULATOR: z.enum(["true", "false"]).optional(),
});

const firebaseServerEnvSchema = z.object({
  ...seoServerEnvSchema,
  DATA_PROVIDER: z.literal("firebase"),
  AUTH_COOKIE_NAME: z.string().min(1),
  REST_API_BASE_URL: z.string().optional(),
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_APP_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  USE_FIREBASE_EMULATOR: z.enum(["true", "false"]).optional(),
});

export const serverEnvSchema = z.discriminatedUnion("DATA_PROVIDER", [
  restServerEnvSchema,
  firebaseServerEnvSchema,
]);

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});
