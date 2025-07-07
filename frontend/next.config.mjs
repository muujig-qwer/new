/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.freshpack.mn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pisces.bbystatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.alicdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'book.mn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'c1.neweggimages.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.hitech.mn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'consumer.huawei.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
