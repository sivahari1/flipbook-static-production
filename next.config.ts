import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;