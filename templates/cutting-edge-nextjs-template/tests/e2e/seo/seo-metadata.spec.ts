import { expect, test } from "@playwright/test";

test.describe("seo metadata", () => {
  test("public home page includes canonical, hreflang, og and twitter metadata", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.+/);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonicalHref).toBeTruthy();
    expect(canonicalHref).toMatch(/^https?:\/\//);

    const hreflangEn = await page
      .locator('link[rel="alternate"][hreflang="en"]')
      .getAttribute("href");
    const hreflangVi = await page
      .locator('link[rel="alternate"][hreflang="vi"]')
      .getAttribute("href");
    const hreflangDefault = await page
      .locator('link[rel="alternate"][hreflang="x-default"]')
      .getAttribute("href");

    expect(hreflangEn).toBeTruthy();
    expect(hreflangVi).toBeTruthy();
    expect(hreflangDefault).toBeTruthy();

    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .getAttribute("content");

    expect(ogImage).toMatch(/^https?:\/\//);
    expect(twitterImage).toMatch(/^https?:\/\//);

    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1);
  });

  test("dashboard page does not appear in sitemap", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);

    const sitemapContent = await response.text();
    expect(sitemapContent).not.toContain("/dashboard");
  });
});
