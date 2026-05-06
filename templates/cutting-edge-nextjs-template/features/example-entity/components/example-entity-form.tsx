"use client";

import "cally";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useTranslations } from "next-intl";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast";

import DatePickerField from "@/components/form/date-picker-field";
import FormField from "@/components/form/form-field";
import { useCreateExampleEntity } from "@/features/example-entity/hooks/use-create-example-entity";
import { useUpdateExampleEntity } from "@/features/example-entity/hooks/use-update-example-entity";
import {
  exampleEntityBodySchema,
  exampleEntityOwnerNameSchema,
  exampleEntitySchema,
  exampleEntitySlugSchema,
  exampleEntitySummarySchema,
  exampleEntityTitleSchema,
} from "@/features/example-entity/schemas/entity-schema";
import { useRouter } from "@/i18n/navigation";
import { createFormSubmitHandler } from "@/lib/form/create-form-submit-handler";
import { normalizeErrors } from "@/lib/form/normalize-errors";
import { shouldShowFieldErrors } from "@/lib/form/should-show-field-errors";
import type { ExampleEntityInput } from "@/lib/example-entity/types";
import { getExampleEntityErrorTranslationKey } from "@/lib/toast/messages";

type ExampleEntityFormProps =
  | {
      mode: "create";
      id?: never;
      defaultValues?: never;
    }
  | {
      mode: "edit";
      id: string;
      defaultValues: Partial<ExampleEntityInput>;
    };

