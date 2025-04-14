/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Add a rule to handle the undici package
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      type: 'javascript/auto',
    });

    return config;
  },
  transpilePackages: ['undici', '@firebase/auth'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/marketing',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 