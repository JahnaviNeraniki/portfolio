// Command palette index: 3 groups (Navigate, Actions, Projects), fuzzy-matched with Fuse.js.
import Fuse from "fuse.js";
import type { ProjectSummary } from "./terminal/commands";

export const PALETTE_GROUPS = ["Navigate", "Actions", "Projects"] as const;
export type PaletteGroup = (typeof PALETTE_GROUPS)[number];

export type PaletteAction =
  | "copy-email"
  | "download-resume"
  | "open-github"
  | "open-linkedin"
  | "toggle-theme"
  | "open-terminal";

export interface PaletteItem {
  id: string;
  group: PaletteGroup;
  title: string;
  /** Extra words that should find this item (e.g. a project's tech tags) */
  keywords: string[];
  href?: string;
  action?: PaletteAction;
}

export interface PaletteSource {
  /** Home-page sections present on the page, in order */
  sections: { id: string; label: string }[];
  projects: ProjectSummary[];
  /** Extra pages, e.g. /uses */
  pages: { href: string; label: string }[];
}

const ACTIONS: { action: PaletteAction; title: string; keywords: string[] }[] = [
  { action: "copy-email", title: "Copy email", keywords: ["mail", "contact", "clipboard"] },
  { action: "download-resume", title: "Download resume", keywords: ["cv", "pdf"] },
  { action: "open-github", title: "Open GitHub", keywords: ["code", "repos", "source"] },
  { action: "open-linkedin", title: "Open LinkedIn", keywords: ["profile", "connect"] },
  { action: "toggle-theme", title: "Toggle theme", keywords: ["dark", "light", "mode"] },
  { action: "open-terminal", title: "Open terminal", keywords: ["shell", "console", "cli"] },
];

export function buildPaletteItems({ sections, projects, pages }: PaletteSource): PaletteItem[] {
  return [
    ...sections.map((section) => ({
      id: `nav-${section.id}`,
      group: "Navigate" as const,
      title: section.label,
      keywords: ["section", section.id],
      href: `/#${section.id}`,
    })),
    ...projects.map((project) => ({
      id: `nav-case-${project.slug}`,
      group: "Navigate" as const,
      title: `${project.title} case study`,
      keywords: ["case study", project.slug],
      href: `/projects/${project.slug}`,
    })),
    ...pages.map((page) => ({
      id: `nav-page-${page.href}`,
      group: "Navigate" as const,
      title: page.label,
      keywords: ["page", page.href],
      href: page.href,
    })),
    ...ACTIONS.map(({ action, title, keywords }) => ({
      id: `action-${action}`,
      group: "Actions" as const,
      title,
      keywords,
      action,
    })),
    ...projects.map((project) => ({
      id: `project-${project.slug}`,
      group: "Projects" as const,
      title: project.title,
      keywords: [...project.tech, project.summary],
      href: `/projects/${project.slug}`,
    })),
  ];
}

export function createSearch(items: PaletteItem[]): (query: string) => PaletteItem[] {
  const fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: 2 },
      { name: "keywords", weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });
  return (query) => {
    const trimmed = query.trim();
    if (!trimmed) return items;
    // Keep group order (Navigate, Actions, Projects); Fuse ranks within each group.
    const ranked = fuse.search(trimmed).map((result) => result.item);
    return PALETTE_GROUPS.flatMap((group) => ranked.filter((item) => item.group === group));
  };
}
