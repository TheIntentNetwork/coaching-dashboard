import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // Allow ngrok / tunnel hosts to load Next.js dev assets (/_next/*).
  allowedDevOrigins: [
    "ede0-37-111-210-67.ngrok-free.app",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/sustainbl",
        destination: "/case-file/documents",
        permanent: false,
      },
      {
        source: "/sustainbl/:path*",
        destination: "/case-file/:path*",
        permanent: false,
      },
      {
        source: "/case-file",
        destination: "/case-file/documents",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
