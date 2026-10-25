"use client";
import { useEffect } from "react";

// Starts the homepage behaviour once the markup is on the page:
// dialogs, the site shell (menu, inner pages), case studies, the homepage itself, the header, then sound.
let started = false;

export default function HomeClient() {
  useEffect(() => {
    if (started) return;   // React's development mode runs effects twice; the page should only start once
    started = true;
    (async () => {
      (await import("@/lib/home/auth")).default();
      (await import("@/lib/home/soon")).default();
      (await import("@/lib/home/site")).default();
      (await import("@/lib/platform/mnavbg")).default();
      (await import("@/lib/home/aboutbg")).default();
      (await import("@/lib/home/insightsfeat")).default();
      (await import("@/lib/home/cases")).default();
      window.THREE = await import("three");
      (await import("@/lib/home/landing")).default();
      (await import("@/lib/home/header")).default();
      (await import("@/lib/sound")).default();
    })();
  }, []);
  return null;
}
