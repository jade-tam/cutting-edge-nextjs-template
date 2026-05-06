export type ExampleEntityStatus = "draft" | "in_review" | "published" | "archived";

export type ExampleEntityCategory =
  | "product"
  | "engineering"
  | "marketing"
  | "operations";

export type ExampleEntityPriority = "low" | "medium" | "high" | "urgent";

export type ExampleEntity = {
  id: string;
  title: string;
  body: string;
  slug: string;
  summary: string;
  status: ExampleEntityStatus;
  category: ExampleEntityCategory;
  tags: string[];
  priority: ExampleEntityPriority;
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

export type ExampleEntityInput = Omit<
  ExampleEntity,
  "id" | "createdAt" | "updatedAt"
>;
