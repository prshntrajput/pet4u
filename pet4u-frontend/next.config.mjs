/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // This allows ALL paths from Cloudinary
      },
    ],
  },
};

export default nextConfig; // ✅ Note: export default, not module.exports
