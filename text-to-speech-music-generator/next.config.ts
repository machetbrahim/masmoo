import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["msedge-tts", "pg"],
  async headers() {
    return [
      {
        source: "/api/audio/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
