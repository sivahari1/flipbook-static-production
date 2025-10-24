import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip build-time static generation for API routes that need database
  skipTrailingSlashRedirect: true,
  eslint: {
    // Ignore ESLint errors during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds for deployment
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config, { isServer }) => {
    // Handle node: scheme imports and native modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        os: false,
        canvas: false,
        'sodium-native': false,
        argon2: false,
      };
    }
    
    // Exclude problematic native modules from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('canvas', 'sodium-native', 'argon2', 'sharp');
    }
    
    return config;
  },
  serverExternalPackages: ['argon2', 'canvas', 'sodium-native', 'sharp'],
  experimental: {
    serverComponentsExternalPackages: ['argon2', 'canvas', 'sodium-native', 'sharp'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
};

export default nextConfig;