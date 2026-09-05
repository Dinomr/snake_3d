/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;