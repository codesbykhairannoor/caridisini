import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.susercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.shopeemobile.com',
      },
    ],
  },
};

export default nextConfig;
