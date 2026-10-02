import type { ImageMetadata } from "astro";

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/** Resolves a path like "/src/assets/photo.jpg" (from profile.ts) to an optimisable image. */
export function resolveImage(path: string): ImageMetadata {
  const image = images[path]?.default;
  if (!image) {
    throw new Error(`Image not found: ${path}. Put it in src/assets/ and check profile.ts.`);
  }
  return image;
}
