// Window events the static nav buttons use to talk to the interactive islands.

export const OPEN_TERMINAL_EVENT = "portfolio:open-terminal";
export const OPEN_PALETTE_EVENT = "portfolio:open-palette";

export function openTerminal(): void {
  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT));
}

export function openPalette(): void {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}
