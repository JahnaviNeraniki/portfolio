import { Suspense, lazy, useEffect, useState } from "react";
import { OPEN_PALETTE_EVENT } from "../../lib/events";
import type { PaletteSource } from "../../lib/search";
import type { PaletteSignal } from "./PaletteDialog";

const PaletteDialog = lazy(() => import("./PaletteDialog"));

interface Props {
  source: PaletteSource;
}

/**
 * Command palette launcher: listens for Ctrl/⌘ + K and the ⌘K button, and loads the palette
 * (with Fuse.js) on first open. Until then it renders nothing.
 */
export default function CommandPalette({ source }: Props) {
  const [signal, setSignal] = useState<PaletteSignal>({ id: 0, toggle: false });

  useEffect(() => {
    const request = (toggle: boolean) => setSignal((previous) => ({ id: previous.id + 1, toggle }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      request(true);
    };
    const onOpen = () => request(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  if (signal.id === 0) return null;
  return (
    <Suspense fallback={null}>
      <PaletteDialog source={source} signal={signal} />
    </Suspense>
  );
}
