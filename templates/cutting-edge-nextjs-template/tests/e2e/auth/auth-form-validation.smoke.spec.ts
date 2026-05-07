import { test, expect } from "@playwright/test";

test.describe("auth form validation smoke", () => {
  test("login blocks submit on invalid email", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("ValidPass123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("register blocks submit on weak/short password", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/register$/);
  });

  test("forgot-password blocks submit on invalid email", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel("Email").fill("bad-email");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
