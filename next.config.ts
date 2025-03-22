/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    unoptimized: true
  },
  experimental: {
    serverActions: {
      enabled: true
    }
  }
};

export default nextConfig;
