import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { findTodos, formatTodos } from "../../scripts/todo.mjs";

// A throwaway project folder, so the test never depends on the real content.
const root = mkdtempSync(join(tmpdir(), "todo-test-"));
mkdirSync(join(root, "src", "data"), { recursive: true });
writeFileSync(
  join(root, "src", "data", "profile.ts"),
  [
    'name: "TODO: Full Name",',
    'github: "https://github.com/TODO-username",',
    'city: "Hyderabad",',
  ].join("\n"),
);
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("todo scanner", () => {
  it("finds TODO: text and TODO- placeholders, skipping filled lines", () => {
    expect(findTodos(root).map((t) => t.line)).toEqual([1, 2]);
  });

  it("reports the path relative to the project root", () => {
    expect(findTodos(root)[0]?.file).toBe("src/data/profile.ts");
  });

  it("formats each entry as file:line text", () => {
    const out = formatTodos([
      { file: "src/data/profile.ts", line: 3, text: 'name: "TODO: Full Name"' },
    ]);
    expect(out).toBe('  src/data/profile.ts:3  name: "TODO: Full Name"');
  });
});
