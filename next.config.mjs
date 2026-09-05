/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  // 🆕 Turbopack ও build এর জন্য
  experimental: {
    turbo: {},
  },
};

export default nextConfig;
