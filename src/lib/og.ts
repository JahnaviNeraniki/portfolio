import { getCollection } from "astro:content";
import { copy, profile } from "../data/profile";
import { getProjects } from "./projects";

export interface OgPage {
  title: string;
  description: string;
}

/** Image key for a page path: "/" → "index", "/projects/documind/" → "projects/documind". */
export function ogKey(pathname: string): string {
  const trimmed = pathname.replace(/^\/|\/$/g, "").replace(/\.html$/, "");
  return trimmed || "index";
}

/** Every page that gets its own social preview image (name, headline, page title). */
export async function getOgPages(): Promise<Record<string, OgPage>> {
  const byline = `${profile.name} · ${profile.headline}`;
  const page = (title: string): OgPage => ({ title, description: byline });
  const projects = await getProjects();
  const posts = await getCollection("posts", (post) => !post.data.draft);
  return {
    index: { title: profile.name, description: profile.headline },
    uses: page(copy.uses.title),
    terminal: page(copy.terminal.pageTitle),
    ...Object.fromEntries(projects.map((p) => [`projects/${p.id}`, page(p.data.title)])),
    ...Object.fromEntries(posts.map((p) => [`posts/${p.id}`, page(p.data.title)])),
  };
}
