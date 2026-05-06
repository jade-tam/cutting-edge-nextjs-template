import { z } from "zod";

export const exampleEntityStatusSchema = z.enum([
  "draft",
  "in_review",
  "published",
  "archived",
]);

export const exampleEntityCategorySchema = z.enum([
  "product",
  "engineering",
  "marketing",
  "operations",
]);

export const exampleEntityPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const exampleEntityTitleSchema = z
  .string()
  .min(1, "validation.exampleEntity.title.min")
  .max(120, "validation.exampleEntity.title.max");

export const exampleEntityBodySchema = z
  .string()
  .min(1, "validation.exampleEntity.body.min")
  .max(5000, "validation.exampleEntity.body.max");

export const exampleEntitySlugSchema = z
  .string()
  .min(1, "validation.exampleEntity.slug.min")
  .max(160, "validation.exampleEntity.slug.max");

export const exampleEntitySummarySchema = z
  .string()
  .min(1, "validation.exampleEntity.summary.min")
  .max(280, "validation.exampleEntity.summary.max");

export const exampleEntityOwnerNameSchema = z
  .string()
  .min(1, "validation.exampleEntity.ownerName.min")
  .max(80, "validation.exampleEntity.ownerName.max");

export const exampleEntitySchema = z.object({
  title: exampleEntityTitleSchema,
  body: exampleEntityBodySchema,
  slug: exampleEntitySlugSchema,
  summary: exampleEntitySummarySchema,
  status: exampleEntityStatusSchema,
  category: exampleEntityCategorySchema,
  tags: z
    .array(
      z
        .string()
        .min(1, "validation.exampleEntity.tags.item.min")
        .max(40, "validation.exampleEntity.tags.item.max"),
    )
    .max(20, "validation.exampleEntity.tags.max"),
  priority: exampleEntityPrioritySchema,
  ownerName: z
    .string()
    .min(1, "validation.exampleEntity.ownerName.min")
    .max(80, "validation.exampleEntity.ownerName.max"),
  dueDate: z.string().date("validation.exampleEntity.dueDate.invalid").nullable(),
  isFeatured: z.boolean(),
  publishedAt: z
    .string()
    .datetime({ message: "validation.exampleEntity.publishedAt.invalid" })
    .nullable(),
  estimatedHours: z
    .number()
    .nonnegative("validation.exampleEntity.estimatedHours.min")
    .nullable(),
  progressPercent: z
    .number()
    .int("validation.exampleEntity.progressPercent.integer")
    .min(0, "validation.exampleEntity.progressPercent.min")
    .max(100, "validation.exampleEntity.progressPercent.max"),
  attachmentsUrl: z
    .array(z.string().url("validation.exampleEntity.attachmentsUrl.item.invalid"))
    .max(10, "validation.exampleEntity.attachmentsUrl.max"),
  externalLink: z.string().url("validation.exampleEntity.externalLink.invalid").nullable(),
  notes: z.string().max(2000, "validation.exampleEntity.notes.max"),
});

export type ExampleEntitySchema = z.infer<typeof exampleEntitySchema>;
