import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9199",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9199",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
