// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */

// connect new Sever
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env/server.mjs'))

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: ["172.21.87.9"],
    // domains: ['youtube-booking-software.s3.eu-central-1.amazonaws.com'],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@medusajs/product",
    ],
  },

}
export default config
