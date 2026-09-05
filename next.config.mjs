/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // ⭐️ গুরুত্বপূর্ণ: static export বন্ধ রাখুন
  output: 'standalone',
  // ⭐️ Prerendering এর জন্য
  experimental: {
    // Turbopack এর জন্য
  },
};

export default nextConfig;
