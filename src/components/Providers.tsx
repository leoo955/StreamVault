"use client";

import { UserProvider } from "@/lib/userProvider";
import { ProfileGuard } from "./ProfileGuard";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ProfileGuard>
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </ProfileGuard>
    </UserProvider>
  );
}
