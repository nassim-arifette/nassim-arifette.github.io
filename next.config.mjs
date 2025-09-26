import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// If this is a project page (NOT username.github.io), set NEXT_PUBLIC_BASE_PATH="/your-repo-name"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',              // enables next export
  images: { unoptimized: true }, // GH Pages can't run the image optimizer
  basePath,                      // e.g. '/my-portfolio' for project pages
  assetPrefix: basePath ? `${basePath}/` : '',
  trailingSlash: true,           // avoids 404s for nested routes on GH Pages
  experimental: { mdxRs: true },
}

export default withContentlayer(nextConfig)

