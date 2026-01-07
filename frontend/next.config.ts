import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://tiles.openfreemap.org https://unpkg.com https://cdn.jsdelivr.net https://apis.google.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://tiles.openfreemap.org https://fonts.googleapis.com; img-src 'self' blob: data: https://tiles.openfreemap.org https://api.mapbox.com https://tiles.basemaps.cartocdn.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.firestore.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://tiles.openfreemap.org https://router.project-osrm.org https://basemaps.cartocdn.com https://tiles.basemaps.cartocdn.com https://overpass-api.de; worker-src 'self' blob:; frame-src 'self' https://*.firebaseapp.com https://*.google.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
