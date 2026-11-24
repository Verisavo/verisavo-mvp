const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(SITE),
  title: "Verisavo · The intelligence layer for African markets",
  description: "Verisavo connects fragmented market information, from company data and public records to evidence gathered on the ground, so teams can see what is happening, what the evidence supports and what is still unknown.",
  applicationName: "Verisavo",
  openGraph: { type: "website", siteName: "Verisavo", locale: "en_GB" },
  twitter: { card: "summary_large_image" }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Red+Hat+Text:wght@400;500;600;700&family=Red+Hat+Display:wght@500;600;700&family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: "try{localStorage.removeItem(\"verisavo-theme\");document.documentElement.removeAttribute(\"data-vs-theme\")}catch(e){}\ndocument.addEventListener(\"click\",function(e){var b=e.target.closest&&e.target.closest(\"[data-theme-toggle]\");if(!b)return;var d=document.documentElement,on=d.getAttribute(\"data-vs-theme\")!==\"dark\";if(on)d.setAttribute(\"data-vs-theme\",\"dark\");else d.removeAttribute(\"data-vs-theme\");try{localStorage.setItem(\"verisavo-theme\",on?\"dark\":\"light\")}catch(e){}document.querySelectorAll(\"[data-theme-toggle]\").forEach(function(x){x.setAttribute(\"aria-pressed\",String(on));var l=on?\"Switch to light mode\":\"Switch to dark mode\";x.setAttribute(\"aria-label\",l);x.title=l})});\ndocument.addEventListener(\"DOMContentLoaded\",function(){if(document.documentElement.getAttribute(\"data-vs-theme\")===\"dark\")document.querySelectorAll(\"[data-theme-toggle]\").forEach(function(x){x.setAttribute(\"aria-pressed\",\"true\");x.setAttribute(\"aria-label\",\"Switch to light mode\");x.title=\"Switch to light mode\"})});" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
