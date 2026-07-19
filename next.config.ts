import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  // Allow ngrok / tunnel hosts to load Next.js dev assets (/_next/*).
  allowedDevOrigins: [
    "ede0-37-111-210-67.ngrok-free.app",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
};

export default nextConfig;
