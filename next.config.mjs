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
  // ⚠️ experimental.turbo সঠিক ফরম্যাটে
  experimental: {
    turbo: {
      // কোনো alias থাকলে এখানে দিন
    },
  },
};

export default nextConfig;
