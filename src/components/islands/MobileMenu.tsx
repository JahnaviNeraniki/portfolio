import { useRef, useState } from "react";
import { Menu, Search, SquareTerminal, X } from "lucide-react";
import { openPalette, openTerminal } from "../../lib/events";

interface Props {
  links: { href: string; label: string }[];
  labels: { search: string; terminal: string };
}

/** Under 768px: a menu button that opens a full-screen sheet (native <dialog>: focus trap + Esc). */
export default function MobileMenu({ links, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    dialog.current?.showModal();
    setOpen(true);
  };
  const close = () => dialog.current?.close();
  const closeThen = (action: () => void) => () => {
    close();
    action();
  };

  return (
    <>
      <button
        type="button"
        className="icon-btn md:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <dialog
        ref={dialog}
        aria-label="Menu"
        className="sheet m-0 h-dvh max-h-none w-full max-w-none bg-bg p-6 text-text"
        onClose={() => setOpen(false)}
      >
        <div className="flex justify-end">
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={close}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="mt-6 flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block py-3 font-display text-3xl font-semibold text-text no-underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={closeThen(openPalette)}>
            <Search size={18} aria-hidden="true" /> {labels.search}
          </button>
          <button type="button" className="btn" onClick={closeThen(openTerminal)}>
            <SquareTerminal size={18} aria-hidden="true" /> {labels.terminal}
          </button>
        </div>
      </dialog>
    </>
  );
}
