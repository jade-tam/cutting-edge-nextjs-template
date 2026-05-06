import { expect, test } from "@playwright/test";

type SessionBody = {
  session?: {
    userId: string;
    email: string;
  };
  error?: string;
};

function buildUsername(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

test.describe("auth flow integration", () => {
  test("register returns session and created account logs in then hits unauthorized for user role", async ({
    page,
    request,
  }) => {
    const email = `e2e-auth-${Date.now()}@example.com`;
    const password = "ValidPass123!";
    const fullName = "E2E Auth User";

    const username = buildUsername("e2e_auth");
    const registerResponse = await request.post("/api/auth/register", {
      data: { fullName, username, email, password, confirmPassword: password },
    });

    const registerBody = (await registerResponse.json()) as SessionBody;

    if (!registerResponse.ok()) {
      throw new Error(
        `Register failed with status ${registerResponse.status()}: ${JSON.stringify(registerBody)}. ` +
          "If using Firebase, verify Email/Password auth is enabled and Firebase web config values are correct.",
      );
    }

    expect(registerBody.session?.email).toBe(email.toLowerCase());
    expect(registerBody.session?.userId).toBeTruthy();

    const logoutResponse = await request.post("/api/auth/logout");
    expect(logoutResponse.ok()).toBeTruthy();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/unauthorized$/, { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Access denied" }),
    ).toBeVisible();
  });

  test("login API returns invalid_credentials for wrong password", async ({
    request,
  }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "nonexistent@example.com",
        password: "WrongPassword123!",
      },
    });

    const loginBody = (await loginResponse.json()) as SessionBody;

    expect(loginResponse.status()).toBe(401);
    expect(loginBody.error).toBe("invalid_credentials");
  });

  // Note: true cleanup (deleting created Firebase users) requires either
  // a server-side test-only admin endpoint (Firebase Admin SDK) or emulator reset.
  // For now we use unique emails so tests remain re-runnable.
});
