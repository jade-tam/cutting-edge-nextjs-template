import { expect, test, type Page } from "@playwright/test";

function buildUsername(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function buildEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerFreshUserSession(page: Page) {
  const email = buildEmail("e2e-example-entity");
  const password = "ValidPass123!";

  const registerResponse = await page.request.post("/api/auth/register", {
    data: {
      fullName: "E2E Example User",
      username: buildUsername("e2e_ex"),
      email,
      password,
      confirmPassword: password,
    },
  });

  if (!registerResponse.ok()) {
    const body = await registerResponse.json().catch(() => null);
    throw new Error(
      `Fresh user register failed with status ${registerResponse.status()}: ${JSON.stringify(body)}`,
    );
  }

  return { email, password };
}

async function loginAsRole(
  page: Page,
  role: "admin" | "manager" | "user",
) {
  if (role === "user") {
    const credentials = await registerFreshUserSession(page);

    await page.request.post("/api/auth/logout");
    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password", { exact: true }).fill(credentials.password);

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Sign in" }).click();
    const loginResponse = await loginResponsePromise;

    if (!loginResponse.ok()) {
      const body = await loginResponse.json().catch(() => null);
      throw new Error(
        `Fresh user login failed with status ${loginResponse.status()}: ${JSON.stringify(body)}`,
      );
    }

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/unauthorized$/);
    return;
  }

  const credentials = {
    admin: { email: "admin@example.com", password: "ValidPass123!" },
    manager: { email: "manager@example.com", password: "ValidPass123!" },
  }[role];

  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  const loginResponse = await loginResponsePromise;

  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = (await loginResponse.json().catch(() => null)) as
    | { session?: { role?: "admin" | "manager" | "user" } }
    | null;

  expect(loginBody?.session?.role).toBe(role);
  await expect(page).not.toHaveURL(/\/login$/);
}

type ExampleEntityBody = {
  id: string;
  title: string;
  body: string;
};

const CRUD_REQUEST_TIMEOUT_MS = 10000;
const FIRESTORE_SETUP_HINT =
  "If using Firebase, verify Firestore is enabled and has write access for this project.";

function buildValidEntityInput(title: string, body: string) {
  const now = Date.now();

  return {
    title,
    body,
    slug: `entity-${now}-${Math.random().toString(36).slice(2, 8)}`,
    summary: `Summary for ${title}`,
    status: "draft" as const,
    category: "product" as const,
    tags: ["e2e"],
    priority: "medium" as const,
    ownerName: "E2E Owner",
    dueDate: null,
    isFeatured: false,
    publishedAt: null,
    estimatedHours: 2,
    progressPercent: 0,
    attachmentsUrl: [],
    externalLink: null,
    notes: "",
  };
}

async function createEntityViaApi(page: Page, title: string, body: string) {
  const response = await page.request.post("/api/example-entities", {
    data: buildValidEntityInput(title, body),
    timeout: CRUD_REQUEST_TIMEOUT_MS,
  });

  const responseBody = (await response.json()) as ExampleEntityBody | { error?: string };

  if (!response.ok() || !("id" in responseBody)) {
    throw new Error(
      `Create example entity failed with status ${response.status()}: ${JSON.stringify(responseBody)}. ${FIRESTORE_SETUP_HINT}`,
    );
  }

  return responseBody;
}

