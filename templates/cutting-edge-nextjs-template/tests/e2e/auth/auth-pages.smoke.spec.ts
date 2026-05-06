import { test, expect } from "@playwright/test";

test.describe("auth pages smoke", () => {
  test("login page renders essential fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Welcome back. Enter your credentials to continue.")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("register page renders essential fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByText("Create your account to start using the dashboard.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("forgot-password page renders essential fields", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByText("Forgot password")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });
});
