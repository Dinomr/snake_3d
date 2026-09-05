/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 1,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;