// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { todoWarnings } from "./scripts/todo.mjs";

// Live at https://jahnavineraniki.github.io/portfolio/ — GitHub Pages serves a repo named
// "portfolio" from the /portfolio sub-path, so every internal link uses withBase() (src/lib/url.ts).
const SITE = "https://jahnavineraniki.github.io";
const BASE = "/portfolio";

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [react(), mdx(), sitemap(), todoWarnings()],
  vite: {
    plugins: [tailwindcss()],
  },
});
