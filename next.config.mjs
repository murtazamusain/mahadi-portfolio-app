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
  // 🆕 static export বন্ধ করুন
  output: 'standalone',
  // 🆕 Turbopack এর জন্য
  experimental: {
    turbo: {
      resolveAlias: {
        // কোনো alias থাকলে এখানে দিন
      },
    },
  },
};

export default nextConfig;
