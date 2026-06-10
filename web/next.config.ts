import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma's query engine out of the server bundle.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  // Pin the workspace root to this app (the repo root also has a lockfile).
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
