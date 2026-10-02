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
    // Space theme: navy night sky with a violet edge.
    bgGradient: [
      [7, 11, 30],
      [30, 20, 70],
    ],
    border: { color: [167, 139, 250], width: 16, side: "inline-start" },
    padding: 80,
    fonts: [
      `${FONTS}/sora/files/sora-latin-wght-normal.woff2`,
      `${FONTS}/dm-sans/files/dm-sans-latin-wght-normal.woff2`,
    ],
    font: {
      title: {
        families: ["Sora Variable", "Sora"],
        weight: "Bold",
        size: 76,
        color: [245, 243, 255],
      },
      description: {
        families: ["DM Sans Variable", "DM Sans"],
        size: 38,
        color: [169, 166, 201],
        lineHeight: 1.4,
      },
    },
  }),
});
