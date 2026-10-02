import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { copy, profile } from "../../data/profile";
import { eggProgress } from "../../lib/eggs";
import { setThemePref } from "../../lib/theme";
import { showToast } from "../../lib/toast";
import { withBase } from "../../lib/url";
import {
  complete,
  runCommand,
  type Action,
  type Line,
  type ProjectSummary,
  type Segment,
} from "../../lib/terminal/commands";

interface Props {
  projects: ProjectSummary[];
  /** The /terminal page: always open, fills the screen */
  fullscreen?: boolean;
  /** Increases each time the launcher asks the terminal to open */
  openSignal: number;
}

interface Entry {
  id: number;
  input?: string;
  lines: Line[];
  /** Lines fade in one after another (sudo hire-me) */
  staggered?: boolean;
}

const PROMPT = `${profile.handle}@portfolio:~$`;
const WELCOME: Line[] = [
  [{ text: copy.terminal.welcome }],
  [{ text: "Type " }, { text: "help", tone: "accent" }, { text: " to see what I can do." }],
];

const TONES: Record<NonNullable<Segment["tone"]>, string> = {
  accent: "text-accent",
  muted: "text-muted",
  success: "text-accent-2",
  error: "text-warn",
};

function renderSegment(segment: Segment, key: number): ReactNode {
  const className = segment.tone ? TONES[segment.tone] : undefined;
  if (segment.href) {
    const external = /^https?:\/\//.test(segment.href);
    return (
      <a
        key={key}
        href={withBase(segment.href)}
        className="text-accent underline"
        download={segment.download || undefined}
        rel={external ? "noopener" : undefined}
      >
        {segment.text}
      </a>
    );
  }
  return (
    <span key={key} className={className}>
      {segment.text}
    </span>
  );
}

/** Longest prefix shared by every string, used for Tab completion. */
function commonPrefix(values: string[]): string {
  return values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === value[i]) i += 1;
    return prefix.slice(0, i);
  });
}

/** The terminal UI. Loaded on first open by Terminal.tsx, so it costs nothing until used. */
export default function TerminalWindow({ projects, fullscreen = false, openSignal }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const nextId = useRef(1);
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: WELCOME }]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  // Position while walking history with ↑/↓; null = editing a new line.
  const [cursor, setCursor] = useState<number | null>(null);

  const open = useCallback(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => {
    if (fullscreen) window.location.href = withBase("/");
    else dialog.current?.close();
  }, [fullscreen]);

  useEffect(() => {
    if (fullscreen) inputRef.current?.focus();
    else if (openSignal > 0) open();
  }, [fullscreen, open, openSignal]);

  // Keep the newest output in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  const leaveTo = (href: string) => {
    if (!fullscreen) dialog.current?.close();
    window.location.href = withBase(href);
  };

  const perform = (action: Action) => {
    switch (action.type) {
      case "clear":
        setEntries([]);
        break;
      case "exit":
        close();
        break;
      case "navigate":
        leaveTo(action.href);
        break;
      case "download": {
        const anchor = document.createElement("a");
        anchor.href = withBase(action.href);
        anchor.download = "";
        anchor.click();
        break;
      }
      case "copy":
        navigator.clipboard
          .writeText(action.text)
          .catch(() => showToast("Could not copy. Select it instead."));
        break;
      case "theme":
        setThemePref(action.theme);
        break;
      case "hire-me":
        window.setTimeout(() => leaveTo("/#contact"), 1100);
        break;
    }
  };

  const submit = () => {
    const command = input.trim();
    const nextHistory = command ? [...history, command] : history;
    setHistory(nextHistory);
    setCursor(null);
    setInput("");
    const output = runCommand(command, {
      profile,
      projects,
      history: nextHistory,
      eggs: eggProgress(),
      now: new Date(),
      random: Math.random,
    });
    if (output.action?.type === "clear") {
      setEntries([]);
      return;
    }
    setEntries((previous) => [
      ...previous,
      {
        id: nextId.current++,
        input,
        lines: output.lines,
        staggered: output.action?.type === "hire-me",
      },
    ]);
    if (output.action) perform(output.action);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Tab") {
      event.preventDefault();
      const options = complete(input, { projects });
      if (options.length === 1) {
        setInput(`${options[0]} `);
      } else if (options.length > 1) {
        setInput(commonPrefix(options));
        setEntries((previous) => [
          ...previous,
          { id: nextId.current++, input, lines: [[{ text: options.join("  "), tone: "muted" }]] },
        ]);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const next = cursor === null ? history.length - 1 : Math.max(cursor - 1, 0);
      setCursor(next);
      setInput(history[next] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next] ?? "");
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    } else if (event.key === "Escape" && fullscreen) {
      close();
    }
  };

  const panel = (
    <div
      className="terminal flex h-full flex-col bg-bg text-text"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
        <p className="text-mono ml-2 flex-1 truncate text-muted">{PROMPT.replace("$", "")}</p>
        <button type="button" className="icon-btn" aria-label="Close terminal" onClick={close}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className="text-mono flex-1 overflow-y-auto px-4 py-3"
      >
        {entries.map((entry) => (
          <div key={entry.id} className={entry.staggered ? "terminal-staggered mb-2" : "mb-2"}>
            {entry.input !== undefined && (
              <p className="m-0 max-w-none">
                <span className="text-accent-2">{PROMPT}</span> {entry.input}
              </p>
            )}
            {entry.lines.map((row, i) => (
              <p key={i} className="m-0 max-w-none whitespace-pre-wrap break-words">
                {row.map(renderSegment)}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="text-mono flex items-center gap-2 border-t border-border px-4 py-3 focus-within:bg-surface">
        <label htmlFor="terminal-input" className="shrink-0 text-accent-2">
          {PROMPT}
        </label>
        <input
          ref={inputRef}
          id="terminal-input"
          className="min-w-0 flex-1 bg-transparent text-text caret-accent-2 outline-none"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setCursor(null);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="terminal-help"
        />
        <span id="terminal-help" className="sr-only">
          Type a command and press Enter. Type help to list commands.
        </span>
      </div>
    </div>
  );

  if (fullscreen) return <div className="terminal-page">{panel}</div>;

  return (
    <dialog
      ref={dialog}
      aria-label="Terminal"
      className="terminal-dialog"
      onClose={() => opener.current?.focus()}
    >
      {panel}
    </dialog>
  );
}
