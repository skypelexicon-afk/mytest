import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vz-*.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'notes-pdf.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'courses-pdf.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.chemicals.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lol.com',
        pathname: '/**', // allow all paths
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**', // Allows all YouTube thumbnail paths (e.g., /vi/.../hqdefault.jpg)
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**', // Optional: backup/alternative YouTubedomain if used elsewhere
      },
    ]
  },
  webpack: (config) => {
    config.externals.push({ canvas: "commonjs canvas" });
    return config;
  },
};

export default nextConfig;