"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import FormField from "@/components/form/form-field";
import AvatarEditor from "@/features/auth/components/profile/AvatarEditor";
import { useUpdateUserProfile } from "@/features/auth/hooks/use-update-user-profile";
import { userProfileUpdateSchema } from "@/features/auth/schemas/user-profile-schema";
import type { UserProfile } from "@/lib/auth/types";
import { createFormSubmitHandler } from "@/lib/form/create-form-submit-handler";
import { normalizeErrors } from "@/lib/form/normalize-errors";
import { shouldShowFieldErrors } from "@/lib/form/should-show-field-errors";
import { deleteImageByPath, extractStoragePathFromUrl } from "@/lib/storage/delete-image";
import { getAuthErrorTranslationKey } from "@/lib/toast/messages";

type ProfileFormValues = {
  fullName: string;
  displayName: string | null;
  username: string | null;
  pronouns: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

type ProfileEditorFormProps = {
  initialProfile: UserProfile;
  onPreviewChange: (value: ProfileFormValues) => void;
  previewCard?: ReactNode;
};

function normalizeNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export default function ProfileEditorForm({
  initialProfile,
  onPreviewChange,
  previewCard,
}: ProfileEditorFormProps) {
  const t = useTranslations();
  const mutation = useUpdateUserProfile();
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState(initialProfile.avatarUrl);

  const form = useForm({
    defaultValues: {
      fullName: initialProfile.fullName,
      displayName: initialProfile.displayName,
      username: initialProfile.username,
      pronouns: initialProfile.pronouns,
      bio: initialProfile.bio,
      avatarUrl: initialProfile.avatarUrl,
    } satisfies ProfileFormValues,
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: userProfileUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const previousAvatarUrl = persistedAvatarUrl;

        const normalizedPayload: ProfileFormValues = {
          ...value,
          displayName: normalizeNullableText(value.displayName ?? ""),
          username: normalizeNullableText(value.username ?? ""),
          pronouns: normalizeNullableText(value.pronouns ?? ""),
          bio: normalizeNullableText(value.bio ?? ""),
        };

        await mutation.mutateAsync(normalizedPayload);

        setPersistedAvatarUrl(normalizedPayload.avatarUrl ?? null);

        if (
          previousAvatarUrl &&
          normalizedPayload.avatarUrl &&
          previousAvatarUrl !== normalizedPayload.avatarUrl
        ) {
          const previousAvatarPath = extractStoragePathFromUrl(previousAvatarUrl);

          if (previousAvatarPath) {
            await deleteImageByPath(previousAvatarPath).catch(() => {
              return undefined;
            });
          }
        }

        showSuccessToast(t("toast.auth.profileUpdated"));
      } catch (error) {
        const errorCode = error instanceof Error ? error.message : undefined;
        showErrorToast(t(getAuthErrorTranslationKey(errorCode, "toast.auth.profileUpdateFailed")));
      }
    },
  });

  const formValues = form.useStore((state) => state.values);
  const isDirty = form.useStore((state) => state.isDirty);
  const canSubmit = form.useStore((state) => state.canSubmit);
  const submissionAttempts = form.useStore((state) => state.submissionAttempts);

  useEffect(() => {
    form.reset();
    setPersistedAvatarUrl(initialProfile.avatarUrl);
  }, [
    form,
    initialProfile.avatarUrl,
    initialProfile.bio,
    initialProfile.displayName,
    initialProfile.fullName,
    initialProfile.pronouns,
    initialProfile.username,
  ]);

  useEffect(() => {
    onPreviewChange(formValues);
  }, [formValues, onPreviewChange]);

  const disableActions = mutation.isPending;
  const fullNameFallback = formValues.displayName?.trim() || formValues.fullName.trim() || "-";

  const handleAvatarChange = (nextValue: string | null) => {
    form.setFieldValue("avatarUrl", normalizeNullableText(nextValue ?? ""));
  };

  return (
    <form className="space-y-6" noValidate onSubmit={createFormSubmitHandler(form)}>
      <section className="flex flex-col gap-6 lg:flex-row">
        <aside className="order-1 flex flex-col items-center lg:order-2 lg:w-[340px]">
          <h3 className="mb-3 text-sm font-medium text-base-content/80">{t("profile.preview.label")}</h3>
          {previewCard}
        </aside>

        <div className="order-2 flex-1 lg:order-1">
          <AvatarEditor
            value={formValues.avatarUrl}
            fallbackInitial={fullNameFallback}
            label={t("profile.avatar.label")}
            helpText={t("profile.avatar.help")}
            hintText={t("profile.avatar.uploadHint")}
            uploadButtonLabel={t("profile.avatar.uploadButton")}
            uploadingLabel={t("profile.avatar.uploading")}
            altText={t("profile.avatar.alt")}
            invalidTypeMessage={t("profile.avatar.errors.invalidType")}
            fileTooLargeMessage={t("profile.avatar.errors.fileTooLarge")}
            uploadFailedMessage={t("profile.avatar.errors.uploadFailed")}
            uploadSuccessMessage={t("profile.avatar.uploadSuccess")}
            disabled={disableActions}
            onChange={handleAvatarChange}
            onError={(message) => showErrorToast(message)}
            onSuccess={(message) => showSuccessToast(message)}
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form.Field name="fullName" validators={{ onChange: userProfileUpdateSchema.shape.fullName }}>
              {(field) => (
                <FormField
                  label={t("profile.fields.fullName.label")}
                  iconClass="icon-[fluent--person-24-regular]"
                  errors={
                    shouldShowFieldErrors(field.state.meta.isTouched, submissionAttempts)
                      ? normalizeErrors(field.state.meta.errors, t)
                      : []
                  }
                >
                  <input
                    className="flex-1 min-w-0"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("profile.fields.fullName.placeholder")}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="displayName" validators={{ onChange: userProfileUpdateSchema.shape.displayName }}>
              {(field) => (
                <FormField
                  label={t("profile.fields.displayName.label")}
                  iconClass="icon-[fluent--person-tag-24-regular]"
                  errors={
                    shouldShowFieldErrors(field.state.meta.isTouched, submissionAttempts)
                      ? normalizeErrors(field.state.meta.errors, t)
                      : []
                  }
                >
                  <input
                    className="flex-1 min-w-0"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("profile.fields.displayName.placeholder")}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="username" validators={{ onChange: userProfileUpdateSchema.shape.username }}>
              {(field) => (
                <FormField
                  label={t("profile.fields.username.label")}
                  iconClass="icon-[fluent--person-accounts-24-regular]"
                  errors={
                    shouldShowFieldErrors(field.state.meta.isTouched, submissionAttempts)
                      ? normalizeErrors(field.state.meta.errors, t)
                      : []
                  }
                >
                  <input
                    className="flex-1 min-w-0"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("profile.fields.username.placeholder")}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="pronouns" validators={{ onChange: userProfileUpdateSchema.shape.pronouns }}>
              {(field) => (
                <FormField
                  label={t("profile.fields.pronouns.label")}
                  iconClass="icon-[fluent--chat-24-regular]"
                  errors={
                    shouldShowFieldErrors(field.state.meta.isTouched, submissionAttempts)
                      ? normalizeErrors(field.state.meta.errors, t)
                      : []
                  }
                >
                  <input
                    className="flex-1 min-w-0"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("profile.fields.pronouns.placeholder")}
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          <div className="mt-4">
            <form.Field name="bio" validators={{ onChange: userProfileUpdateSchema.shape.bio }}>
              {(field) => (
                <FormField
                  label={t("profile.fields.bio.label")}
                  useInputWrapper={false}
                  errors={
                    shouldShowFieldErrors(field.state.meta.isTouched, submissionAttempts)
                      ? normalizeErrors(field.state.meta.errors, t)
                      : []
                  }
                >
                  <textarea
                    className="textarea textarea-bordered min-h-28 w-full"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t("profile.fields.bio.placeholder")}
                    rows={4}
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                form.reset();
              }}
              disabled={disableActions || !isDirty}
            >
              {t("profile.actions.reset")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={disableActions || !isDirty || !canSubmit}>
              {mutation.isPending ? t("profile.actions.saving") : t("profile.actions.save")}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
