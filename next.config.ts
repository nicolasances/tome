import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/language-learning",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
