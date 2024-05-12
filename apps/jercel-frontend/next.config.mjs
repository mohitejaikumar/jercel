/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages:['@repo/prisma']
};

export default nextConfig;
