/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,          // deep links resolve to folder/index.html on Pages
  images: { unoptimized: true } // next/image optimization needs a server; export doesn't have one
};

export default nextConfig;