export default function ExampleEntityForm(props: ExampleEntityFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const createMutation = useCreateExampleEntity();
  const updateMutation = useUpdateExampleEntity();

  const isPending =
    props.mode === "create" ? createMutation.isPending : updateMutation.isPending;

  const form = useForm({
    defaultValues:
      props.mode === "create"
        ? {
            title: "",
            body: "",
            slug: "",
            summary: "",
            status: "draft",
            category: "product",
            tags: [],
            priority: "medium",
            ownerName: "",
            dueDate: null,
            isFeatured: false,
            publishedAt: null,
            estimatedHours: null,
            progressPercent: 0,
            attachmentsUrl: [],
            externalLink: null,
            notes: "",
          }
        : {
            title: props.defaultValues.title ?? "",
            body: props.defaultValues.body ?? "",
            slug: props.defaultValues.slug ?? "",
            summary: props.defaultValues.summary ?? "",
            status: props.defaultValues.status ?? "draft",
            category: props.defaultValues.category ?? "product",
            tags: props.defaultValues.tags ?? [],
            priority: props.defaultValues.priority ?? "medium",
            ownerName: props.defaultValues.ownerName ?? "",
            dueDate: props.defaultValues.dueDate ?? null,
            isFeatured: props.defaultValues.isFeatured ?? false,
            publishedAt: props.defaultValues.publishedAt ?? null,
            estimatedHours: props.defaultValues.estimatedHours ?? null,
            progressPercent: props.defaultValues.progressPercent ?? 0,
            attachmentsUrl: props.defaultValues.attachmentsUrl ?? [],
            externalLink: props.defaultValues.externalLink ?? null,
            notes: props.defaultValues.notes ?? "",
          },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: exampleEntitySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (props.mode === "create") {
          const created = await createMutation.mutateAsync(value);
          showSuccessToast(t("toast.exampleEntity.created"));
          router.push(`/dashboard/example-entities/${created.id}`);
          return;
        }

        await updateMutation.mutateAsync({
          id: props.id,
          payload: value,
        });
        showSuccessToast(t("toast.exampleEntity.updated"));
        router.push(`/dashboard/example-entities/${props.id}`);
      } catch (error) {
        const errorCode = error instanceof Error ? error.message : undefined;
        showErrorToast(
          t(getExampleEntityErrorTranslationKey(errorCode, "toast.exampleEntity.saveFailed")),
        );
      }
    },
  });

  const titleField = (
    <form.Field
      name="title"
      validators={{
        onChange: exampleEntityTitleSchema,
      }}
    >
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.title.label")}
          iconClass="icon-[fluent--text-case-title-24-regular]"
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <input
            className="flex-1 min-w-0"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={t("exampleEntity.form.fields.title.placeholder")}
          />
        </FormField>
      )}
    </form.Field>
  );

  const slugField = (
    <form.Field
      name="slug"
      validators={{
        onChange: exampleEntitySlugSchema,
      }}
    >
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.slug.label")}
          iconClass="icon-[fluent--tag-24-regular]"
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <input
            className="flex-1 min-w-0"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={t("exampleEntity.form.fields.slug.placeholder")}
            readOnly={props.mode === "edit"}
          />
        </FormField>
      )}
    </form.Field>
  );

  const summaryField = (
    <form.Field
      name="summary"
      validators={{
        onChange: exampleEntitySummarySchema,
      }}
    >
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.summary.label")}
          useInputWrapper={false}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <textarea
            className="textarea textarea-bordered min-h-28 w-full"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={t("exampleEntity.form.fields.summary.placeholder")}
            rows={3}
          />
        </FormField>
      )}
    </form.Field>
  );

  const bodyField = (
    <form.Field
      name="body"
      validators={{
        onChange: exampleEntityBodySchema,
      }}
    >
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.body.label")}
          useInputWrapper={false}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <textarea
            className="textarea textarea-bordered min-h-28 w-full"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={t("exampleEntity.form.fields.body.placeholder")}
            rows={6}
          />
        </FormField>
      )}
    </form.Field>
  );

  const statusField = (
    <form.Field name="status">
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.status.label")}
          useInputWrapper={false}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <select
            className="select select-bordered w-full"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value as ExampleEntityInput["status"])}
          >
            <option value="draft">{t("exampleEntity.form.fields.status.options.draft")}</option>
            <option value="in_review">{t("exampleEntity.form.fields.status.options.in_review")}</option>
            <option value="published">{t("exampleEntity.form.fields.status.options.published")}</option>
            <option value="archived">{t("exampleEntity.form.fields.status.options.archived")}</option>
          </select>
        </FormField>
      )}
    </form.Field>
  );

  const categoryField = (
    <form.Field name="category">
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.category.label")}
          useInputWrapper={false}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <select
            className="select select-bordered w-full"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) =>
              field.handleChange(event.target.value as ExampleEntityInput["category"])
            }
          >
            <option value="product">{t("exampleEntity.form.fields.category.options.product")}</option>
            <option value="engineering">{t("exampleEntity.form.fields.category.options.engineering")}</option>
            <option value="marketing">{t("exampleEntity.form.fields.category.options.marketing")}</option>
            <option value="operations">{t("exampleEntity.form.fields.category.options.operations")}</option>
          </select>
        </FormField>
      )}
    </form.Field>
  );

  const priorityField = (
    <form.Field name="priority">
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.priority.label")}
          useInputWrapper={false}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <select
            className="select select-bordered w-full"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) =>
              field.handleChange(event.target.value as ExampleEntityInput["priority"])
            }
          >
            <option value="low">{t("exampleEntity.form.fields.priority.options.low")}</option>
            <option value="medium">{t("exampleEntity.form.fields.priority.options.medium")}</option>
            <option value="high">{t("exampleEntity.form.fields.priority.options.high")}</option>
            <option value="urgent">{t("exampleEntity.form.fields.priority.options.urgent")}</option>
          </select>
        </FormField>
      )}
    </form.Field>
  );

  const ownerField = (
    <form.Field
      name="ownerName"
      validators={{
        onChange: exampleEntityOwnerNameSchema,
      }}
    >
      {(field) => (
        <FormField
          label={t("exampleEntity.form.fields.ownerName.label")}
          iconClass="icon-[fluent--person-24-regular]"
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
        >
          <input
            className="flex-1 min-w-0"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            placeholder={t("exampleEntity.form.fields.ownerName.placeholder")}
          />
        </FormField>
      )}
    </form.Field>
  );

  const dueDateField = (
    <form.Field name="dueDate">
      {(field) => (
        <DatePickerField
          label={t("exampleEntity.form.fields.dueDate.label")}
          value={field.state.value}
          onChange={(nextValue) => field.handleChange(nextValue)}
          onBlur={field.handleBlur}
          errors={
            shouldShowFieldErrors(field.state.meta.isTouched, form.state.submissionAttempts)
              ? normalizeErrors(field.state.meta.errors, t)
              : []
          }
          placeholder={t("exampleEntity.form.fields.dueDate.label")}
          previousMonthLabel={t("exampleEntity.form.fields.dueDate.previousMonthLabel")}
          nextMonthLabel={t("exampleEntity.form.fields.dueDate.nextMonthLabel")}
        />
      )}
    </form.Field>
  );

  return (
    <form noValidate onSubmit={createFormSubmitHandler(form)}>
      <div className="grid gap-2 xl:grid-cols-12">
        <div className="space-y-2 xl:col-span-8">
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h3 className="mb-4 text-lg font-semibold">{t("exampleEntity.form.sections.general")}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {titleField}
              {slugField}
            </div>
            <div className="mt-4 space-y-4">
              {summaryField}
              {bodyField}
            </div>
          </section>

          <div className="grid gap-2 md:grid-cols-2">
            <section className="rounded-box border border-base-300 bg-base-100 p-4 space-y-4">
              <h3 className="mb-4 text-lg font-semibold">{t("exampleEntity.form.sections.assignment")}</h3>
              {ownerField}
              {dueDateField}
            </section>

            <section className="rounded-box border border-base-300 bg-base-100 p-4 space-y-4">
              <h3 className="mb-4 text-lg font-semibold">{t("exampleEntity.form.sections.metadata")}</h3>
              {statusField}
              {categoryField}
              {priorityField}
            </section>
          </div>
        </div>

        <aside className="space-y-2 xl:col-span-4">
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h3 className="mb-4 text-lg font-semibold">{t("exampleEntity.form.sections.featured")}</h3>
            <form.Field name="isFeatured">
              {(field) => {
                const errors = shouldShowFieldErrors(
                  field.state.meta.isTouched,
                  form.state.submissionAttempts,
                )
                  ? normalizeErrors(field.state.meta.errors, t)
                  : [];

                return (
                  <div className="flex flex-col gap-1">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        className="checkbox checkbox-primary"
                        type="checkbox"
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.checked)}
                      />
                      <span className="text-sm">{t("exampleEntity.form.fields.isFeatured.label")}</span>
                    </label>
                    {errors.length > 0 ? <div className="text-error text-sm">{errors[0]}</div> : null}
                  </div>
                );
              }}
            </form.Field>
          </section>

          <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
            {isPending
              ? t("exampleEntity.form.saving")
              : props.mode === "create"
                ? t("exampleEntity.form.submitCreate")
                : t("exampleEntity.form.submitEdit")}
          </button>
        </aside>
      </div>
    </form>
  );
}
