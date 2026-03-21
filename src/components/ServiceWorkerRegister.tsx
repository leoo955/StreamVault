"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
            
            // Proactively cache critical Offline paths using vanilla fetch for HTML
            setTimeout(() => {
               fetch("/offline.html").catch(() => {});
            }, 2500);

            // Force Next.js to prefetch the complete RSC payload and JS chunks for the downloads page
            // The Service Worker generic GET cache intercepts all of this naturally.
            setTimeout(() => {
               router.prefetch("/downloads");
            }, 3000);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, [router]);

  return null;
}
