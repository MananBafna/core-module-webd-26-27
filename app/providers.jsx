"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "lumina-theme";

const ThemeContext = createContext(null);
const SettingsContext = createContext(null);

export function useTheme() {
  return useContext(ThemeContext);
}
export function useSettings() {
  return useContext(SettingsContext);
}

function applyTheme(pref) {
  const root = document.documentElement;
  const systemDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isLight = pref === "light" || (pref === "system" && !systemDark);
  root.classList.toggle("light", isLight);
}

export default function Providers({ children }) {
  // "dark" | "light" | "system"
  const [theme, setThemeState] = useState("dark");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load the saved preference once on mount.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "dark";
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  // React to OS theme changes while on "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <SettingsContext.Provider
        value={{
          settingsOpen,
          openSettings: () => setSettingsOpen(true),
          closeSettings: () => setSettingsOpen(false),
        }}
      >
        {children}
      </SettingsContext.Provider>
    </ThemeContext.Provider>
  );
}
