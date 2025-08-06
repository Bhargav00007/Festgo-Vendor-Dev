import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["festgo.blr1.digitaloceanspaces.com", "another-domain.com"], // Add your allowed domains here
  },
};

export default nextConfig;
