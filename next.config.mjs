/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // old static file names, and tidy paths for the pages that open over the homepage scene
    // old panel names now have their own addresses
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/assistant.html", destination: "/platform", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/research", destination: "/insights", permanent: true },
      { source: "/docs", destination: "/docs.html", permanent: false }
    ];
  }
};
export default nextConfig;
