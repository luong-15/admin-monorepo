/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
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

  // Performance optimizations
  compress: true,

  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/admin/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-store" },
      ],
    },
    {
      source: "/auth/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-store" },
      ],
    },
  ],
};

export default nextConfig;
