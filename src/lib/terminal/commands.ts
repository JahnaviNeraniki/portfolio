// Terminal command registry. Commands are pure: they read the context and return lines to print
// plus an optional action for the UI to perform (navigate, copy, switch theme, ...).
import type { Profile } from "../../data/profile";
import { formatMonth, initials } from "../format";

// ---------- Types ----------

export interface Segment {
  text: string;
  href?: string;
  download?: boolean;
  tone?: "accent" | "muted" | "success" | "error";
}
export type Line = Segment[];

export type Action =
  | { type: "clear" }
  | { type: "exit" }
  | { type: "navigate"; href: string }
  | { type: "download"; href: string }
  | { type: "copy"; text: string }
  | { type: "theme"; theme: TerminalTheme }
  | { type: "hire-me" };

export interface Output {
  lines: Line[];
  action?: Action;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  tech: string[];
}

export interface Context {
  profile: Profile;
  projects: ProjectSummary[];
  /** Commands typed this session, oldest first, including the current one */
  history: string[];
  eggs: { found: number; total: number };
  now: Date;
  /** Injected so tests are deterministic */
  random: () => number;
}

export interface Command {
  name: string;
  aliases?: string[];
  /** Shown in `help`, e.g. "contact [--copy]" */
  usage?: string;
  description: string;
  /** Left out of `help` */
  hidden?: boolean;
  run: (args: string[], ctx: Context) => Output;
}

export const TERMINAL_THEMES = ["light", "dark", "matrix", "system"] as const;
export type TerminalTheme = (typeof TERMINAL_THEMES)[number];

// ---------- Helpers ----------

const seg = (part: string | Segment): Segment => (typeof part === "string" ? { text: part } : part);
const line = (...parts: (string | Segment)[]): Line => parts.map(seg);
const text = (...rows: string[]): Output => ({ lines: rows.map((row) => line(row)) });
const accent = (value: string): Segment => ({ text: value, tone: "accent" });
const muted = (value: string): Segment => ({ text: value, tone: "muted" });
const link = (label: string, href: string): Segment => ({ text: label, href });

/** Fake file system shown by ls / cd / cat. */
export const FILES = ["about.txt", "projects/", "resume.pdf", "contact.txt"] as const;

function socialLinks(profile: Profile): Line[] {
  const links = [
    { label: "GitHub", url: profile.links.github },
    { label: "LinkedIn", url: profile.links.linkedin },
    ...(profile.links.others ?? []),
  ];
  return links.map(({ label, url }) => line(muted(label.padEnd(10)), link(url, url)));
}

function contactLines(profile: Profile): Line[] {
  return [
    line(muted("Email".padEnd(10)), link(profile.email, `mailto:${profile.email}`)),
    ...socialLinks(profile),
  ];
}

function aboutLines(profile: Profile): Line[] {
  return profile.about.flatMap((paragraph, i) =>
    (i === 0 ? [] : [line("")]).concat([line(paragraph)]),
  );
}

