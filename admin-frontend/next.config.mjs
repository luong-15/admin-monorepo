/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
