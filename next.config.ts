import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Only export for GitHub Pages
  ...(isGitHubPages && { output: 'export' }),
  trailingSlash: true,
  
  // Different base paths for different deployments
  basePath: isGitHubPages ? '/seed' : '',
  assetPrefix: isGitHubPages ? '/seed' : '',
  
  // Disable ESLint during builds for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    // Only unoptimize for GitHub Pages
    unoptimized: isGitHubPages,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
};

export default nextConfig;
