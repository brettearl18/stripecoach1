/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack caching
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      name: isServer ? 'server' : 'client',
      version: '1.0.0',
    };

    // Optimize module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Add rule for undici
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-proposal-private-methods', '@babel/plugin-proposal-class-properties']
        }
      }
    });

    // Optimize client-side rendering
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

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
  // Enable experimental features
  experimental: {
    serverActions: true,
    // Enable modern features
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true
  },
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
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
  // Enable React strict mode
  reactStrictMode: true,
}

module.exports = nextConfig