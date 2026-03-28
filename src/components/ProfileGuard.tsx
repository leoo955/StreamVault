"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/userProvider";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Public routes — no auth needed
    if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/pair")) {
      setReady(true);
      return;
    }

    // Still loading user data
    if (loading) return;

    // Not logged in
    if (!user) {
      // Offline mode: allow access to downloads
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setReady(true);
        return;
      }
      router.push("/login");
      return;
    }

    // Admin & profile selection pages: skip profile check
    if (pathname.startsWith("/admin") || pathname === "/profiles") {
      setReady(true);
      return;
    }

    // Check for active profile
    const profile = sessionStorage.getItem("activeProfile");
    if (!profile) {
      router.push("/profiles");
    } else {
      setReady(true);
    }
  }, [pathname, router, user, loading]);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

// Export for backward compat
export function clearAuthCache() {}
