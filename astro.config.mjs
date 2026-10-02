// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { todoWarnings } from "./scripts/todo.mjs";

// Your GitHub Pages URL. The repo must be named JahnaviNeraniki.github.io.
// No `base` is set: a user-site repo is served from the root URL.
const SITE = "https://jahnavineraniki.github.io";

export default defineConfig({
  site: SITE,
  integrations: [react(), mdx(), sitemap(), todoWarnings()],
  vite: {
    plugins: [tailwindcss()],
  },
});
