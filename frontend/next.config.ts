import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commenté pour Vercel pour permettre les API Routes (SMS, etc.)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
