"use client";

import { useState, useEffect } from "react";

/**
 * Hook that verifies the current user is an admin.
 * Redirects to "/" if not admin, to "/login" if not authenticated.
 * Returns `true` only when admin role is confirmed.
 */
export function useAdminAuth(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== "admin") {
          window.location.href = "/";
          return;
        }
        setIsAdmin(true);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  return isAdmin;
}
