"use client";
import { useEffect } from "react";

// Starts the Platform page behaviour once the markup is on the page.
let started = false;

export default function PlatformClient() {
  useEffect(() => {
    if (started) return;   // React's development mode runs effects twice; the page should only start once
    started = true;
    document.body.setAttribute("data-sound-sections", "");   // each section of this page shifts the soundtrack
    (async () => {
      (await import("@/lib/platform/main")).default();
      (await import("@/lib/platform/particles")).default();
      (await import("@/lib/platform/soon")).default();
      (await import("@/lib/sound")).default();
    })();
  }, []);
  return null;
}
