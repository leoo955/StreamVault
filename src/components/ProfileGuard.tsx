"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Exempt certain routes from requiring a profile selection
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/admin") ||
      pathname === "/profiles"
    ) {
      setHasProfile(true);
      return;
    }

    const profile = sessionStorage.getItem("activeProfile");
    if (!profile) {
      router.push("/profiles");
    } else {
      setHasProfile(true);
    }
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
