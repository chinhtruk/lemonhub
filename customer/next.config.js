/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
      domains: [
        'localhost',
        '127.0.0.1',
        'images.unsplash.com',
        'plus.unsplash.com',
        'api.lemonhub.vn',
        'picsum.photos',
        'res.cloudinary.com',
        'host.domain'
      ],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '5000',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5001',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '5001',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'host.domain',
          pathname: '/**',
        }
      ],
    },
    // Đảm bảo hoạt động với file tĩnh trong public
    async rewrites() {
      return [
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:5000/uploads/:path*'
        }
      ]
    }
  };
  
  module.exports = nextConfig;