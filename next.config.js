/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Disable page transitions
  experimental: {
    scrollRestoration: false,
  },
  // Simplified webpack config
  webpack: (config) => {
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      type: 'javascript/auto',
    });
    return config;
  },
  transpilePackages: ['undici', '@firebase/auth'],
  // Basic redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/marketing',
        permanent: true,
      },
    ];
  },
  // Add headers to disable caching for HTML and data requests
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 