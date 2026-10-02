// The site is served from a sub-path (base in astro.config.mjs, e.g. /portfolio).
// Every link to a page or file on this site goes through withBase().
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** "/uses" → "/portfolio/uses", "/#about" → "/portfolio/#about". External, mailto and "#" links are unchanged. */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (BASE && (path === BASE || path.startsWith(`${BASE}/`))) return path;
  return `${BASE}${path}`;
}

/** Removes the base from a pathname: "/portfolio/uses/" → "/uses/". */
export function withoutBase(pathname: string): string {
  return BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || "/" : pathname;
}
