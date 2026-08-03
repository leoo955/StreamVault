"use client";

import { UserProvider } from "@/lib/userProvider";
import { ProfileGuard } from "./ProfileGuard";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { AccentProvider } from "./AccentProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AccentProvider>
        <ProfileGuard>
          <Sidebar />
          <MainContent>
            {children}
          </MainContent>
        </ProfileGuard>
      </AccentProvider>
    </UserProvider>
  );
}

