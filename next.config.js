/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Uncomment and set if deploying to GitHub Pages sub-path:
  // basePath: '/ai-chat-pro',
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
