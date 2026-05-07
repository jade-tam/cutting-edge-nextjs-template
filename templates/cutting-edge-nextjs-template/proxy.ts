import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { serverEnv } from "./lib/env/server";

const intlMiddleware = createMiddleware(routing);
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const LOCALES = new Set<string>(routing.locales);
const DASHBOARD_ALLOWED_ROLES = new Set(["admin", "manager"]);
const USERS_DASHBOARD_ROUTE = "/dashboard/users";
const USERS_DASHBOARD_ALLOWED_ROLES = new Set(["admin"]);

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { localePrefix: "", routePath: "/" };
  }

  const [firstSegment] = segments;
  if (!firstSegment || !LOCALES.has(firstSegment)) {
    return { localePrefix: "", routePath: pathname };
  }

  const remainder = segments.slice(1).join("/");
  return {
    localePrefix: `/${firstSegment}`,
    routePath: remainder ? `/${remainder}` : "/",
  };
}

function withLocalePrefix(localePrefix: string, routePath: string) {
  return `${localePrefix}${routePath}`;
}

async function loadSessionFromCookie(
  sessionCookie: string,
  requestOrigin: string,
) {
  const sessionUrl = new URL("/api/auth/session", requestOrigin);

  const response = await fetch(sessionUrl, {
    method: "GET",
    headers: {
      cookie: `${serverEnv.AUTH_COOKIE_NAME}=${sessionCookie}`,
    },
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { session?: { role?: string } }
    | null;

  return json?.session ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { localePrefix, routePath } = stripLocalePrefix(pathname);

  const sessionCookie = request.cookies.get(serverEnv.AUTH_COOKIE_NAME)?.value;
  const isDashboardRoute = routePath === "/dashboard" || routePath.startsWith("/dashboard/");
  const isAuthRoute = AUTH_ROUTES.includes(routePath);

  if (isDashboardRoute && !sessionCookie) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocalePrefix(localePrefix, "/login");
    return NextResponse.redirect(redirectUrl);
  }

  if (isDashboardRoute && sessionCookie) {
    const session = await loadSessionFromCookie(sessionCookie, request.nextUrl.origin);

    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = withLocalePrefix(localePrefix, "/login");
      return NextResponse.redirect(redirectUrl);
    }

    const role = session.role ?? "";
    const isUsersDashboardRoute = routePath === USERS_DASHBOARD_ROUTE;
    const hasAccess = isUsersDashboardRoute
      ? USERS_DASHBOARD_ALLOWED_ROLES.has(role)
      : DASHBOARD_ALLOWED_ROLES.has(role);

    if (!hasAccess) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = withLocalePrefix(localePrefix, "/unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthRoute && sessionCookie) {
    const session = await loadSessionFromCookie(sessionCookie, request.nextUrl.origin);

    if (!session) {
      return intlMiddleware(request);
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DASHBOARD_ALLOWED_ROLES.has(session.role ?? "")
      ? withLocalePrefix(localePrefix, "/dashboard")
      : withLocalePrefix(localePrefix, "/unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
