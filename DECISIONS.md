# Decisions

Choices made where the spec was silent or could not be followed literally. Newest at the bottom.

## Step 1 (P0 Setup)

| #   | Decision                                                                                     | Why                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Node 24 LTS** (`.nvmrc`, CI, `engines >=22.12`) instead of Node 20                         | Latest Astro (7.3.5), `@astrojs/react` 7 and Vitest 5 require Node ≥ 22.12. Node 20 reached end-of-life in April 2026. Node 24 meets the spec's "20 LTS minimum".                                 |
| 2   | **TypeScript 6.0.3**, not 7.0                                                                | `@astrojs/check` accepts `^5 \|\| ^6` and `typescript-eslint` accepts `<6.1.0`. TS 7 (the native port) is not supported by either yet.                                                            |
| 3   | **No `eslint-plugin-jsx-a11y`**                                                              | It does not support ESLint 10. Accessibility is enforced by Playwright + axe (0 serious/critical) instead.                                                                                        |
| 4   | **Content schema at `src/content.config.ts`**, not `src/content/config.ts`                   | Astro 6+ removed the legacy location and throws `LegacyContentConfigError` for it.                                                                                                                |
| 5   | Project frontmatter image paths are `../../assets/projects/documind/…`                       | Paths are relative to the `.mdx` file; the spec's `./documind/poster.jpg` would point inside `src/content/`, but the repo layout keeps assets in `src/assets/projects/documind/`.                 |
| 6   | `video` starting with `TODO` renders the poster with "Demo coming soon"                      | Lets the site build and look finished before the YouTube video exists.                                                                                                                            |
| 7   | **`src/data/site.ts`** holds the Formspree ID and GoatCounter code                           | These are service settings, not personal content, and `Profile`'s interface is fixed by the spec. Empty value = feature off.                                                                      |
| 8   | `robots.txt` is generated (`src/pages/robots.txt.ts`) instead of a file in `public/`         | The sitemap URL then follows `site` in `astro.config.mjs`, so the username lives in one place.                                                                                                    |
| 9   | `@lhci/cli` is **not** a project dependency; CI runs it with `npx`                           | It pulled in 9 high-severity advisories (basic-ftp, tmp, extract-zip) via Lighthouse/puppeteer. As a CI-only tool it does not need to be in the lock file, which now audits to 0 vulnerabilities. |
| 10  | Placeholder links are valid URLs containing `TODO` (e.g. `https://github.com/TODO-username`) | A bare `"TODO: …"` string in an `href` becomes a broken relative link; these stay obvious and are listed by `npm run todo`.                                                                       |
| 11  | Skills are pre-filled from DocuMind's tech stack (marked TODO to review)                     | They come from the owner's own DocuMind spec, so nothing is invented; the owner adds the rest.                                                                                                    |
| 12  | Placeholder `photo.jpg`, `poster.jpg`, `architecture.png`, `resume.pdf` are generated        | `astro:assets` and the resume link need real files to build; each says "TODO: replace".                                                                                                           |

## Free-plan limits (checked 2026-10-01)

| Service      | Free plan                                                                   | Fit                                 |
| ------------ | --------------------------------------------------------------------------- | ----------------------------------- |
| Formspree    | 50 submissions/month, unlimited forms, 30-day archive, basic spam filtering | Plenty for a portfolio contact form |
| GoatCounter  | Free for "reasonable public usage"; no published pageview cap; no cookies   | Plenty for a portfolio              |
| GitHub Pages | ~1 GB site size, soft 100 GB/month bandwidth (per GitHub docs)              | Far above a portfolio's needs       |

## Step 2 (P1 Design system + layout)

| #   | Decision                                                                                                                       | Why                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 13  | Site wording (nav labels, footer line, button text) lives in a `copy` export in `profile.ts`                                   | "Every sentence comes from profile.ts" while keeping the spec's `Profile` interface unchanged. ARIA labels stay in components. |
| 14  | Theme toggle cycles **system → light → dark**; `matrix` is reached only from the terminal / easter egg                         | The spec asks for light, dark and system; a single button cycling all three is the simplest UI.                                |
| 15  | Toggle icon visibility is driven by CSS from `data-theme-pref` on `<html>`                                                     | The right icon shows before React hydrates, so the icon never flickers.                                                        |
| 16  | Theme toggle icon animation, overlay open animation and card hover use CSS transitions, not Motion                             | Each is a 150–250 ms opacity/transform change that CSS does with 0 KB of JS; reduced motion turns all of them off in one rule. |
| 17  | Mobile menu, and later the palette and terminal, use the native `<dialog>` with `showModal()`                                  | Gives a focus trap, Esc to close, an inert background and focus return for free.                                               |
| 18  | Fonts load only the Latin `woff2` file of each variable font via hand-written `@font-face`; Inter Tight (display) is preloaded | The spec's "subset to Latin, font-display: swap, display font preloaded".                                                      |
| 19  | Local browser checks run against the installed Chrome (`channel: "chrome"`)                                                    | Playwright's own Chromium download timed out on this machine; CI installs it normally.                                         |
