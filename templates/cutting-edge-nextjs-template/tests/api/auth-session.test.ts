import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockProvider = {
  kind: "firebase" as const,
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  getSession: vi.fn(),
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
};

vi.mock("@/lib/auth/factory", () => ({
  createAuthProvider: () => mockProvider,
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionTokenFromCookie: vi.fn(),
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

describe("auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns account_deactivated on login for inactive profile", async () => {
    const { AuthError, AUTH_ERROR } = await import("@/lib/auth/errors");

    mockProvider.login.mockRejectedValueOnce(
      new AuthError(AUTH_ERROR.ACCOUNT_DEACTIVATED),
    );

    const { POST } = await import("@/app/api/auth/login/route");

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "deactivated@example.com",
          password: "Password1!",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "account_deactivated" });
  });

  it("returns role in auth session payload", async () => {
    const { getSessionTokenFromCookie } = await import("@/lib/auth/session");

    vi.mocked(getSessionTokenFromCookie).mockResolvedValueOnce("token");
    mockProvider.getSession.mockResolvedValueOnce({
      userId: "uid-admin",
      email: "admin@example.com",
      role: "admin",
    });

    const { GET } = await import("@/app/api/auth/session/route");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: {
        userId: "uid-admin",
        email: "admin@example.com",
        role: "admin",
      },
    });
  });

  it("register route forwards username to createUserProfile", async () => {
    mockProvider.register.mockResolvedValueOnce({
      sessionToken: "token-1",
      session: {
        userId: "uid-1",
        email: "user@example.com",
        role: "user",
      },
    });
    mockProvider.createUserProfile.mockResolvedValueOnce({
      userId: "uid-1",
      email: "user@example.com",
      role: "user",
    });

    const { POST } = await import("@/app/api/auth/register/route");

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Ada Lovelace",
          username: "ada_lovelace",
          email: "user@example.com",
          password: "Sup3r!SecurePass",
          confirmPassword: "Sup3r!SecurePass",
        }),
      }),
    );

    expect(mockProvider.register).toHaveBeenCalledWith({
      fullName: "Ada Lovelace",
      username: "ada_lovelace",
      email: "user@example.com",
      password: "Sup3r!SecurePass",
    });
    expect(mockProvider.createUserProfile).toHaveBeenCalledWith({
      userId: "uid-1",
      email: "user@example.com",
      fullName: "Ada Lovelace",
      username: "ada_lovelace",
    });
    expect(response.status).toBe(200);
  });

  it("returns email_already_taken when register email exists", async () => {
    const { AuthError, AUTH_ERROR } = await import("@/lib/auth/errors");

    mockProvider.register.mockRejectedValueOnce(
      new AuthError(AUTH_ERROR.EMAIL_ALREADY_TAKEN),
    );

    const { POST } = await import("@/app/api/auth/register/route");

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Ada Lovelace",
          username: "ada_lovelace",
          email: "user@example.com",
          password: "Sup3r!SecurePass",
          confirmPassword: "Sup3r!SecurePass",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "email_already_taken" });
  });

  it("returns username_already_taken when register username exists", async () => {
    const { AuthError, AUTH_ERROR } = await import("@/lib/auth/errors");

    mockProvider.register.mockRejectedValueOnce(
      new AuthError(AUTH_ERROR.USERNAME_ALREADY_TAKEN),
    );

    const { POST } = await import("@/app/api/auth/register/route");

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Ada Lovelace",
          username: "ada_lovelace",
          email: "user@example.com",
          password: "Sup3r!SecurePass",
          confirmPassword: "Sup3r!SecurePass",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "username_already_taken" });
  });
});
