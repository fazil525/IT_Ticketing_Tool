const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  distDir: isProd ? 'node_modules/.next-cache' : '../../../.next-cache-it-ticketing',
};

export default nextConfig;
