"use client";

import { useUser } from "@/lib/userProvider";
import { useEffect } from "react";

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const accentColor = user?.preferences?.accentColor || "#EAB308"; // Fallback yellow

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
  }, [accentColor]);

  return <>{children}</>;
}
