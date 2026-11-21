// Report-only for now: the browser reports what this policy would block without blocking it. The other headers are enforced.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'"
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: [
        { key: "Content-Security-Policy-Report-Only", value: csp },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" }
      ] },
      { source: "/auth/confirm", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] }
    ];
  },
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
    const pages = ["about-us", "research", "contact", "pricing", "careers", "community", "use-cases", "demo"];
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/assistant.html", destination: "/platform", permanent: true },
      { source: "/docs.html", destination: "/docs", permanent: true },
      { source: "/apply.html", destination: "/apply", permanent: true },
      ...pages.map(p => ({ source: `/${p}`, destination: `/#${p}`, permanent: false }))
    ];
  },
  async rewrites() {
    // The public website is the client's design, built into public/site/ by scripts/build-site.mjs (npm run site:build).
    // beforeFiles, so these win over the old React landing pages. The proxy still runs first, so /assistant stays
    // sign-in only. The app pages (/dashboard, /admin, /auth, /reset-password) and the APIs are untouched.
    return {
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },
        { source: "/platform", destination: "/site/assistant.html" },
        { source: "/assistant", destination: "/site/assistant.html" },
        { source: "/docs", destination: "/site/docs.html" },
        { source: "/apply", destination: "/site/apply.html" }
      ]
    };
  }
};
export default nextConfig;
