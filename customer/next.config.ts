import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost'], // Cho phép tải ảnh từ localhost
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
