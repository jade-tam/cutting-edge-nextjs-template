import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type MessageTree = Record<string, unknown>;

function readLocale(locale: "en" | "vi"): MessageTree {
  const localePath = path.join(process.cwd(), `messages/${locale}.json`);
  return JSON.parse(fs.readFileSync(localePath, "utf8")) as MessageTree;
}

function getByPath(tree: MessageTree, keyPath: string): unknown {
  return keyPath
    .split(".")
    .reduce<unknown>((acc, segment) => {
      if (typeof acc !== "object" || acc === null || !(segment in acc)) {
        return undefined;
      }

      return (acc as Record<string, unknown>)[segment];
    }, tree);
}

const requiredExampleEntityRichKeys = [
  "exampleEntity.form.fields.tags.label",
  "exampleEntity.form.fields.tags.placeholder",
  "exampleEntity.form.fields.tags.hint",
  "exampleEntity.form.fields.publishedAt.label",
  "exampleEntity.form.fields.estimatedHours.label",
  "exampleEntity.form.fields.progressPercent.label",
  "exampleEntity.form.fields.attachmentsUrl.label",
  "exampleEntity.form.fields.attachmentsUrl.placeholder",
  "exampleEntity.form.fields.externalLink.label",
  "exampleEntity.form.fields.externalLink.placeholder",
  "exampleEntity.form.fields.notes.label",
  "exampleEntity.form.fields.notes.placeholder",
  "exampleEntity.table.toolbar.searchLabel",
  "exampleEntity.table.toolbar.searchPlaceholder",
  "table.rowsPerPage",
  "table.previousPage",
  "table.nextPage",
  "table.pageStatus",
  "table.selectedCount",
  "table.selectAllRows",
  "table.selectRow",
  "table.sortAsc",
  "table.sortDesc",
  "table.sortClear",
  "exampleEntity.detail.actions.back",
  "exampleEntity.detail.featured",
  "exampleEntity.detail.owner",
  "exampleEntity.detail.slug",
  "exampleEntity.detail.progressPercent",
  "exampleEntity.detail.estimatedHours",
  "exampleEntity.detail.createdAt",
  "exampleEntity.detail.updatedAtLabel",
  "exampleEntity.detail.dueDate",
  "exampleEntity.detail.publishedAt",
  "exampleEntity.detail.tags",
  "exampleEntity.detail.bodyLabel",
  "exampleEntity.detail.notes",
  "exampleEntity.detail.externalLink",
  "exampleEntity.detail.attachments",
  "exampleEntity.detail.emptyValue",
  "exampleEntity.detail.noTags",
  "exampleEntity.detail.noNotes",
  "exampleEntity.detail.noExternalLink",
  "exampleEntity.detail.noAttachments",
  "exampleEntity.detail.deleteModal.title",
  "exampleEntity.detail.deleteModal.description",
  "exampleEntity.detail.deleteModal.cancel",
  "exampleEntity.detail.deleteModal.confirm",
  "exampleEntity.detail.deleteModal.deleting",
  "exampleEntity.detail.deleteModal.close",
] as const;

const enMessages = readLocale("en");
const viMessages = readLocale("vi");

function expectKeyInBothLocales(keyPath: string) {
  expect(getByPath(enMessages, keyPath)).not.toBeUndefined();
  expect(getByPath(viMessages, keyPath)).not.toBeUndefined();
}

function expectSameValueTypeAcrossLocales(keyPath: string) {
  const enValue = getByPath(enMessages, keyPath);
  const viValue = getByPath(viMessages, keyPath);

  expect(typeof enValue).toBe(typeof viValue);
}

function expectMessageFormatPlaceholderParity(keyPath: string) {
  const enValue = getByPath(enMessages, keyPath);
  const viValue = getByPath(viMessages, keyPath);

  expect(typeof enValue).toBe("string");
  expect(typeof viValue).toBe("string");

  const extractPlaceholders = (value: string) =>
    new Set(Array.from(value.matchAll(/\{([^}]+)\}/g), (match) => match[1]));

  expect(extractPlaceholders(enValue as string)).toEqual(
    extractPlaceholders(viValue as string),
  );
}


const assertions = [
  {
    file: "features/auth/components/login-form.tsx",
    forbidden: [
      "Sign in",
      "Email",
      "Password",
      "At least 12 characters",
      "Signing in...",
    ],
  },
  {
    file: "features/auth/components/register-form.tsx",
    forbidden: [
      "Create account",
      "Full name",
      "Username",
      "Email",
      "Password",
      "Creating account...",
    ],
  },
  {
    file: "features/auth/components/forgot-password-form.tsx",
    forbidden: ["Forgot password", "Email", "Submitting...", "Send reset link"],
  },
  {
    file: "features/example-entity/components/example-entity-form.tsx",
    forbidden: [
      "Create Example Entity",
      "Edit Example Entity",
      "Title",
      "Body",
      "Saving...",
      "Save changes",
    ],
  },
  {
    file: "features/example-entity/components/example-entities-table.tsx",
    forbidden: [
      "Loading example entities...",
      "No example entities yet.",
      "Actions",
      "View",
      "Edit",
      "Delete",
      "Cancel",
      "Deleting...",
    ],
  },
  {
    file: "features/example-entity/components/example-entity-detail.tsx",
    forbidden: [
      "Loading example entity...",
      "Example entity not found.",
      "Updated:",
      "Edit",
      "Delete",
      "Deleting...",
      "Delete this example entity? This action cannot be undone.",
    ],
  },
  {
    file: "features/example-entity/components/example-entity-edit-screen.tsx",
    forbidden: ["Loading example entity...", "Example entity not found."],
  },
  {
    file: "features/dashboard/components/shell/DashboardShell.tsx",
    forbidden: ["Menu", "Dashboard", "Back to site", "Sign out", "Signing out..."],
  },
] as const;

describe("component copy uses i18n keys", () => {
  for (const { file, forbidden } of assertions) {
    it(`${file} should not contain hardcoded English UI copy`, () => {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");

      for (const text of forbidden) {
        expect(source).not.toContain(`"${text}"`);
        expect(source).not.toContain(`'${text}'`);
        expect(source).not.toContain(`\`${text}\``);
      }
    });
  }
});

describe("example entity rich i18n coverage", () => {
  it("contains required rich example-entity and table shortcut keys in both locales", () => {
    for (const keyPath of requiredExampleEntityRichKeys) {
      expectKeyInBothLocales(keyPath);
      expectSameValueTypeAcrossLocales(keyPath);
    }
  });

  it("keeps interpolation placeholder parity for table toolbar messages", () => {
    const keysWithInterpolations = [
      "table.pageStatus",
      "table.selectedCount",
      "table.selectRow",
      "table.sortAsc",
      "table.sortDesc",
      "table.sortClear",
    ] as const;

    for (const keyPath of keysWithInterpolations) {
      expectMessageFormatPlaceholderParity(keyPath);
    }
  });
});
