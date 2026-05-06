import { expect, test } from "@playwright/test";

import type { Page } from "@playwright/test";

function buildUsername(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function buildEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function registerFreshUserSession(page: Page) {
  const email = buildEmail("e2e-auth-role");
  const password = "ValidPass123!";

  const registerResponse = await page.request.post("/api/auth/register", {
    data: {
      fullName: "E2E Role User",
      username: buildUsername("e2e_role"),
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

async function loginAsSeededRole(
  page: Page,
  role: "admin" | "manager" | "user",
) {
  const credentials = {
    admin: { email: "admin@example.com", password: "ValidPass123!" },
    manager: { email: "manager@example.com", password: "ValidPass123!" },
    user: { email: "user@example.com", password: "ValidPass123!" },
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

async function loginAsSeededDashboardRole(
  page: Page,
  role: "admin" | "manager",
) {
  await loginAsSeededRole(page, role);
}

async function loginAsFreshUserRole(page: Page) {
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
}

test.describe("auth role-based dashboard access", () => {
  test.describe.configure({ mode: "serial" });
  test("user role cannot access dashboard", async ({ page }) => {
    await loginAsFreshUserRole(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });

  test("admin role can access dashboard", async ({ page }) => {
    await loginAsSeededDashboardRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("manager role can access dashboard", async ({ page }) => {
    await loginAsSeededDashboardRole(page, "manager");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
