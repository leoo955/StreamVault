"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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
  setUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  planFeatures: null,
  isAdmin: false,
  loading: true,
  refresh: () => {},
  setUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

// Cache to avoid redundant fetches across mounts
let cachedUser: UserData | null = null;
let fetchPromise: Promise<UserData | null> | null = null;
let lastFetchId = 0;

function fetchUser(): Promise<{ user: UserData | null; fetchId: number }> {
  const currentFetchId = ++lastFetchId;
  
  if (fetchPromise) {
    return fetchPromise.then(u => ({ user: u, fetchId: currentFetchId }));
  }

  fetchPromise = fetch("/api/auth/me")
    .then((r) => {
      if (!r.ok) return null;
      return r.json();
    })
    .then((data) => {
      const user = data?.user || null;
      cachedUser = user;
      fetchPromise = null;
      return user;
    })
    .catch(() => {
      fetchPromise = null;
      return null;
    });

  return fetchPromise.then(u => ({ user: u, fetchId: currentFetchId }));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const fetchIdRef = useRef(0);

  const refresh = useCallback(() => {
    cachedUser = null;
    fetchPromise = null;
    setLoading(true);
    fetchUser().then(({ user: u, fetchId }) => {
      if (fetchId >= fetchIdRef.current) {
        fetchIdRef.current = fetchId;
        setUser(u);
        setLoading(false);
      }
    });
  }, []);

  const setUserWithCache = useCallback((u: UserData | null) => {
    cachedUser = u;
    fetchPromise = null; 
    fetchIdRef.current = ++lastFetchId; // Mark that we have newer data
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }
    fetchUser().then(({ user: u, fetchId }) => {
      if (fetchId >= fetchIdRef.current) {
        fetchIdRef.current = fetchId;
        setUser(u);
        setLoading(false);
      }
    });
  }, []);

  const planFeatures = user ? getPlanFeatures(user.plan) : null;
  const isAdmin = user?.role === "admin";

  return (
    <UserContext.Provider value={{ user, planFeatures, isAdmin, loading, refresh, setUser: setUserWithCache }}>
      {children}
    </UserContext.Provider>
  );
}

// Clear cache on logout
export function clearUserCache() {
  cachedUser = null;
  fetchPromise = null;
}
