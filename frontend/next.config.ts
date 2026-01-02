import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enabled for static APK build
  images: {
    unoptimized: true,
  },


};

export default nextConfig;
