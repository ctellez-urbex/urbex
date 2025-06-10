/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
