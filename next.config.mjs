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
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
        port: "",
        pathname: "/image/**", 
      },
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
        port: "",
        pathname: "/video/**", 
      },
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
        port: "",
        pathname: "/audio/**", 
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**", 
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET",
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|m4a)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next/static/media/",
          outputPath: "static/media/",
          name: "[name].[hash].[ext]",
        },
      },
    });
    return config;
  },
};

export default nextConfig;
