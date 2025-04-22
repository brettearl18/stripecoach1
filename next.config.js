/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack caching
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: '.next/cache/webpack',
      name: isServer ? 'server' : 'client',
      version: '1.0.0', // Change this to invalidate cache
      compression: false, // Disable compression to avoid header check issues
    };

    // Optimize module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Disable cache in development to avoid stale data
    if (dev) {
      config.cache = false;
    }

    return config;
  },
  // Enable static exports
  output: 'standalone',
  // Increase build timeout
  staticPageGenerationTimeout: 120,
  // Enable experimental features if needed
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3005']
    }
  },
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

module.exports = nextConfig