/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration...
  
  // Add this configuration for server actions
  experimental: {
    serverActions: {
      bodySizeLimit: 50 * 1024 * 1024,
    },
  },
}

export default nextConfig