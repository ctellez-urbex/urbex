/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Ensure compatibility with SPA routing
  distDir: 'out',
  // Disable server-side features that don't work with static export
  swcMinify: true,
  // Optimize for static hosting
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig 