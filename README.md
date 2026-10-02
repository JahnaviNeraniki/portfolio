# Portfolio

Personal portfolio for an AI Engineer, built with Astro and hosted free on GitHub Pages.

> Full editing and deployment guide is completed in the final step of the build.

## Run locally

Requires Node 24 (`nvm use 24`).

```bash
npm install
npm run dev      # http://localhost:4321
```

## Scripts

| Script            | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Local site at http://localhost:4321                                 |
| `npm run build`   | Static output in `dist/`                                            |
| `npm run preview` | Serve the built site                                                |
| `npm run check`   | Type check, lint, unit tests, build — must pass before every commit |
| `npm run todo`    | Lists every `TODO:` placeholder still to fill in                    |

## Edit your content

All text lives in [`src/data/profile.ts`](src/data/profile.ts) and the Markdown in `src/content/`. You never need to touch a component to change the site's text.
