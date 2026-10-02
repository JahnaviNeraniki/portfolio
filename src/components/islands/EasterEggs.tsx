import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { copy } from "../../data/profile";
import { markEggFound } from "../../lib/eggs";
import { applyTheme, getThemePref } from "../../lib/theme";
import { withBase } from "../../lib/url";

interface Props {
  /** The site's own source repository, shown in the console greeting */
  sourceUrl: string;
}

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const MATRIX_MS = 10_000;
const CLICKS_NEEDED = 5;
const CLICK_WINDOW_MS = 2000;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

declare global {
  interface Window {
    claimEgg?: () => string;
  }
}

/** 4 hidden surprises. None of them block content, and all respect reduced motion. */
export default function EasterEggs({ sourceUrl }: Props) {
  const [secretFound, setSecretFound] = useState(false);

  useEffect(() => {
    // 1. DevTools console greeting.
    console.log(
      "%c  >_  \n%cHi, fellow developer. Source: " +
        sourceUrl +
        "\nTry the terminal: press `\nRun claimEgg() to count this egg.",
      "font: bold 28px monospace; color: #34d399;",
      "font: 13px monospace; color: #8b8cff;",
    );
    window.claimEgg = () => {
      markEggFound("console");
      return "🥚 Egg claimed! Type `eggs` in the terminal to see your progress.";
    };

    // 2. Konami code: confetti + toast.
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          markEggFound("konami");
          setSecretFound(true);
          if (!reducedMotion()) {
            void import("canvas-confetti").then(({ default: confetti }) =>
              confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.7 },
                disableForReducedMotion: true,
              }),
            );
          }
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);

    // 3. Click the monogram 5 times quickly: it spins and the site goes matrix for 10 s.
    const monogram = document.getElementById("monogram");
    let clicks: number[] = [];
    let matrixTimer = 0;
    const onMonogramClick = () => {
      const now = Date.now();
      clicks = [...clicks.filter((time) => now - time < CLICK_WINDOW_MS), now];
      if (clicks.length < CLICKS_NEEDED) return;
      clicks = [];
      markEggFound("monogram");
      monogram?.classList.remove("is-spinning");
      void monogram?.offsetWidth; // restart the animation
      monogram?.classList.add("is-spinning");
      applyTheme("matrix");
      window.clearTimeout(matrixTimer);
      matrixTimer = window.setTimeout(() => applyTheme(getThemePref()), MATRIX_MS);
    };
    monogram?.addEventListener("click", onMonogramClick);

    return () => {
      window.removeEventListener("keydown", onKey);
      monogram?.removeEventListener("click", onMonogramClick);
      window.clearTimeout(matrixTimer);
    };
  }, [sourceUrl]);

  // Auto-hide the secret toast after 10 s.
  useEffect(() => {
    if (!secretFound) return;
    const timer = window.setTimeout(() => setSecretFound(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [secretFound]);

  return (
    <div role="status" className="egg-toast-region">
      {secretFound && (
        <div className="toast flex items-center gap-3 !font-sans">
          <span>{copy.eggs.konami}</span>
          <a
            href={withBase("/#contact")}
            className="btn btn-primary !min-h-0 !py-1"
            onClick={() => setSecretFound(false)}
          >
            {copy.eggs.contact}
          </a>
          <button
            type="button"
            className="icon-btn !h-8 !min-w-8"
            aria-label="Dismiss"
            onClick={() => setSecretFound(false)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
