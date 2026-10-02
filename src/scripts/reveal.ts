// Section reveal: adds .is-visible once, when a .reveal element scrolls into view.
// CSS (global.css) does the fade + 12px rise; under reduced motion the CSS never hides anything.
const targets = document.querySelectorAll<HTMLElement>(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const target of targets) observer.observe(target);
} else {
  for (const target of targets) target.classList.add("is-visible");
}
