/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/ai-chat-pro",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
