/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},
  // Webpack fallback (if using --webpack flag)
  webpack: (config) => {
    // Ignore chrome-extension folder from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/chrome-extension/**'],
    }
    return config
  },
}

module.exports = nextConfig

