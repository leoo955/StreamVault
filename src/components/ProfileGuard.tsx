"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/userProvider";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Routes that do not require an active profile
  const publicRoutes = ["/login", "/register", "/offline", "/maintenance"];
  const profileSelectionRoute = "/profiles";

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (!publicRoutes.includes(pathname)) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
      return;
    }

    // User is logged in
    const cookiesArr = document.cookie.split('; ');
    const activeProfileCookie = cookiesArr.find(row => row.startsWith('selectedProfileId='));
    const activeProfileId = activeProfileCookie ? activeProfileCookie.split('=')[1] : null;

    // Si on est sur une route publique, on redirige vers /profiles (ou la page d'accueil si on a un profil)
    if (publicRoutes.includes(pathname)) {
        if (activeProfileId) {
            router.replace("/");
        } else {
            router.replace(profileSelectionRoute);
        }
        return;
    }

    // Si on est sur une route sécurisée (autre que /profiles) et qu'aucun profil n'est sélectionné
    if (!activeProfileId && pathname !== profileSelectionRoute) {
      router.replace(profileSelectionRoute);
    } else {
      setIsChecking(false);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-deep-black">
        <div className="w-16 h-16 rounded-full border-4 border-surface-light border-t-white animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
