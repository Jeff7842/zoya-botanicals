import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rsvoodcjjskxuinlpzms.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'rsvoodcjjskxuinlpzms.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        pathname: '/v1/storage/buckets/69ac40470009f698eaa6/files/**',
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: 'https://www.myzoya.shop/auth/:path*',
        destination: 'https://auth.myzoya.shop/auth/:path*',
        permanent: true,
      },
    ];
  },

};

export default nextConfig;
