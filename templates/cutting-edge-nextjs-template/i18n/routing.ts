import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed", // /vi for Vietnamese, / for English
  localeDetection: false, // don't auto-redirect based on Accept-Language
});
