import { afterEach, describe, expect, it, vi } from "vitest";

import { getSession, getUserProfile } from "../../../features/auth/api";
import type { UserProfile } from "../../../lib/auth/types";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("auth api", () => {
  it("getSession() returns session null on 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSession()).resolves.toEqual({ session: null });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });
  });

  it("getUserProfile() returns profile payload on success", async () => {
    const profile: UserProfile = {
      userId: "user-1",
      email: "user@example.com",
      role: "manager",
      fullName: "Ada Lovelace",
      displayName: "Ada",
      username: "ada_lovelace",
      avatarUrl: null,
      pronouns: null,
      bio: null,
      lastLoginAt: null,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      metadata: null,
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ profile }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getUserProfile()).resolves.toEqual({ profile });
    expect(fetchMock).toHaveBeenCalledWith("/api/user-profile", {
      method: "GET",
      credentials: "include",
    });
  });

  it("getUserProfile() throws error code from failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "user_profile_not_found" }), { status: 404 }),
      ),
    );

    await expect(getUserProfile()).rejects.toThrow("user_profile_not_found");
  });
});
