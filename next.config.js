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
  // Add basePath if your app is not served from root
  // basePath: '',
  // Add assetPrefix if your assets are served from a different domain
  // assetPrefix: '',
}

module.exports = nextConfig 