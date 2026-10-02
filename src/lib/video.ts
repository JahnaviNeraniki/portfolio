/** Extracts the video ID from a YouTube embed, watch or youtu.be URL. */
export function youtubeId(url: string | undefined): string | undefined {
  if (!url || url.includes("TODO")) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || undefined;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(parsed.hostname)) return undefined;
    if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] || undefined;
    return parsed.searchParams.get("v") ?? undefined;
  } catch {
    return undefined;
  }
}

/** Privacy-enhanced embed URL that starts playing as soon as the facade is clicked. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}
