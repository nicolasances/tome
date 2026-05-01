import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['toto-react'],
  webpack: (config) => {
    const path = require("path");
    config.resolve.alias['toto-react$'] = path.resolve(__dirname, '../toto-react/src/index.ts');
    return config;
  },
};

export default nextConfig;
