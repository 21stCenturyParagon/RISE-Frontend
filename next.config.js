/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pathwayactivities.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'rise-question-bank.s3.eu-north-1.amazonaws.com'
      }
    ],
  }
};

module.exports = nextConfig;