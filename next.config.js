// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.telegram.org'],
  },
  env: {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // prevent Puppeteer & Chromium packages from being bundled
      config.externals = [
        ...config.externals,
        'puppeteer-core',
        '@sparticuz/chromium',
        '@sparticuz/chromium-min',
      ]
    }
    return config
  },
}

module.exports = nextConfig
