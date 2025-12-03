/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you decide to use image thumbnails later, add your domains here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
