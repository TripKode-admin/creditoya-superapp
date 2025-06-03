import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // assetPrefix: './',
  distDir: 'mobile-dist'
};

export default nextConfig;