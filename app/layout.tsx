import type { ReactNode } from "react";
import type { Viewport } from "next";
import { releaseStage } from "@/lib/release";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
      </head>
      {/* data-release tells the page scripts which milestones are live (see lib/release.ts) */}
      <body data-release={releaseStage}>{children}</body>
    </html>
  );
}
