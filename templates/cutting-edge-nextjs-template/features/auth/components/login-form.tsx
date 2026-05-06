"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import FormField from "@/components/form/form-field";
import { postLogin } from "@/features/auth/api";
import PasswordField from "@/features/auth/components/password-field";
import {
  loginPasswordSchema,
  loginSchema,
  normalizedEmailSchema,
} from "@/features/auth/schemas/login-schema";
import { Link, useRouter } from "@/i18n/navigation";
import { createFormSubmitHandler } from "@/lib/form/create-form-submit-handler";
import { normalizeErrors } from "@/lib/form/normalize-errors";
import { getAuthErrorTranslationKey } from "@/lib/toast/messages";

export default function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postLogin,
    onSuccess: async () => {
      showSuccessToast(t("toast.auth.signedIn"));
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/dashboard");
    },
    onError: (error) => {
      showErrorToast(
        t(getAuthErrorTranslationKey(error.message, "toast.auth.signInFailed")),
      );
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      className="card bg-base-100 card-border border-base-300 card-sm overflow-hidden"
      noValidate
      onSubmit={createFormSubmitHandler(form)}
    >
      <div className="border-base-300 border-b border-dashed">
        <div className="flex items-center gap-2 p-4 text-sm font-medium">
          <span className="icon-[fluent--person-24-regular] size-5 opacity-40" aria-hidden="true" />
          {t("auth.login.title")}
        </div>
      </div>

      <div className="card-body gap-4">
        <p className="text-xs opacity-60">{t("auth.login.description")}</p>

        <form.Field
          name="email"
          validators={{
            onChange: normalizedEmailSchema,
          }}
        >
          {(field) => (
            <FormField
              label={t("auth.fields.email.label")}
              iconClass="icon-[fluent--mail-24-regular]"
              errors={field.state.meta.isTouched ? normalizeErrors(field.state.meta.errors, t) : []}
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

        <form.Field
          name="password"
          validators={{
            onChange: loginPasswordSchema,
          }}
        >
          {(field) => (
            <PasswordField
              label={t("auth.fields.password.label")}
              value={field.state.value}
              errors={field.state.meta.isTouched ? normalizeErrors(field.state.meta.errors, t) : []}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("auth.fields.password.placeholder")}
              showLabel={t("auth.fields.password.show")}
              hideLabel={t("auth.fields.password.hide")}
              showMoreErrorsLabel={(count) => t("auth.validation.showMoreErrors", { count })}
              showLessErrorsLabel={t("auth.validation.showLessErrors")}
              strengthLabels={{
                weak: t("auth.validation.passwordStrength.weak"),
                fair: t("auth.validation.passwordStrength.fair"),
                good: t("auth.validation.passwordStrength.good"),
                strong: t("auth.validation.passwordStrength.strong"),
              }}
            />
          )}
        </form.Field>

        <div className="text-right">
          <Link href="/forgot-password" className="link link-primary text-xs">
            {t("auth.actions.forgotPassword")}
          </Link>
        </div>

        <button className="btn btn-primary w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>

        <Link href="/register" className="btn btn-ghost btn-sm w-full">
          {t("auth.actions.orRegister")}
        </Link>
      </div>
    </form>
  );
}
