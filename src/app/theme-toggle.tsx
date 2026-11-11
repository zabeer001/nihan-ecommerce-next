"use client";

import { useSyncExternalStore } from "react";

const themeChange = "nihan-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(themeChange, callback);
  return () => window.removeEventListener(themeChange, callback);
}

function isLightTheme() {
  return document.documentElement.dataset.theme === "light";
}

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, isLightTheme, () => false);

  function toggleTheme() {
    const theme = isLightTheme() ? "dark" : "light";
    document.documentElement.dataset.theme = theme;

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