/** Months between the earliest experience start ("YYYY-MM") and now, as "2 years" / "8 months". */
export function experienceUptime(profile: Profile, now: Date): string {
  const starts = profile.experience
    .map((job) => /^(\d{4})-(\d{2})$/.exec(job.start))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]) * 12 + Number(match[2]) - 1);
  if (starts.length === 0) return "unknown";
  const months = now.getFullYear() * 12 + now.getMonth() - Math.min(...starts);
  if (months < 12) return `${Math.max(months, 0)} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

/** Wraps a comma-separated list to lines of at most `width` characters. */
function wrapList(items: string[], width: number): string[] {
  const rows: string[] = [];
  let current = "";
  for (const item of items) {
    const next = current ? `${current}, ${item}` : item;
    if (next.length > width && current) {
      rows.push(`${current},`);
      current = item;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows;
}

/** Skills grouped as an ASCII table. */
export function skillsTable(profile: Profile, width = 44): string[] {
  const groupWidth = Math.max(5, ...profile.skills.map((skill) => skill.group.length));
  const border = `+${"-".repeat(groupWidth + 2)}+${"-".repeat(width + 2)}+`;
  const row = (left: string, right: string) =>
    `| ${left.padEnd(groupWidth)} | ${right.padEnd(width)} |`;
  const rows = [border, row("Group", "Skills"), border];
  for (const skill of profile.skills) {
    wrapList(skill.items, width).forEach((chunk, i) =>
      rows.push(row(i === 0 ? skill.group : "", chunk)),
    );
  }
  rows.push(border);
  return rows;
}

/** Levenshtein edit distance, used for "Did you mean …?". */
export function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0] ?? 0;
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      previous[j] = Math.min(above + 1, (previous[j - 1] ?? 0) + 1, diagonal + cost);
      diagonal = above;
    }
  }
  return previous[b.length] ?? 0;
}

function findProject(query: string, projects: ProjectSummary[]): ProjectSummary | undefined {
  const index = Number(query);
  if (Number.isInteger(index) && index >= 1) return projects[index - 1];
  const wanted = query.toLowerCase();
  return projects.find(
    (project) => project.slug.toLowerCase() === wanted || project.title.toLowerCase() === wanted,
  );
}

function openProject(query: string | undefined, ctx: Context, usage: string): Output {
  if (!query) return text(usage);
  const project = findProject(query, ctx.projects);
  if (!project)
    return {
      lines: [line({ text: `No project matches "${query}". Try \`projects\`.`, tone: "error" })],
    };
  return {
    lines: [line(`Opening ${project.title}…`)],
    action: { type: "navigate", href: `/projects/${project.slug}` },
  };
}

// ---------- Commands ----------

