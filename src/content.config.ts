import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      role: z.string(),
      year: z.number().int(),
      featured: z.boolean().default(false),
      order: z.number().int(),
      status: z.enum(["Completed", "In progress"]),
      repo: z.string().optional(),
      /** YouTube embed URL; a value starting with "TODO" shows the poster with "Demo coming soon". */
      video: z.string().optional(),
      poster: image().optional(),
      cover: image().optional(),
      tech: z.array(z.string()).min(1),
      /** Copied from the project's latest eval run; never invented. */
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts };
