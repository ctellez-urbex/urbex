const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export for S3 deployment
  distDir: 'out',
  trailingSlash: true, // Required for S3 static website hosting to resolve directory index files
  reactStrictMode: true,
  
  // Configuración para manejar rutas en producción
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '/',
  basePath: '',
  
  // Optimizaciones de performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@aws-sdk/client-cognito-identity-provider'],
  },
  
  // Compresión de bundles
  compress: true,
  
  // Optimización de imágenes
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = withBundleAnalyzer(nextConfig)