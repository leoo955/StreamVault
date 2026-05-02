"use client";

import { UserProvider } from "@/lib/userProvider";
import { ProfileGuard } from "./ProfileGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ProfileGuard>
        {children}
      </ProfileGuard>
    </UserProvider>
  );
}
