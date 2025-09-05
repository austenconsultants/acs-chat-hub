/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  env: {
    PORT: process.env.PORT || '3000',
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  serverExternalPackages: ['better-sqlite3'],

  // Webpack configuration for SQLite
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3')
    }
    return config
  }
}

export default nextConfig
