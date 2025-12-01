/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.instantdb.com',
      },
    ],
  },
}

module.exports = nextConfig
