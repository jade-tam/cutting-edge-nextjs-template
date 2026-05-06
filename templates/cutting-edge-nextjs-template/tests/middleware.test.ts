import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));

function createRequest(pathname: string, cookieHeader?: string) {
  const headers = new Headers();

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  return new NextRequest(`http://localhost${pathname}`, { headers });
}

async function loadProxyModule() {
  vi.resetModules();
  return import("../proxy");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("proxy", () => {
  it("redirects unauthenticated users from dashboard routes to /login", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    const { proxy } = await loadProxyModule();
    const response = await proxy(createRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("redirects authenticated user role user away from dashboard to /unauthorized", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          session: {
            userId: "uid-user",
            email: "user@example.com",
            role: "user",
          },
        }),
      }),
    );

    const { proxy } = await loadProxyModule();
    const response = await proxy(createRequest("/dashboard", "dashboard_session=token"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/unauthorized");
  });

  it("allows admin and manager access to dashboard routes", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({
            session: {
              userId: "uid-admin",
              email: "admin@example.com",
              role: "admin",
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({
            session: {
              userId: "uid-manager",
              email: "manager@example.com",
              role: "manager",
            },
          }),
        }),
    );

    const { proxy } = await loadProxyModule();

    const adminResponse = await proxy(
      createRequest("/dashboard", "dashboard_session=admin-token"),
    );
    const managerResponse = await proxy(
      createRequest("/dashboard", "dashboard_session=manager-token"),
    );

    expect(adminResponse.status).not.toBe(307);
    expect(managerResponse.status).not.toBe(307);
  });

  it("allows only admin access to /dashboard/users", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({
            session: {
              userId: "uid-admin",
              email: "admin@example.com",
              role: "admin",
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce({
            session: {
              userId: "uid-manager",
              email: "manager@example.com",
              role: "manager",
            },
          }),
        }),
    );

    const { proxy } = await loadProxyModule();

    const adminResponse = await proxy(
      createRequest("/dashboard/users", "dashboard_session=admin-token"),
    );
    const managerResponse = await proxy(
      createRequest("/dashboard/users", "dashboard_session=manager-token"),
    );

    expect(adminResponse.status).not.toBe(307);
    expect(managerResponse.status).toBe(307);
    expect(managerResponse.headers.get("location")).toContain("/unauthorized");
  });

  it("redirects authenticated admin users from auth routes to /dashboard", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          session: {
            userId: "uid-admin",
            email: "admin@example.com",
            role: "admin",
          },
        }),
      }),
    );

    const { proxy } = await loadProxyModule();
    const response = await proxy(createRequest("/login", "dashboard_session=token"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");
  });

  it("redirects authenticated non-admin users from auth routes to /unauthorized", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          session: {
            userId: "uid-user",
            email: "user@example.com",
            role: "user",
          },
        }),
      }),
    );

    const { proxy } = await loadProxyModule();
    const response = await proxy(createRequest("/login", "dashboard_session=token"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/unauthorized");
  });

  it("does not redirect auth routes when session lookup fails", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ session: null }),
      }),
    );

    const { proxy } = await loadProxyModule();
    const response = await proxy(createRequest("/login", "dashboard_session=token"));

    expect(response.status).toBe(200);
  });

  it("keeps matcher excluding api, trpc, _next, _vercel, and file extensions", async () => {
    vi.stubEnv("DATA_PROVIDER", "rest");
    vi.stubEnv("AUTH_COOKIE_NAME", "dashboard_session");
    vi.stubEnv("REST_API_BASE_URL", "http://localhost:3001/api");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost");

    const { config } = await loadProxyModule();

    expect(config.matcher).toEqual(["/((?!api|trpc|_next|_vercel|.*\\..*).*)"]);
  });
});
