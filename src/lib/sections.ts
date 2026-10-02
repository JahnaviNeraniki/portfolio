import { getCollection } from "astro:content";
import { copy, profile } from "../data/profile";
import { getProjects } from "./projects";

export interface HomeSection {
  id: keyof typeof copy.sections;
  label: string;
}

/** The home-page sections that are actually shown, in page order. */
export async function getHomeSections(): Promise<HomeSection[]> {
  const projects = await getProjects();
  const posts = await getCollection("posts", (post) => !post.data.draft);
  const ids: HomeSection["id"][] = [
    "about",
    ...(projects.some((project) => project.data.featured) ? (["featured"] as const) : []),
    "projects",
    "experience",
    "skills",
    ...(posts.length > 0 ? (["writing"] as const) : []),
    "contact",
  ];
  return ids.map((id) => ({ id, label: copy.sections[id] }));
}

/** This site's own repository: https://github.com/<handle>/<handle>.github.io */
export const sourceUrl = `${profile.links.github}/${profile.handle}.github.io`;
