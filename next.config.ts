import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Router client cache — navigarea între pagini deja vizitate revine din
  // cache (dynamic) 30s, static 5min. Simte-se instant după prima vizită.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  // Lista de vinuri trăiește pe /shop; /vinuri există doar ca prefix al
  // paginilor de vin și dădea 404 (URL ghicit de oameni și de crawlere).
  async redirects() {
    return [{ source: "/vinuri", destination: "/shop", permanent: true }];
  },
};

export default nextConfig;
