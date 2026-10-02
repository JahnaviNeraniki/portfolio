// Social preview images (1200×630 PNG), generated at build time: /og/index.png, /og/uses.png, ...
import { OGImageRoute } from "astro-og-canvas";
import { getOgPages } from "../../lib/og";

const FONTS = "./node_modules/@fontsource-variable";
// The Latin font subsets have no "→"; browsers fall back to a system font, the image renderer cannot.
const plain = (text: string) => text.replaceAll("→", "->");

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: await getOgPages(),
  getSlug: (path) => `${path}.png`,
  getImageOptions: (_, page) => ({
    title: plain(page.title),
    description: plain(page.description),
    // Dark theme background with the accent on the left edge.
    bgGradient: [
      [11, 13, 16],
      [20, 23, 28],
    ],
    border: { color: [139, 140, 255], width: 16, side: "inline-start" },
    padding: 80,
    fonts: [
      `${FONTS}/inter-tight/files/inter-tight-latin-wght-normal.woff2`,
      `${FONTS}/inter/files/inter-latin-wght-normal.woff2`,
    ],
    font: {
      title: {
        families: ["Inter Tight Variable", "Inter Tight"],
        weight: "Bold",
        size: 76,
        color: [232, 234, 237],
      },
      description: {
        families: ["Inter Variable", "Inter"],
        size: 38,
        color: [154, 160, 166],
        lineHeight: 1.4,
      },
    },
  }),
});
