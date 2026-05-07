import { describe, expectTypeOf, it } from "vitest";

import type { ExampleEntity, ExampleEntityInput } from "@/lib/example-entity/types";

type ExpectedExampleEntity = {
  id: string;
  title: string;
  body: string;
  slug: string;
  summary: string;
  status: "draft" | "in_review" | "published" | "archived";
  category: "product" | "engineering" | "marketing" | "operations";
  tags: string[];
  priority: "low" | "medium" | "high" | "urgent";
  ownerName: string;
  dueDate: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  estimatedHours: number | null;
  progressPercent: number;
  attachmentsUrl: string[];
  externalLink: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ExpectedExampleEntityInput = Omit<
  ExpectedExampleEntity,
  "id" | "createdAt" | "updatedAt"
>;

type _ExampleEntityContract = ExampleEntity extends ExpectedExampleEntity
  ? ExpectedExampleEntity extends ExampleEntity
    ? true
    : false
  : false;
type _ExampleEntityInputContract = ExampleEntityInput extends ExpectedExampleEntityInput
  ? ExpectedExampleEntityInput extends ExampleEntityInput
    ? true
    : false
  : false;

const assertEntityContract: _ExampleEntityContract = true;
const assertInputContract: _ExampleEntityInputContract = true;
void assertEntityContract;
void assertInputContract;

describe("ExampleEntity rich contract", () => {
  it("includes required rich fields", () => {
    expectTypeOf<ExampleEntity>().toEqualTypeOf<ExpectedExampleEntity>();
    expectTypeOf<ExampleEntityInput>().toEqualTypeOf<ExpectedExampleEntityInput>();
    expectTypeOf<ExampleEntityInput>().toEqualTypeOf<
      Omit<ExampleEntity, "id" | "createdAt" | "updatedAt">
    >();
  });
});
