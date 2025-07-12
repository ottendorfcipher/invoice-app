/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sqlite3', 'better-sqlite3'],
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
