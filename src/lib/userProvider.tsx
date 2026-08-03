"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string | null;
  username: string | null;
  role: string;
  plan: string;
  preferences: any;
  profiles: any[];
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mode sans connexion : utilisateur admin par défaut
const defaultAdmin: User = {
  id: "default-admin-id",
  email: "admin@streamvault.test",
  username: "Admin",
  role: "admin",
  plan: "ULTIMATE",
  preferences: {},
  profiles: [{ id: "default-profile", name: "Principal", isChild: false }]
};

// Module-level cache to prevent flickering on navigation
let cachedUser: User | null = defaultAdmin;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        cachedUser = data;
      } else {
        setUser(defaultAdmin);
        cachedUser = defaultAdmin;
      }
    } catch (err) {
      setUser(defaultAdmin);
      cachedUser = defaultAdmin;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(defaultAdmin);
    cachedUser = defaultAdmin;
  };

  useEffect(() => {
    // Only fetch if we don't have it cached
    if (!cachedUser) {
      refreshUser();
    } else if (!user) {
      setUser(cachedUser);
      setIsLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
