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
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  }
};

export default nextConfig;