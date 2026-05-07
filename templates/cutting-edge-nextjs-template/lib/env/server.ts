import { ZodError } from "zod";

import { serverEnvSchema } from "./schema";

export const isProductionEnvironment = process.env.NODE_ENV === "production";

function parseServerEnv() {
  try {
    return serverEnvSchema.parse({
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
      BING_SITE_VERIFICATION: process.env.BING_SITE_VERIFICATION,
      DATA_PROVIDER: process.env.DATA_PROVIDER,
      AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
      REST_API_BASE_URL: process.env.REST_API_BASE_URL,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      USE_FIREBASE_EMULATOR: process.env.USE_FIREBASE_EMULATOR,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid server environment configuration: ${issues}`);
    }

    throw error;
  }
}

export const serverEnv = parseServerEnv();
