import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Avoid spawning many static workers on constrained local and CI runners.
  experimental: { cpus: 1 },
}

export default withContentlayer(nextConfig)
