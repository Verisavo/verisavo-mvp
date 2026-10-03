"use client";
import { useEffect } from "react";

// Starts the homepage behaviour once the markup is on the page, in the same order as the original page:
// dialogs first, then the 3D market scene (three.js), then the header backdrop, then sound.
let started = false;

export default function HomeClient() {
  useEffect(() => {
    if (started) return;   // React's development mode runs effects twice; the page should only start once
    started = true;
    (async () => {
      (await import("@/lib/home/auth")).default();
      (await import("@/lib/home/soon")).default();
      window.THREE = await import("three");
      (await import("@/lib/home/scene")).default();
      (await import("@/lib/home/header")).default();
      (await import("@/lib/sound")).default();
    })();
  }, []);
  return null;
}
