"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  accent: string;      // Primary accent color
  accentLight: string;
  accentDark: string;
  accentGlow: string;
  surface: string;
  surfaceLight: string;
  deepBlack: string;
  shimmer: string;
  preview: string;      // CSS gradient for preview swatch
}

export const THEMES: ThemeConfig[] = [
  {
    id: "gold",
    name: "Gold Classic",
    accent: "#C6A55C",
    accentLight: "#D4B96E",
    accentDark: "#A8893E",
    accentGlow: "rgba(198, 165, 92, 0.15)",
    surface: "#141414",
    surfaceLight: "#222222",
    deepBlack: "#0A0A0A",
    shimmer: "linear-gradient(135deg, #C6A55C 0%, #D4B96E 50%, #C6A55C 100%)",
    preview: "linear-gradient(135deg, #0A0A0A 0%, #C6A55C 100%)",
  },
  {
    id: "blue",
    name: "Midnight Blue",
    accent: "#4A9EFF",
    accentLight: "#6BB5FF",
    accentDark: "#2B7BDB",
    accentGlow: "rgba(74, 158, 255, 0.15)",
    surface: "#0D1520",
    surfaceLight: "#1A2535",
    deepBlack: "#060D17",
    shimmer: "linear-gradient(135deg, #4A9EFF 0%, #6BB5FF 50%, #4A9EFF 100%)",
    preview: "linear-gradient(135deg, #060D17 0%, #4A9EFF 100%)",
  },
  {
    id: "purple",
    name: "Neon Purple",
    accent: "#A855F7",
    accentLight: "#C084FC",
    accentDark: "#7C3AED",
    accentGlow: "rgba(168, 85, 247, 0.15)",
    surface: "#150D20",
    surfaceLight: "#251535",
    deepBlack: "#0A0510",
    shimmer: "linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #A855F7 100%)",
    preview: "linear-gradient(135deg, #0A0510 0%, #A855F7 100%)",
  },
  {
    id: "oled",
    name: "Pure OLED",
    accent: "#FFFFFF",
    accentLight: "#E0E0E0",
    accentDark: "#AAAAAA",
    accentGlow: "rgba(255, 255, 255, 0.1)",
    surface: "#0A0A0A",
    surfaceLight: "#1A1A1A",
    deepBlack: "#000000",
    shimmer: "linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 50%, #FFFFFF 100%)",
    preview: "linear-gradient(135deg, #000000 0%, #FFFFFF 100%)",
  },
  {
    id: "red",
    name: "Crimson Red",
    accent: "#E53935",
    accentLight: "#EF5350",
    accentDark: "#C62828",
    accentGlow: "rgba(229, 57, 53, 0.15)",
    surface: "#1A0A0A",
    surfaceLight: "#2A1515",
    deepBlack: "#0A0505",
    shimmer: "linear-gradient(135deg, #E53935 0%, #EF5350 50%, #E53935 100%)",
    preview: "linear-gradient(135deg, #0A0505 0%, #E53935 100%)",
  },
];

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--gold", theme.accent);
  root.style.setProperty("--gold-light", theme.accentLight);
  root.style.setProperty("--gold-dark", theme.accentDark);
  root.style.setProperty("--gold-glow", theme.accentGlow);
  root.style.setProperty("--gold-shimmer", theme.shimmer);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--surface-light", theme.surfaceLight);
  root.style.setProperty("--deep-black", theme.deepBlack);
  root.dataset.theme = theme.id;
}

const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (id: string) => void;
}>({
  theme: THEMES[0],
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(THEMES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("streamvault-theme");
    const found = THEMES.find((t) => t.id === saved);
    if (found) {
      setThemeState(found);
      applyTheme(found);
    }
  }, []);

  const setTheme = useCallback((id: string) => {
    const found = THEMES.find((t) => t.id === id);
    if (found) {
      setThemeState(found);
      applyTheme(found);
      localStorage.setItem("streamvault-theme", id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