export const commands: Command[] = [
  {
    name: "help",
    description: "List the commands",
    run: () => {
      const visible = commands.filter((command) => !command.hidden);
      const width = Math.max(...visible.map((command) => (command.usage ?? command.name).length));
      return {
        lines: [
          ...visible.map((command) =>
            line(accent((command.usage ?? command.name).padEnd(width + 2)), command.description),
          ),
          line(""),
          line(muted("Tab completes, ↑/↓ walk history, Ctrl+L clears, Esc closes.")),
        ],
      };
    },
  },
  {
    name: "whoami",
    description: "Name, headline, location, availability",
    run: (_, { profile }) => ({
      lines: [
        line(accent(profile.name)),
        line(profile.headline),
        line(muted("Location  "), profile.location),
        line(muted("Status    "), { text: profile.availability, tone: "success" }),
      ],
    }),
  },
  {
    name: "about",
    description: "A little about me",
    run: (_, { profile }) => ({ lines: aboutLines(profile) }),
  },
  {
    name: "projects",
    usage: "projects [n]",
    description: "List projects; `projects 1` opens one",
    run: (args, ctx) => {
      if (args[0]) return openProject(args[0], ctx, "Usage: projects [n]");
      if (ctx.projects.length === 0) return text("No projects published yet. More coming soon!");
      return {
        lines: [
          ...ctx.projects.map((project, i) =>
            line(accent(`${i + 1}. ${project.title}`), muted(` — ${project.summary}`)),
          ),
          line(""),
          line(muted("Type `projects <n>` or `open <name>` to read a case study.")),
        ],
      };
    },
  },
  {
    name: "open",
    usage: "open <project>",
    description: "Open a project's case study",
    run: (args, ctx) => openProject(args[0], ctx, "Usage: open <project>, e.g. open 1"),
  },
  {
    name: "experience",
    description: "Where I've worked",
    run: (_, { profile }) => ({
      lines: profile.experience.flatMap((job) => [
        line(muted(`${formatMonth(job.start)} – ${formatMonth(job.end)}  `), accent(job.title)),
        line(`  @ ${job.company}`),
      ]),
    }),
  },
  {
    name: "skills",
    description: "Skills, grouped",
    run: (_, { profile }) => text(...skillsTable(profile)),
  },
  {
    name: "resume",
    description: "Download my resume (PDF)",
    run: (_, { profile }) => ({
      lines: [line("Downloading resume… ", link("resume.pdf", profile.links.resume))],
      action: { type: "download", href: profile.links.resume },
    }),
  },
  {
    name: "contact",
    usage: "contact [--copy]",
    description: "How to reach me; --copy copies my email",
    run: (args, { profile }) =>
      args.includes("--copy")
        ? {
            lines: [line({ text: `Copied ${profile.email} to the clipboard.`, tone: "success" })],
            action: { type: "copy", text: profile.email },
          }
        : { lines: contactLines(profile) },
  },
  {
    name: "socials",
    description: "GitHub, LinkedIn and more",
    run: (_, { profile }) => ({ lines: socialLinks(profile) }),
  },
  {
    name: "now",
    description: "What I'm doing now",
    run: (_, { profile }) => text(...profile.now.map((item) => `• ${item}`)),
  },
  {
    name: "fun-fact",
    aliases: ["funfact"],
    description: "A random fun fact",
    run: (_, { profile, random }) => {
      const facts = profile.hobbies.map((hobby) => hobby.text);
      if (facts.length === 0) return text("Fun facts coming soon.");
      const index = Math.floor(random() * facts.length) % facts.length;
      return text(`✨ ${facts[index]}`);
    },
  },
  {
    name: "theme",
    usage: "theme <dark|light|matrix>",
    description: "Switch the colour theme",
    run: (args) => {
      const theme = args[0];
      if (!(TERMINAL_THEMES as readonly string[]).includes(theme ?? "")) {
        return text("Usage: theme dark | theme light | theme matrix | theme system");
      }
      const chosen = theme as TerminalTheme;
      return {
        lines: [line(chosen === "matrix" ? "Wake up, Neo… 🐇" : `Theme set to ${chosen}.`)],
        action: { type: "theme", theme: chosen },
      };
    },
  },
  {
    name: "neofetch",
    description: "System info, portfolio edition",
    run: (_, { profile, now }) => {
      const mark = initials(profile.name).padEnd(2).slice(0, 2);
      const skillCount = profile.skills.reduce((sum, skill) => sum + skill.items.length, 0);
      const title = `${profile.handle}@portfolio`;
      // Plain ASCII: box-drawing characters are not in the Latin font subset and misalign.
      const art = [
        "+--------+",
        "|        |",
        `|   ${mark}   |`,
        "|   >_   |",
        "+--------+",
        "",
        "",
      ];
      const info: Line[] = [
        line(accent(title)),
        line(muted("-".repeat(title.length))),
        line(accent("OS"), `: AI Engineer`),
        line(accent("Shell"), ": Python"),
        line(accent("Uptime"), `: ${experienceUptime(profile, now)}`),
        line(accent("Packages"), `: ${skillCount} (skills)`),
        line(accent("Location"), `: ${profile.location}`),
      ];
      return {
        lines: info.map((row, i) => [
          { text: `${(art[i] ?? "").padEnd(12)}`, tone: "accent" as const },
          ...row,
        ]),
      };
    },
  },
  {
    name: "history",
    description: "Commands typed this session",
    run: (_, { history }) =>
      text(...history.map((entry, i) => `${String(i + 1).padStart(3)}  ${entry}`)),
  },
  {
    name: "ls",
    description: "List files",
    run: () => ({
      lines: [
        line(...FILES.map((file) => (file.endsWith("/") ? accent(`${file}  `) : `${file}  `))),
      ],
    }),
  },
  {
    name: "cd",
    usage: "cd <dir>",
    description: "Change directory",
    run: (args) => {
      const target = (args[0] ?? "~").replace(/\/$/, "");
      if (["~", "/", ".."].includes(target))
        return { lines: [], action: { type: "navigate", href: "/#top" } };
      if (target === "projects")
        return { lines: [], action: { type: "navigate", href: "/#projects" } };
      if (target === ".") return { lines: [] };
      return { lines: [line({ text: `cd: no such file or directory: ${target}`, tone: "error" })] };
    },
  },
  {
    name: "cat",
    usage: "cat <file>",
    description: "Print a file, e.g. cat about.txt",
    run: (args, ctx) => {
      const file = args[0];
      if (!file) return text("Usage: cat <file>. Try `ls`.");
      if (file === "about.txt") return { lines: aboutLines(ctx.profile) };
      if (file === "contact.txt") return { lines: contactLines(ctx.profile) };
      if (file === "resume.pdf") return text("cat: resume.pdf: binary file. Try `resume` instead.");
      if (file.replace(/\/$/, "") === "projects") return text("cat: projects: Is a directory");
      return { lines: [line({ text: `cat: ${file}: No such file or directory`, tone: "error" })] };
    },
  },
  {
    name: "clear",
    description: "Clear the screen",
    run: () => ({ lines: [], action: { type: "clear" } }),
  },
  {
    name: "exit",
    description: "Close the terminal",
    run: () => ({ lines: [], action: { type: "exit" } }),
  },
  {
    name: "sudo",
    usage: "sudo hire-me",
    description: "Try it 😉",
    run: (args) =>
      args.join(" ") === "hire-me"
        ? {
            lines: [
              line(muted("[sudo] password for recruiter: ********")),
              line("Verifying hiring budget… [##########] 100%"),
              line({ text: "✔ Permission granted. Opening the contact section…", tone: "success" }),
            ],
            action: { type: "hire-me" },
          }
        : { lines: [line({ text: "sudo: permission denied. Nice try though 😄", tone: "error" })] },
  },
  {
    name: "eggs",
    description: "Easter eggs found",
    hidden: true,
    run: (_, { eggs }) => text(`🥚 ${eggs.found}/${eggs.total} found`),
  },
];

