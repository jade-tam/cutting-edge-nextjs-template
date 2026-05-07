import { test, expect } from "@playwright/test";

test.describe("auth redirects smoke", () => {
  test("unauthenticated dashboard access redirects to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("unauthenticated localized dashboard access redirects to localized login", async ({ page }) => {
    await page.goto("/vi/dashboard");

    await expect(page).toHaveURL(/\/vi\/login$/);
  });
});
