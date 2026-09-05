/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// next-pwa is optional — if it fails to load, skip it gracefully
let withPWA = (config) => config;
try {
  const nextPWA = require('next-pwa');
  withPWA = nextPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: isDev, // disable in dev to avoid SW interfering with HMR
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: { maxEntries: 200 },
        },
      },
    ],
  });
} catch {
  // next-pwa not installed yet — that's fine
}

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // output: 'standalone' is for production Docker only — remove for dev
  // output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
