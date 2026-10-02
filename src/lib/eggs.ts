// Easter-egg progress, remembered in localStorage. The terminal `eggs` command shows "2/4 found".

export const EGGS = ["konami", "monogram", "console", "404"] as const;
export type Egg = (typeof EGGS)[number];

const STORAGE_KEY = "eggs-found";

export function foundEggs(): Egg[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? EGGS.filter((egg) => stored.includes(egg)) : [];
  } catch {
    return [];
  }
}

export function markEggFound(egg: Egg): void {
  const found = new Set(foundEggs());
  found.add(egg);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
  } catch {
    // Storage blocked: the egg still works, it just isn't remembered.
  }
}

export function eggProgress(): { found: number; total: number } {
  return { found: foundEggs().length, total: EGGS.length };
}