test.describe("example entity CRUD integration", () => {
  test.describe.configure({ mode: "serial" });

  test("user role gets permission denied on create example entity", async ({
    page,
  }) => {
    await loginAsRole(page, "user");

    const response = await page.request.post("/api/example-entities", {
      data: buildValidEntityInput(`Denied ${Date.now()}`, `Denied body ${Date.now()}`),
    });

    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: "permission_denied" }),
    );
  });

  test("admin role can create example entity", async ({ page }) => {
    await loginAsRole(page, "admin");

    const response = await page.request.post("/api/example-entities", {
      data: buildValidEntityInput(`Admin Create ${Date.now()}`, "Allowed"),
    });

    if (!response.ok()) {
      const body = await response.json().catch(() => null);
      throw new Error(
        `Admin create failed with status ${response.status()}: ${JSON.stringify(body)}`,
      );
    }
  });

  test("manager role can create example entity", async ({ page }) => {
    await loginAsRole(page, "manager");

    const response = await page.request.post("/api/example-entities", {
      data: buildValidEntityInput(`Manager Create ${Date.now()}`, "Allowed"),
    });

    if (!response.ok()) {
      const body = await response.json().catch(() => null);
      throw new Error(
        `Manager create failed with status ${response.status()}: ${JSON.stringify(body)}`,
      );
    }
  });

  test("deactivated user is rejected by login", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "deactivated@example.com",
        password: "ValidPass123!",
      },
    });

    expect(loginResponse.status()).toBe(403);
    await expect(loginResponse.json()).resolves.toEqual({
      error: "account_deactivated",
    });
  });

  test("create works and redirects to detail page", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const title = `Entity Create ${Date.now()}`;
    const body = `Entity body create ${Date.now()}`;

    await page.goto("/dashboard/example-entities/new");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Slug").fill(`entity-create-${Date.now()}`);
    await page.getByLabel("Summary").fill(`Summary ${Date.now()}`);
    await page.getByLabel("Owner name").fill("E2E Admin");
    await page.getByLabel("Body").fill(body);

    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/dashboard\/example-entities\/(?!new$)[^/]+$/, {
      timeout: CRUD_REQUEST_TIMEOUT_MS,
    });

    await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(body)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(body)).toBeVisible();
  });

  test("read works from list to detail", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const title = `Entity Read ${Date.now()}`;
    const body = `Entity body read ${Date.now()}`;
    const created = await createEntityViaApi(page, title, body);

    await page.goto("/dashboard/example-entities");
    await page.getByRole("searchbox", { name: "Search entities" }).fill(title);

    const escapedTitleForQuery = title
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\+");

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/example-entities\\?.*q=${escapedTitleForQuery}`),
    );

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    await row.getByRole("link", { name: "View" }).click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/example-entities/${created.id}$`));
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(body)).toBeVisible();
  });

  test("update works from edit screen", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const title = `Entity Update ${Date.now()}`;
    const body = `Entity body update ${Date.now()}`;
    const created = await createEntityViaApi(page, title, body);

    const updatedTitle = `${title} Updated`;
    const updatedBody = `${body} Updated`;

    await page.goto(`/dashboard/example-entities/${created.id}/edit`);
    await page.getByLabel("Title").fill(updatedTitle);
    await page.getByLabel("Body").fill(updatedBody);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/example-entities/${created.id}$`));
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
    await expect(page.getByText(updatedBody)).toBeVisible();
  });

  test("delete works from list modal flow", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const title = `Entity Delete List ${Date.now()}`;
    const body = `Entity body delete list ${Date.now()}`;
    await createEntityViaApi(page, title, body);

    await page.goto("/dashboard/example-entities");
    await page.getByRole("searchbox", { name: "Search entities" }).fill(title);

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Delete" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Delete example entity?" })).toBeVisible();
    await dialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.locator("tr", { hasText: title })).toHaveCount(0);
  });

  test("delete works from detail confirm flow", async ({ page }) => {
    await loginAsRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

    const title = `Entity Delete Detail ${Date.now()}`;
    const body = `Entity body delete detail ${Date.now()}`;
    const created = await createEntityViaApi(page, title, body);

    await page.goto(`/dashboard/example-entities/${created.id}`);

    await page.getByRole("button", { name: "Delete" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Delete example entity?" })).toBeVisible();
    await dialog.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/dashboard\/example-entities$/, {
      timeout: 10000,
    });
    await expect(page.locator("tr", { hasText: title })).toHaveCount(0);
  });
});
