// Hero enhancements: the typed headline and the dot-grid background.
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

// ---------- Dot grid that bends slightly toward the cursor ----------
const canvas = document.querySelector<HTMLCanvasElement>(".dot-grid");
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

if (canvas && context) {
  const GAP = 28; // px between dots
  const RADIUS = 1.2; // dot radius
  const REACH = 140; // px around the cursor that bends
  const PULL = 10; // max px a dot moves
  const FRAME_MS = 1000 / 60; // max 60 fps
  const animate = !reducedMotion && !isLowPower();

  let width = 0;
  let height = 0;
  let color = "#888";
  let pointer: { x: number; y: number } | null = null;
  let visible = true;
  let frame = 0;
  let lastFrame = 0;
  // Current displacement of each dot, eased toward its target every frame.
  let offsets = new Float32Array(0);

  const columns = () => Math.ceil(width / GAP) + 1;
  const rows = () => Math.ceil(height / GAP) + 1;

  function resize() {
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    offsets = new Float32Array(columns() * rows() * 2);
    readColor();
    draw();
  }

  function readColor() {
    color = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || color;
  }

  /** Draws one frame; returns true while dots are still moving. */
  function draw(): boolean {
    if (!context) return false;
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.globalAlpha = 0.45;
    let moving = false;
    const cols = columns();
    for (let row = 0; row < rows(); row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * GAP;
        const y = row * GAP;
        const i = (row * cols + col) * 2;
        let targetX = 0;
        let targetY = 0;
        if (pointer) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const distance = Math.hypot(dx, dy);
          if (distance < REACH && distance > 0) {
            const strength = (1 - distance / REACH) * PULL;
            targetX = (dx / distance) * strength;
            targetY = (dy / distance) * strength;
          }
        }
        const ox = (offsets[i] ?? 0) + (targetX - (offsets[i] ?? 0)) * 0.15;
        const oy = (offsets[i + 1] ?? 0) + (targetY - (offsets[i + 1] ?? 0)) * 0.15;
        offsets[i] = ox;
        offsets[i + 1] = oy;
        if (Math.abs(targetX - ox) > 0.05 || Math.abs(targetY - oy) > 0.05) moving = true;
        context.beginPath();
        context.arc(x + ox, y + oy, RADIUS, 0, Math.PI * 2);
        context.fill();
      }
    }
    return moving;
  }

  function loop(time: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - lastFrame < FRAME_MS) {
      frame = requestAnimationFrame(loop);
      return;
    }
    lastFrame = time;
    // Keep animating only while the dots are still settling.
    if (draw()) frame = requestAnimationFrame(loop);
  }

  function start() {
    if (animate && !frame) frame = requestAnimationFrame(loop);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener(THEME_CHANGE_EVENT, () => {
    readColor();
    draw();
  });

  if (animate) {
    const hero = canvas.parentElement ?? canvas;
    hero.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      start();
    });
    hero.addEventListener("pointerleave", () => {
      pointer = null;
      start();
    });
    // Pause when the hero is off-screen.
    new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    }).observe(canvas);
  }
}
