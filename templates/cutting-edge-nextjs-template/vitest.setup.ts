import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_BASE_URL ??= "https://example.com";
process.env.GOOGLE_SITE_VERIFICATION ??= "test-google-verification";
process.env.BING_SITE_VERIFICATION ??= "";
process.env.DATA_PROVIDER ??= "rest";
process.env.AUTH_COOKIE_NAME ??= "dashboard_session";
process.env.REST_API_BASE_URL ??= "http://localhost:3001/api";
