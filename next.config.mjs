/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.vercel.com",
                port: "",
                pathname: "/image/upload/**",
            },
            {
                protocol: "https",
                hostname: "apod.nasa.gov",
                port: "",
                pathname: "/apod/image/**",
            },
            {
                protocol: "http", 
                hostname: "mars.jpl.nasa.gov",
                port: "",
                pathname: "/msl-raw-images/**",
            },
            {
                protocol: "http",
                hostname: "mars.nasa.gov",
                port: "",
                pathname: "/mer/gallery/**",
            },
            {
                protocol: "https",
                hostname: "epic.gsfc.nasa.gov",
                port: "",
                pathname: "/archive/**",
            },
        ],
    },
};

export default nextConfig;