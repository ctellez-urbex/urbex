/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Configuración para manejar rutas en producción
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '/',
  basePath: '',
}

module.exports = nextConfig 