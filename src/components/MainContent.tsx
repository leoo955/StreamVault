"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Footer from "./Footer";

export default function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noNavPages = ["/login", "/register", "/watch", "/profiles"];
  const hideNav = noNavPages.some((p) => pathname?.startsWith(p));

  return (
    <main
      className={`transition-all duration-300 flex flex-col min-h-screen ${
        hideNav ? "" : "pt-14 md:pt-16 pb-20 md:pb-0"
      }`}
    >
      <div className="flex-1">
        {children}
      </div>
      {!hideNav && <Footer />}
    </main>
  );
}
