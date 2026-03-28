"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { PlanFeatures, getPlanFeatures } from "@/lib/plans";

interface UserData {
  id: string;
  username: string;
  role: string;
  plan: string;
  preferences?: any;
}

interface UserContextType {
  user: UserData | null;
  planFeatures: PlanFeatures | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  planFeatures: null,
  isAdmin: false,
  loading: true,
  refresh: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

// Cache to avoid redundant fetches across mounts
let cachedUser: UserData | null = null;
let fetchPromise: Promise<UserData | null> | null = null;

function fetchUser(): Promise<UserData | null> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/auth/me")
    .then((r) => {
      if (!r.ok) return null;
      return r.json();
    })
    .then((data) => {
      cachedUser = data?.user || null;
      fetchPromise = null;
      return cachedUser;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });
  return fetchPromise;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  const refresh = useCallback(() => {
    cachedUser = null;
    fetchPromise = null;
    setLoading(true);
    fetchUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }
    fetchUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const planFeatures = user ? getPlanFeatures(user.plan) : null;
  const isAdmin = user?.role === "admin";

  return (
    <UserContext.Provider value={{ user, planFeatures, isAdmin, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

// Clear cache on logout
export function clearUserCache() {
  cachedUser = null;
  fetchPromise = null;
}