const byName = new Map<string, Command>();
for (const command of commands) {
  byName.set(command.name, command);
  for (const alias of command.aliases ?? []) byName.set(alias, command);
}

export function findCommand(name: string): Command | undefined {
  return byName.get(name.toLowerCase());
}

/** Closest command name within edit distance 2, for "Did you mean …?". */
export function suggest(name: string): string | undefined {
  let best: { name: string; distance: number } | undefined;
  for (const candidate of byName.keys()) {
    const distance = levenshtein(name.toLowerCase(), candidate);
    if (distance <= 2 && (!best || distance < best.distance)) best = { name: candidate, distance };
  }
  return best?.name;
}

/** Parses and runs one line of input. */
export function runCommand(input: string, ctx: Context): Output {
  const [name = "", ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };
  const command = findCommand(name);
  if (command) return command.run(args, ctx);
  const guess = suggest(name);
  return {
    lines: [
      line(
        { text: `command not found: ${name}.`, tone: "error" },
        guess ? ` Did you mean ${guess}?` : " Type `help` to see what I can do.",
      ),
    ],
  };
}

/** Tab completion: returns the possible completions of the whole input line. */
export function complete(input: string, ctx: Pick<Context, "projects">): string[] {
  const parts = input.split(" ");
  if (parts.length === 1) {
    const prefix = (parts[0] ?? "").toLowerCase();
    return [...byName.keys()].filter((name) => name.startsWith(prefix)).sort();
  }
  const [name = "", ...rest] = parts;
  const partial = rest.join(" ").toLowerCase();
  const options: Record<string, readonly string[]> = {
    cat: FILES,
    cd: ["projects/", "~"],
    theme: TERMINAL_THEMES,
    open: ctx.projects.map((project) => project.slug),
    sudo: ["hire-me"],
    contact: ["--copy"],
  };
  return (options[name.toLowerCase()] ?? [])
    .filter((option) => option.toLowerCase().startsWith(partial))
    .map((option) => `${name} ${option}`);
}
