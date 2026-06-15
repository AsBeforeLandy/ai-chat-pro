"use client";

import { create } from "zustand";
import type { ThemeState } from "@/types/chat";

function getSystemPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("aichat-theme");
  if (stored !== null) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true, // default, will be updated in useEffect

  toggleTheme: () => {
    const next = !get().isDark;
    if (typeof window !== "undefined") {
      localStorage.setItem("aichat-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
    }
    set({ isDark: next });
  },
}));

// Initialize on client
if (typeof window !== "undefined") {
  const isDark = getSystemPreference();
  document.documentElement.classList.toggle("dark", isDark);
  useThemeStore.setState({ isDark });
}
