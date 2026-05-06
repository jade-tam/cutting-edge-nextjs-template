"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import FormField from "@/components/form/form-field";
import { postForgotPassword } from "@/features/auth/api";
import {
  forgotPasswordEmailSchema,
  forgotPasswordSchema,
} from "@/features/auth/schemas/forgot-password-schema";
import { Link } from "@/i18n/navigation";
import { getAuthErrorTranslationKey } from "@/lib/toast/messages";

export default function ForgotPasswordForm(): JSX.Element {
  const t = useTranslations();

  const translateErrors = (errors: unknown[]): string[] => {
    const translated = errors.flatMap((error) => {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message ?? "")
          : String(error);

      return message
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => {
          if (!part.startsWith("validation.")) {
            return part;
          }

          try {
            return t(part as never);
          } catch {
            return part;
          }
        });
    });

    return [...new Set(translated)];
  };

  const mutation = useMutation({
    mutationFn: postForgotPassword,
    onSuccess: () => {
      showSuccessToast(t("toast.auth.resetSent"));
    },
    onError: (error) => {
      showErrorToast(
        t(getAuthErrorTranslationKey(error.message, "toast.auth.forgotPasswordFailed")),
      );
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      className="card bg-base-100 card-border border-base-300 card-sm overflow-hidden"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="border-base-300 border-b border-dashed">
        <div className="flex items-center gap-2 p-4 text-sm font-medium">
          <span className="icon-[fluent--key-24-regular] size-5 opacity-40" aria-hidden="true" />
          {t("auth.forgotPassword.title")}
        </div>
      </div>

      <div className="card-body gap-4">
        <p className="text-xs opacity-60">{t("auth.forgotPassword.description")}</p>

        <form.Field
          name="email"
          validators={{
            onChange: forgotPasswordEmailSchema,
          }}
        >
          {(field) => (
            <FormField
              label={t("auth.fields.email.label")}
              iconClass="icon-[fluent--mail-24-regular]"
              errors={field.state.meta.isTouched ? translateErrors(field.state.meta.errors) : []}
              showMoreLabel={(count) => t("auth.validation.showMoreErrors", { count })}
              showLessLabel={t("auth.validation.showLessErrors")}
            >
              <input
                className="flex-1 min-w-0"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t("auth.fields.email.placeholder")}
              />
            </FormField>
          )}
        </form.Field>

        <button className="btn btn-primary w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? t("auth.forgotPassword.submitting")
            : t("auth.forgotPassword.submit")}
        </button>

        <Link href="/login" className="btn btn-ghost btn-sm w-full">
          {t("auth.actions.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
