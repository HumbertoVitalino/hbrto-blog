import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // reviews became notes; single reviews are resolved in app/reviews/[reviewId]
    return [{ source: "/reviews", destination: "/notes", permanent: true }];
  },
};

export default nextConfig;
