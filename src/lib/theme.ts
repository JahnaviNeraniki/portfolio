// Theme preference: stored in localStorage, applied as data-theme on <html>.
// The inline script in BaseLayout runs the same logic before first paint (no flash).

export const THEME_PREFS = ["system", "light", "dark", "matrix"] as const;
export type ThemePref = (typeof THEME_PREFS)[number];
export type ResolvedTheme = "light" | "dark" | "matrix";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "portfolio:theme-change";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function isThemePref(value: unknown): value is ThemePref {
  return typeof value === "string" && (THEME_PREFS as readonly string[]).includes(value);
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): ResolvedTheme {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

/** The toggle button cycles system → light → dark → system (matrix exits to system). */
export function nextThemePref(pref: ThemePref): ThemePref {
  if (pref === "system") return "light";
  if (pref === "light") return "dark";
  return "system";
}

export function getThemePref(): ThemePref {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePref(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** Applies a theme without saving it (used by the 10-second matrix easter egg). */
export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement;
  const resolved = resolveTheme(pref, darkQuery().matches);
  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
  root.style.colorScheme = resolved === "light" ? "light" : "dark";
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: pref }));
}

export function setThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage blocked (private mode): the theme still applies for this page view.
  }
  applyTheme(pref);
}

/** Re-applies "system" when the OS theme changes. Returns an unsubscribe function. */
export function watchSystemTheme(): () => void {
  const query = darkQuery();
  const onChange = () => {
    if (getThemePref() === "system") applyTheme("system");
  };
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
