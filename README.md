# Neraniki Jahnavi — Portfolio

Personal portfolio site, built with [Astro](https://astro.build) and hosted free on GitHub Pages at
**https://jahnavineraniki.github.io**.

It has a terminal mode (press <kbd>`</kbd>), a command palette (<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd>),
light/dark themes and a few easter eggs. It ships static HTML, with JavaScript only for the
interactive parts.

## Run it locally

Requires **Node 24** (`nvm use 24`).

```bash
npm install
npm run dev       # http://localhost:4321
```

| Script            | What it does                                                |
| ----------------- | ----------------------------------------------------------- |
| `npm run dev`     | Local site at http://localhost:4321, reloads as you edit    |
| `npm run build`   | Builds the static site into `dist/`                         |
| `npm run preview` | Serves the built `dist/` folder                             |
| `npm run check`   | Type check, lint, unit tests and build — run before pushing |
| `npm run todo`    | Lists any `TODO:` placeholders still left in the content    |
| `npm run format`  | Formats every file with Prettier                            |

## Edit the content

You never need to touch a component to change the site's text.

| What                                                                   | Where                                        |
| ---------------------------------------------------------------------- | -------------------------------------------- |
| Name, headline, about, experience, skills, education, links, fun facts | `src/data/profile.ts` (the `profile` object) |
| Button labels, section titles, short lines                             | `src/data/profile.ts` (the `copy` object)    |
| Photo                                                                  | `src/assets/photo.jpg` (square, 800 px+)     |
| Resume                                                                 | `public/resume.pdf`                          |
| Projects / case studies                                                | `src/content/projects/*.mdx`                 |
| Blog posts (optional)                                                  | `src/content/posts/*.md`                     |
| Contact form and analytics                                             | `src/data/site.ts`                           |

### Publish DocuMind when it's ready

DocuMind is already set up in `src/content/projects/documind.mdx` but hidden with `draft: true`.

1. Fill in the `TODO` values: `status`, the YouTube `video` embed URL (unlisted), and the 4 `metrics`
   from DocuMind's latest eval run.
2. Replace `src/assets/projects/documind/poster.jpg` and `architecture.png` with the real images.
3. Write the case study body.
4. Delete the `draft: true` line. The featured section, the "View DocuMind" button, the terminal's
   `projects` command and the palette all pick it up automatically.

### Add a blog post

Copy `src/content/posts/example-post.md`, change the frontmatter, and set `draft: false`. The Writing
section, `/posts/<name>` page and `/rss.xml` feed appear automatically.

### Turn on the contact form and analytics (both free, optional)

In `src/data/site.ts`:

- `formspreeId` — create a form at [formspree.io](https://formspree.io) (free: 50 submissions/month)
  and paste the ID from `https://formspree.io/f/<ID>`. Until then, Contact shows an "Email me" button.
- `goatcounterCode` — sign up at [goatcounter.com](https://www.goatcounter.com) (free, no cookies)
  and paste your site code (the part before `.goatcounter.com`).

## Deploy (GitHub Pages, free)

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

**One-time setup:**

1. Create a **public** GitHub repository named exactly **`JahnaviNeraniki.github.io`** (empty: no
   README, .gitignore or licence).
2. Push this project to its `main` branch:
   ```bash
   git remote add origin https://github.com/JahnaviNeraniki/JahnaviNeraniki.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open the **Actions** tab. When the "Deploy to GitHub Pages" run is green (about 1–2 minutes), the
   site is live at https://jahnavineraniki.github.io.

After that, every `git push` to `main` redeploys the site.

### Custom domain (optional)

Add `public/CNAME` containing just the domain (e.g. `yourname.dev`), set `SITE` in
`astro.config.mjs` to `https://yourname.dev`, add the DNS records from GitHub's
"Managing a custom domain" docs at your registrar, then enter the domain under
**Settings → Pages** and tick **Enforce HTTPS**.

## Project layout

```
src/
  data/profile.ts        all personal content and site wording
  data/site.ts           Formspree and GoatCounter settings
  content/               projects (MDX) and posts (Markdown)
  components/sections/   home-page sections (static HTML)
  components/islands/    interactive React parts: terminal, palette, theme, menu, easter eggs
  components/ui/         nav, footer, buttons, cards, tags, video embed
  lib/                   terminal commands, search, theme, helpers
  pages/                 routes: /, /uses, /terminal, /posts/*, 404, OG images, robots.txt
  styles/global.css      design tokens (colours, fonts, spacing) and shared styles
```

Choices made while building are recorded in [DECISIONS.md](DECISIONS.md).
