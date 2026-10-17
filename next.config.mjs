/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // knowledge-base uploads go through a server action; the hosting platform caps a request at about 4.5 MB.
    // Files are limited to 4 MB (lib/server/rag/extract.ts), so the form's other fields still fit.
    serverActions: { bodySizeLimit: "4.5mb" }
  },
  // the PDF report route reads its fonts from disk (lib/server/pdf/report.ts), so ship them with it
  outputFileTracingIncludes: {
    "/api/assistant/conversations/*/pdf": ["./lib/server/pdf/fonts/**/*"]
  },
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
