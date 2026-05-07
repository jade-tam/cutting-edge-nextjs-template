import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

async function loginAsSeededRole(
  page: Page,
  role: "admin" | "manager",
) {
  await page.request.post("/api/auth/logout");

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

  if (!loginResponse.ok()) {
    const body = await loginResponse.json().catch(() => null);
    throw new Error(
      `Seeded login failed for ${credentials.email} with status ${loginResponse.status()}: ${JSON.stringify(body)}`,
    );
  }

  await expect(page).not.toHaveURL(/\/login$/);
}

test.describe("auth admin user management access", () => {
  test.describe.configure({ mode: "serial" });

  test("manager cannot access users management page", async ({ page }) => {
    await loginAsSeededRole(page, "manager");
    await page.goto("/dashboard/users");
    await expect(page).toHaveURL(/\/(vi\/)?unauthorized$/);
  });

  test("admin can access users management page", async ({ page }) => {
    await loginAsSeededRole(page, "admin");

    const sessionResponse = await page.request.get("/api/auth/session");
    const sessionBody = await sessionResponse.json().catch(() => null) as {
      session?: { role?: string };
    } | null;

    expect(sessionResponse.ok()).toBe(true);
    expect(sessionBody?.session?.role).toBe("admin");

    await page.goto("/dashboard/users");
    await expect(page).toHaveURL(/\/(vi\/)?dashboard\/users$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
