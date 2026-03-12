/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    isrMemoryCacheSize: 0, // Disable ISR memory cache
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // 1 hour
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
