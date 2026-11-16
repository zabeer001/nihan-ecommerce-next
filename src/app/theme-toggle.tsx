"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const themeChange = "nihan-theme-change";

function subscribe(callback: () => void) {
  function syncSharedTheme() {
    const theme = document.cookie.match(/(?:^|;\s*)nihan-theme=(light|dark)(?:;|$)/)?.[1];
    if (theme) document.documentElement.dataset.theme = theme;
    callback();
  }

  window.addEventListener(themeChange, callback);
  window.addEventListener("focus", syncSharedTheme);
  return () => {
    window.removeEventListener(themeChange, callback);
    window.removeEventListener("focus", syncSharedTheme);
  };
}

export function ThemeToggle() {
  const home = usePathname() === "/";
  function isLightTheme() {
    const { theme } = document.documentElement.dataset;
    return theme ? theme === "light" : home;
  }

  const light = useSyncExternalStore(subscribe, isLightTheme, () => home);

  function toggleTheme() {
    const theme = isLightTheme() ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.cookie = `nihan-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;

    try {
      localStorage.setItem("nihan-theme", theme);
    } catch {
      // The current page still supports switching when storage is unavailable.
    }

    window.dispatchEvent(new Event(themeChange));
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Light theme"
      aria-pressed={light}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">☀</span>
    </button>
  );
}
