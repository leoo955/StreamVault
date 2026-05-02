"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MainContent wrapper.
 * Ensures proper padding for the fixed Sidebar/Navbar.
 */
export function MainContent({ children, className }: MainContentProps) {
  return (
    <main 
      className={cn(
        "flex-1 w-full min-h-screen",
        "pt-20 md:pt-0", // Space for mobile header and desktop fixed navbar
        className
      )}
    >
      {children}
    </main>
  );
}
