/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export", // Enable static exports
    distDir: "out", // The directory to export to (optional)
    images: {
        unoptimized: true, // Required for static export
    },
    // Configure the base path to match your GitHub repository name
    basePath: process.env.NODE_ENV === "production" ? "/stereo-vision-fe" : "",
    // Disable server-based features when exporting
    trailingSlash: true,
};

export default nextConfig;
