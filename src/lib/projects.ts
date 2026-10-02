import { getCollection, type CollectionEntry } from "astro:content";
import { profile, type SkillGroup } from "../data/profile";

export type Project = CollectionEntry<"projects">;

/** Published (non-draft) projects, sorted by `order`. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects", (project) => !project.data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** Filter chips on the Projects section. Each matches a project by its tech list. */
export const PROJECT_FILTERS = ["All", "Python", "AI", "Backend", "Frontend"] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

const FILTER_GROUPS: Partial<Record<ProjectFilter, SkillGroup>> = {
  AI: "AI & LLMs",
  Backend: "Backend",
  Frontend: "Frontend",
};

const lower = (items: string[]) => items.map((item) => item.toLowerCase());

/** Which filters a project matches; uses the skill groups in profile.ts to classify tech. */
export function projectFilters(tech: string[]): ProjectFilter[] {
  const projectTech = lower(tech);
  return PROJECT_FILTERS.filter((filter) => {
    if (filter === "All") return true;
    const group = FILTER_GROUPS[filter];
    const groupItems = group
      ? lower(profile.skills.find((skill) => skill.group === group)?.items ?? [])
      : [filter.toLowerCase()];
    return projectTech.some((item) => groupItems.includes(item));
  });
}

export function filterSlug(filter: ProjectFilter): string {
  return filter.toLowerCase();
}
