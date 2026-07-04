import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained build (.next/standalone with server.js + a minimal
  // node_modules) so the Docker runtime image stays small. Used by Dockerfile.
  output: "standalone",
};

export default nextConfig;
