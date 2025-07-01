import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["tianhua.yl-dt.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tianhua.yl-dt.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
