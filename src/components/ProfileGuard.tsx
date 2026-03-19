"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Module-level auth cache — persists across route changes within the same session
let authCache: { user: any; checkedAt: number } | null = null;
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const checkedRef = useRef(false);

  useEffect(() => {
    // Public routes — no auth needed
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/pair")) {
      setReady(true);
      return;
    }

    // Use cached auth if fresh enough
    if (authCache && Date.now() - authCache.checkedAt < AUTH_CACHE_TTL) {
      if (!authCache.user) {
        router.push("/login");
        return;
      }
      if (pathname.startsWith("/admin") || pathname === "/profiles") {
        setReady(true);
        return;
      }
      const profile = sessionStorage.getItem("activeProfile");
      if (!profile) {
        router.push("/profiles");
      } else {
        setReady(true);
      }
      return;
    }

    // First check or cache expired — fetch auth
    if (checkedRef.current) return;
    checkedRef.current = true;

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        authCache = { user: d.user || null, checkedAt: Date.now() };

        if (!d.user) {
          router.push("/login");
          return;
        }

        if (pathname.startsWith("/admin") || pathname === "/profiles") {
          setReady(true);
          return;
        }

        const profile = sessionStorage.getItem("activeProfile");
        if (!profile) {
          router.push("/profiles");
        } else {
          setReady(true);
        }
      })
      .catch(() => {
        authCache = null;
        router.push("/login");
      });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// Export to invalidate cache on logout
export function clearAuthCache() {
  authCache = null;
}

