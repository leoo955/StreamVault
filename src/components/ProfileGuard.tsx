"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Public routes that don't need auth or profile
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      setHasProfile(true);
      return;
    }

    // Check authentication for ALL other routes
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }

        // User is authenticated, now check specific page requirements

        // 1. Admin routes requirement
        if (pathname.startsWith("/admin")) {
          if (data.user.role !== "admin") {
            router.push("/");
          } else {
            setHasProfile(true);
          }
          return;
        }

        // 2. Profile selection page (no selection needed yet)
        if (pathname === "/profiles") {
          setHasProfile(true);
          return;
        }

        // 3. All other pages require an active profile
        const activeProfile = sessionStorage.getItem("activeProfile");
        if (!activeProfile) {
          router.push("/profiles");
        } else {
          setHasProfile(true);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [pathname, router]);

  // Prevent flash of content if we are redirecting
  if (hasProfile === null) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
