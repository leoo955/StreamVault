"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SWR] Registered:", registration.scope);

          // Listen for SW updates and auto-activate
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  console.log("[SWR] New Service Worker activated");
                }
              });
            }
          });

          // Pre-cache offline page
          setTimeout(() => {
            fetch("/offline.html").catch(() => {});
          }, 2000);

          // Pre-cache key routes for faster offline transition
          setTimeout(() => {
            router.prefetch("/downloads");
            router.prefetch("/offline");
          }, 3000);

          // Request persistent storage so the browser doesn't auto-evict downloads
          if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then((granted) => {
              if (granted) {
                console.log("[SWR] Persistent storage granted ✓");
              }
            });
          }
        })
        .catch((error) => {
          console.error("[SWR] Registration failed:", error);
        });
    });
  }, [router]);

  return null;
}
