import { useAppStore } from "~/stores/app";

export type Theme = "light" | "dark" | "system";

function resolve(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function apply(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function getTheme(): Theme {
  return useAppStore().theme;
}

export function setTheme(theme: Theme) {
  useAppStore().theme = theme;
  apply(resolve(theme));
}

export function initTheme() {
  const theme = readPersistedTheme();
  apply(resolve(theme));

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getTheme() === "system") apply(resolve("system"));
  });
}

function readPersistedTheme(): Theme {
  try {
    const raw = localStorage.getItem("app");
    const parsed = raw && JSON.parse(raw);
    if (["light", "dark", "system"].includes(parsed?.theme)) {
      return parsed.theme;
    }
  } catch { /* ignore */ }
  return "system";
}
