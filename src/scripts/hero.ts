// Hero enhancements: the typed headline and the star-field background.
import { THEME_CHANGE_EVENT } from "../lib/theme";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Headline typed out once, about 1.2s total ----------
const typed = document.querySelector<HTMLElement>("[data-typed]");
if (typed && !reducedMotion) {
  const text = (typed.textContent ?? "").trim();
  const step = 1200 / Math.max(text.length, 1);
  let shown = 0;
  typed.textContent = "";
  typed.classList.add("is-typing");
  const timer = window.setInterval(() => {
    shown += 1;
    typed.textContent = text.slice(0, shown);
    if (shown >= text.length) {
      window.clearInterval(timer);
      window.setTimeout(() => typed.classList.remove("is-typing"), 1200);
    }
  }, step);
}

// ---------- Star field: twinkles gently and drifts a little with the cursor ----------
const canvas = document.querySelector<HTMLCanvasElement>(".star-field");
const context = canvas?.getContext("2d");

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function isLowPower(): boolean {
  const nav = navigator as Navigator & NavigatorHints;
  return (
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
}

if (canvas && context) {
  const DENSITY = 2600; // px² of sky per star
  const DRIFT = 14; // max px the nearest stars move with the cursor
  const FRAME_MS = 1000 / 60; // max 60 fps
  const animate = !reducedMotion && !isLowPower();

  let width = 0;
  let height = 0;
  let color = "#f5f3ff";
  let stars: Star[] = [];
  let target = { x: 0, y: 0 }; // cursor offset from the centre, -1..1
  let drift = { x: 0, y: 0 }; // eased towards target
  let visible = true;
  let frame = 0;
  let lastFrame = 0;

  function readColor() {
    color = getComputedStyle(document.documentElement).getPropertyValue("--star").trim() || color;
  }

  function resize() {
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.round((width * height) / DENSITY) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.25,
      phase: Math.random() * Math.PI * 2,
    }));
    readColor();
    draw(0);
  }

  function draw(time: number) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    for (const star of stars) {
      // Bigger (nearer) stars twinkle more and drift further: a light parallax.
      const twinkle = animate ? (Math.sin(time / 900 + star.phase) + 1) / 2 : 0.6;
      context.globalAlpha = 0.25 + 0.6 * twinkle * (star.r / 1.55);
      const depth = star.r / 1.55;
      context.beginPath();
      context.arc(
        star.x - drift.x * DRIFT * depth,
        star.y - drift.y * DRIFT * depth,
        star.r,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }

  function loop(time: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - lastFrame >= FRAME_MS) {
      lastFrame = time;
      drift = {
        x: drift.x + (target.x - drift.x) * 0.06,
        y: drift.y + (target.y - drift.y) * 0.06,
      };
      draw(time);
    }
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (animate && !frame) frame = requestAnimationFrame(loop);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener(THEME_CHANGE_EVENT, () => {
    readColor();
    draw(performance.now());
  });

  if (animate) {
    const hero = canvas.parentElement ?? canvas;
    hero.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      target = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      };
    });
    hero.addEventListener("pointerleave", () => (target = { x: 0, y: 0 }));
    document.addEventListener("visibilitychange", start);
    // Pause when the hero is off-screen.
    new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    }).observe(canvas);
    start();
  }
}
