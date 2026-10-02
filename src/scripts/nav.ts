// Small progressive enhancements for the sticky nav. Everything works without it.
import { openPalette, openTerminal } from "../lib/events";

// ⌘K and >_ buttons talk to the palette and terminal islands through window events.
for (const button of document.querySelectorAll("[data-open-palette]")) {
  button.addEventListener("click", openPalette);
}
for (const button of document.querySelectorAll("[data-open-terminal]")) {
  button.addEventListener("click", openTerminal);
}

// 2px scroll-progress bar under the nav.
const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
if (bar) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };
  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

// Highlight the nav link of the section currently in view (home page only).
const links = new Map<string, HTMLElement>();
for (const link of document.querySelectorAll<HTMLElement>("[data-nav-link]")) {
  const id = link.dataset.navLink;
  if (id) links.set(id, link);
}
const sections = [...links.keys()]
  .map((id) => document.getElementById(id))
  .filter((section): section is HTMLElement => section !== null);

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const [id, link] of links) {
          if (id === entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }
    },
    // A section counts as current when it crosses the band 40–45% down the viewport.
    { rootMargin: "-40% 0px -55% 0px" },
  );
  for (const section of sections) observer.observe(section);
}
