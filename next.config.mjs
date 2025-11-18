/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["ai", "@ai-sdk/openai"],
  },
};

export default nextConfig;
