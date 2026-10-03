/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // old static file names, and tidy paths for the pages that open over the homepage scene
    const pages = ["about-us", "research", "contact", "pricing", "careers"];
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/assistant.html", destination: "/platform", permanent: true },
      ...pages.map(p => ({ source: `/${p}`, destination: `/#${p}`, permanent: false }))
    ];
  }
};
export default nextConfig;
