import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  THEME_CHANGE_EVENT,
  getThemePref,
  isThemePref,
  nextThemePref,
  setThemePref,
  watchSystemTheme,
  type ThemePref,
} from "../../lib/theme";

const LABELS: Record<ThemePref, string> = {
  system: "system",
  light: "light",
  dark: "dark",
  matrix: "matrix",
};

/** Cycles system → light → dark. Which icon shows is driven by CSS (data-theme-pref on <html>). */
export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(getThemePref());
    const onChange = (event: Event) => {
      if (event instanceof CustomEvent && isThemePref(event.detail)) setPref(event.detail);
    };
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    const unwatch = watchSystemTheme();
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onChange);
      unwatch();
    };
  }, []);

  const next = nextThemePref(pref);

  return (
    <button
      type="button"
      className="icon-btn relative"
      aria-label={`Theme: ${LABELS[pref]}. Switch to ${LABELS[next]}`}
      title={`Theme: ${LABELS[pref]}`}
      onClick={() => setThemePref(next)}
    >
      <Sun size={18} className="theme-icon theme-icon-light" aria-hidden="true" />
      <Moon size={18} className="theme-icon theme-icon-dark" aria-hidden="true" />
      <Monitor size={18} className="theme-icon theme-icon-system" aria-hidden="true" />
    </button>
  );
}
