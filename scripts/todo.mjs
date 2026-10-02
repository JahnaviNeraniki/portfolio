// Lists every "TODO:" placeholder the owner still has to fill in.
// Used by `npm run todo` and by the build (as a warning).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN = ["astro.config.mjs", "src/data", "src/content"];
const EXTENSIONS = /\.(ts|mjs|md|mdx)$/;
// "TODO:" in text, "TODO-" inside placeholder URLs and usernames.
const MARKER = /TODO[:-]/;

/** @param {string} path @returns {string[]} */
function listFiles(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return EXTENSIONS.test(path) ? [path] : [];
  return readdirSync(path).flatMap((name) => listFiles(join(path, name)));
}

/**
 * @param {string} [root]
 * @returns {{ file: string; line: number; text: string }[]}
 */
export function findTodos(root = ROOT) {
  return SCAN.flatMap((entry) => listFiles(join(root, entry))).flatMap((file) =>
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .flatMap((text, i) =>
        MARKER.test(text)
          ? [{ file: relative(root, file).replaceAll("\\", "/"), line: i + 1, text: text.trim() }]
          : [],
      ),
  );
}

/** @param {{ file: string; line: number; text: string }[]} todos */
export function formatTodos(todos) {
  return todos.map((t) => `  ${t.file}:${t.line}  ${t.text}`).join("\n");
}

/** Astro integration: warns after every build while placeholders remain. */
export function todoWarnings() {
  return {
    name: "todo-warnings",
    hooks: {
      /** @param {{ logger: { warn: (msg: string) => void } }} options */
      "astro:build:done": ({ logger }) => {
        const todos = findTodos();
        if (todos.length > 0) {
          logger.warn(
            `${todos.length} TODO: placeholders left (run npm run todo):\n${formatTodos(todos)}`,
          );
        }
      },
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const todos = findTodos();
  if (todos.length > 0)
    console.log(`${todos.length} TODO: placeholders left:\n${formatTodos(todos)}`);
}
