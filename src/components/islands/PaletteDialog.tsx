import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { copy, profile } from "../../data/profile";
import { openTerminal } from "../../lib/events";
import {
  PALETTE_GROUPS,
  buildPaletteItems,
  createSearch,
  type PaletteItem,
  type PaletteSource,
} from "../../lib/search";
import { setThemePref } from "../../lib/theme";
import { showToast } from "../../lib/toast";
import { withBase } from "../../lib/url";

export interface PaletteSignal {
  /** Increases with every request from the launcher */
  id: number;
  /** Ctrl/⌘ + K toggles; the nav button only opens */
  toggle: boolean;
}

interface Props {
  source: PaletteSource;
  signal: PaletteSignal;
}

const optionId = (item: PaletteItem) => `palette-${item.id.replace(/[^a-z0-9-]/gi, "-")}`;

/**
 * Search over pages, actions and projects (WAI-ARIA combobox inside a modal dialog).
 * Loaded on first open by CommandPalette.tsx, so Fuse.js costs nothing until used.
 */
export default function PaletteDialog({ source, signal }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const search = useMemo(() => createSearch(buildPaletteItems(source)), [source]);
  const results = useMemo(() => search(query), [search, query]);
  const activeItem = results[active];

  const open = useCallback(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setActive(0);
    element.showModal();
    inputRef.current?.focus();
  }, []);

  const close = () => dialog.current?.close();

  useEffect(() => {
    if (signal.id === 0) return;
    if (signal.toggle && dialog.current?.open) dialog.current.close();
    else open();
  }, [signal, open]);

  // Keep the highlighted option visible while moving with the arrow keys.
  useEffect(() => {
    if (activeItem)
      document.getElementById(optionId(activeItem))?.scrollIntoView({ block: "nearest" });
  }, [activeItem]);

  const run = (item: PaletteItem) => {
    close();
    if (item.href) {
      window.location.href = withBase(item.href);
      return;
    }
    switch (item.action) {
      case "copy-email":
        navigator.clipboard
          .writeText(profile.email)
          .then(() => showToast(copy.contact.copied))
          .catch(() => showToast(profile.email));
        break;
      case "download-resume": {
        const anchor = document.createElement("a");
        anchor.href = profile.links.resume;
        anchor.download = "";
        anchor.click();
        break;
      }
      case "open-github":
        window.location.href = profile.links.github;
        break;
      case "open-linkedin":
        window.location.href = profile.links.linkedin;
        break;
      case "toggle-theme":
        setThemePref(document.documentElement.dataset.theme === "light" ? "dark" : "light");
        break;
      case "open-terminal":
        openTerminal();
        break;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(results.length - 1);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      run(activeItem);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-label={copy.palette.label}
      className="palette-dialog"
      onClose={() => opener.current?.focus()}
      onClick={(event) => {
        // Click on the backdrop closes the palette.
        if (event.target === dialog.current) close();
      }}
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search size={18} aria-hidden="true" className="shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
          aria-label={copy.palette.label}
          placeholder={copy.palette.placeholder}
          className="h-14 min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="text-mono rounded border border-border px-1.5 text-muted">esc</kbd>
      </div>

      <div
        id="palette-listbox"
        role="listbox"
        aria-label={copy.palette.results}
        className="max-h-[50vh] overflow-y-auto p-2"
      >
        {results.length === 0 && (
          <p className="px-3 py-6 text-center text-muted" role="presentation">
            {copy.palette.noResults} “{query}”
          </p>
        )}
        {PALETTE_GROUPS.map((group) => {
          const items = results.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div
              key={group}
              role="group"
              aria-labelledby={`palette-group-${group}`}
              className="mb-2"
            >
              <p
                id={`palette-group-${group}`}
                className="text-mono m-0 px-3 py-1 text-muted"
                role="presentation"
              >
                {group}
              </p>
              {items.map((item) => {
                const selected = item === activeItem;
                return (
                  <div
                    key={item.id}
                    id={optionId(item)}
                    role="option"
                    aria-selected={selected}
                    className={`cursor-pointer rounded-lg px-3 py-2 ${selected ? "bg-accent text-accent-contrast" : "text-text"}`}
                    onMouseMove={() => setActive(results.indexOf(item))}
                    onClick={() => run(item)}
                  >
                    {item.title}
                    {item.group === "Projects" && (
                      <span className={`ml-2 text-sm ${selected ? "" : "text-muted"}`}>
                        {item.keywords.slice(0, 4).join(" · ")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p
        className="text-mono m-0 max-w-none border-t border-border px-4 py-2 text-muted"
        aria-hidden="true"
      >
        ↑↓ move · ↵ select · esc close
      </p>
    </dialog>
  );
}
