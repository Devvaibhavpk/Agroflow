import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
      },
    ],
    unoptimized: true,
  },
  // Build configuration
  eslint: {
    // Only run ESLint on build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
