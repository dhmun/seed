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
  
  images: {
    // Only unoptimize for GitHub Pages
    unoptimized: isGitHubPages,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
