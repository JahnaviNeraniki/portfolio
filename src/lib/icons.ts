// Build-time lookup of Simple Icons (CC0) by tech name. Used only in .astro files, so no client JS.
import * as simpleIcons from "simple-icons";

export interface BrandIcon {
  title: string;
  path: string;
}

// Names in profile.ts that differ from the Simple Icons title.
const ALIASES: Record<string, string> = {
  mcp: "model context protocol",
  kafka: "apache kafka",
  jwt: "json web tokens",
  "material ui": "mui",
  java: "openjdk",
  "spring ai": "spring",
  "spring data jpa": "spring",
};

const byTitle = new Map<string, BrandIcon>();
for (const icon of Object.values(simpleIcons)) {
  if (typeof icon === "object" && "title" in icon && "path" in icon) {
    byTitle.set(icon.title.toLowerCase(), { title: icon.title, path: icon.path });
  }
}

export function brandIcon(name: string): BrandIcon | undefined {
  const key = name.toLowerCase();
  return byTitle.get(ALIASES[key] ?? key);
}
