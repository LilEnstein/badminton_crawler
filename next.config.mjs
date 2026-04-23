/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@sparticuz/chromium-min", "playwright-core"]
  }
};

export default nextConfig;
