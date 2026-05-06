type TranslationFn = (key: string) => string;

function normalizeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return String(error);
}

export function normalizeErrors(errors: unknown[], t?: TranslationFn): string[] {
  const normalized = errors.flatMap((error) => {
    return normalizeError(error)
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => {
        if (!t || !part.startsWith("validation.")) {
          return part;
        }

        try {
          return t(part);
        } catch {
          return part;
        }
      });
  });

  return [...new Set(normalized)];
}
