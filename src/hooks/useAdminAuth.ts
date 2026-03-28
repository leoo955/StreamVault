"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/userProvider";

/**
 * Hook that verifies the current user is an admin.
 * Redirects to "/" if not admin, to "/login" if not authenticated.
 * Returns `true` only when admin role is confirmed.
 */
export function useAdminAuth(): boolean {
  const { user, isAdmin, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = "/login";
    } else if (!isAdmin) {
      window.location.href = "/";
    }
  }, [user, isAdmin, loading]);

  return isAdmin;
}
