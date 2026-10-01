import { describe, expect, it } from "vitest";
import { findTodos, formatTodos } from "../../scripts/todo.mjs";

describe("todo scanner", () => {
  it("finds the placeholders in profile.ts", () => {
    const todos = findTodos();
    expect(todos.some((t) => t.file === "src/data/profile.ts" && t.text.includes("TODO:"))).toBe(
      true,
    );
  });

  it("formats each entry as file:line text", () => {
    const out = formatTodos([
      { file: "src/data/profile.ts", line: 3, text: 'name: "TODO: Full Name"' },
    ]);
    expect(out).toBe('  src/data/profile.ts:3  name: "TODO: Full Name"');
  });
});
