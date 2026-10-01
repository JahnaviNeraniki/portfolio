// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { todoWarnings } from "./scripts/todo.mjs";

// TODO: replace TODO-username with your GitHub username (the repo must be named <username>.github.io).
// No `base` is set: a user-site repo is served from the root URL.
const SITE = "https://TODO-username.github.io";

export default defineConfig({
  site: SITE,
  integrations: [react(), mdx(), sitemap(), todoWarnings()],
  vite: {
    plugins: [tailwindcss()],
  },
});
