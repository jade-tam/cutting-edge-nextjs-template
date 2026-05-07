import { test, expect } from "@playwright/test";

test.describe("public pages navigation", () => {
  test("en homepage links navigate to merged public pages", async ({ page }) => {
    await page.goto("/en");

    const solutionsLink = page.getByRole("main").getByRole("link", { name: "Solutions" });
    const pricingLink = page.getByRole("main").getByRole("link", { name: "Pricing" });
    const contactLink = page.getByRole("main").getByRole("link", { name: "Contact" });

    await expect(solutionsLink).toBeVisible();
    await expect(pricingLink).toBeVisible();
    await expect(contactLink).toBeVisible();

    await solutionsLink.click();
    await expect(page).toHaveURL(/\/(en\/)?solutions$/);
    await expect(page.getByRole("heading", { name: "Solutions" })).toBeVisible();

    await page.goto("/en/pricing");
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();

    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  });

  test("deprecated public routes return 404", async ({ page }) => {
    const aboutResponse = await page.goto("/en/about");
    expect(aboutResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    const blogResponse = await page.goto("/en/blog");
    expect(blogResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
