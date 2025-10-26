import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Simplified configuration for Amplify deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  images: {
    unoptimized: true, // Required for static export
    domains: ['res.cloudinary.com'],
  },
  // Static export for Amplify
  output: 'export',
  distDir: 'out',
  
  // Disable features that don't work with static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  webpack: (config, { isServer }) => {
    // Simplified webpack config
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;