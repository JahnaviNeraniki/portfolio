const TODO_PREFIX = /^TODO:\s*/;

/** "Jane Q. Doe" → "JD". Ignores a leading "TODO:" so placeholders still give a monogram. */
export function initials(name: string): string {
  const words = name.replace(TODO_PREFIX, "").trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-03" → "Mar 2024". Anything else (e.g. "Present" or a placeholder) is returned as is. */
export function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

/** True while a value is still an owner placeholder. */
export function isTodo(value: string | undefined): boolean {
  return value === undefined || value.includes("TODO");
}
