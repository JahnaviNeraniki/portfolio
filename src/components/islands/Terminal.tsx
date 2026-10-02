import { Suspense, lazy, useEffect, useState } from "react";
import { OPEN_TERMINAL_EVENT } from "../../lib/events";
import type { ProjectSummary } from "../../lib/terminal/commands";

const TerminalWindow = lazy(() => import("./TerminalWindow"));

interface Props {
  projects: ProjectSummary[];
  /** The /terminal page: always open, fills the screen */
  fullscreen?: boolean;
}

/** True when a key press belongs to a text field, so ` should type instead of open the terminal. */
function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Terminal launcher: listens for ` and the >_ button, and loads the terminal UI on first open.
 * Until then it renders nothing and ships almost no JavaScript.
 */
export default function Terminal({ projects, fullscreen = false }: Props) {
  const [openSignal, setOpenSignal] = useState(0);

  useEffect(() => {
    if (fullscreen) return;
    const request = () => setOpenSignal((count) => count + 1);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "`" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      request();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_TERMINAL_EVENT, request);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_TERMINAL_EVENT, request);
    };
  }, [fullscreen]);

  if (!fullscreen && openSignal === 0) return null;
  return (
    <Suspense fallback={null}>
      <TerminalWindow projects={projects} fullscreen={fullscreen} openSignal={openSignal} />
    </Suspense>
  );
}
