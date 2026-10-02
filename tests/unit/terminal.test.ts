import { describe, expect, it } from "vitest";
import type { Profile } from "../../src/data/profile";
import {
  commands,
  complete,
  experienceUptime,
  levenshtein,
  runCommand,
  skillsTable,
  suggest,
  type Context,
  type Output,
} from "../../src/lib/terminal/commands";

const profile: Profile = {
  name: "Ada Lovelace",
  handle: "ada",
  headline: "AI Engineer",
  tagline: "I build engines.",
  location: "London, UK",
  availability: "Open to AI Engineer roles",
  email: "ada@example.com",
  links: {
    github: "https://github.com/ada",
    linkedin: "https://www.linkedin.com/in/ada",
    resume: "/resume.pdf",
    others: [{ label: "LeetCode", url: "https://leetcode.com/u/ada" }],
  },
  about: ["First paragraph.", "Second paragraph."],
  photo: "/src/assets/photo.jpg",
  funFacts: ["Fact A", "Fact B", "Fact C"],
  now: ["Learning Kubernetes", "Building agents"],
  experience: [
    {
      company: "Analytical Engines Ltd",
      title: "Engineer",
      start: "2024-09",
      end: "Present",
      bullets: ["Did things"],
      tech: ["Python"],
    },
  ],
  skills: [
    { group: "AI & LLMs", items: ["LangGraph", "GPT-4o"] },
    { group: "Backend", items: ["Python", "FastAPI", "Kafka"] },
  ],
  uses: [],
};

const ctx = (overrides: Partial<Context> = {}): Context => ({
  profile,
  projects: [
    { slug: "documind", title: "DocuMind", summary: "Reads POs.", tech: ["Python", "pgvector"] },
  ],
  history: [],
  eggs: { found: 2, total: 4 },
  now: new Date(2026, 9, 2), // Oct 2026
  random: () => 0.5,
  ...overrides,
});

/** All printed text, one string per line. */
const printed = (output: Output) => output.lines.map((row) => row.map((s) => s.text).join(""));
const run = (input: string, overrides?: Partial<Context>) => runCommand(input, ctx(overrides));

describe("terminal commands", () => {
  it("help lists every visible command and hides eggs", () => {
    const out = printed(run("help")).join("\n");
    for (const command of commands.filter((c) => !c.hidden)) {
      expect(out).toContain(command.usage ?? command.name);
    }
    expect(out).not.toMatch(/^eggs/m);
  });

  it("whoami shows name, headline, location and availability", () => {
    const out = printed(run("whoami")).join("\n");
    expect(out).toContain("Ada Lovelace");
    expect(out).toContain("AI Engineer");
    expect(out).toContain("London, UK");
    expect(out).toContain("Open to AI Engineer roles");
  });

  it("about prints the about paragraphs", () => {
    expect(printed(run("about"))).toEqual(["First paragraph.", "", "Second paragraph."]);
  });

  it("projects lists numbered projects", () => {
    expect(printed(run("projects"))[0]).toBe("1. DocuMind — Reads POs.");
  });

  it("projects 1 opens the case study", () => {
    expect(run("projects 1").action).toEqual({ type: "navigate", href: "/projects/documind" });
  });

  it("projects says so when nothing is published", () => {
    expect(printed(run("projects", { projects: [] }))[0]).toContain("No projects published yet");
  });

  it("open documind navigates to the case study", () => {
    expect(run("open documind").action).toEqual({ type: "navigate", href: "/projects/documind" });
    expect(run("open nope").action).toBeUndefined();
  });

  it("experience prints a compact timeline", () => {
    expect(printed(run("experience"))).toEqual([
      "Sep 2024 – Present  Engineer",
      "  @ Analytical Engines Ltd",
    ]);
  });

  it("skills prints an ASCII table", () => {
    const out = printed(run("skills"));
    expect(out[0]).toMatch(/^\+-+\+-+\+$/);
    expect(out.join("\n")).toContain("| AI & LLMs");
    expect(out.join("\n")).toContain("Python, FastAPI, Kafka");
  });

  it("resume starts the PDF download", () => {
    expect(run("resume").action).toEqual({ type: "download", href: "/resume.pdf" });
  });

  it("contact shows email and links; --copy copies the email", () => {
    const out = run("contact");
    expect(out.lines[0]?.[1]).toEqual({ text: "ada@example.com", href: "mailto:ada@example.com" });
    expect(run("contact --copy").action).toEqual({ type: "copy", text: "ada@example.com" });
  });

  it("socials returns clickable GitHub, LinkedIn and other links", () => {
    const hrefs = run("socials").lines.map((row) => row[1]?.href);
    expect(hrefs).toEqual([
      "https://github.com/ada",
      "https://www.linkedin.com/in/ada",
      "https://leetcode.com/u/ada",
    ]);
  });

  it("now lists what I'm doing now", () => {
    expect(printed(run("now"))).toEqual(["• Learning Kubernetes", "• Building agents"]);
  });

  it("fun-fact picks a fact using the injected random", () => {
    expect(printed(run("fun-fact"))).toEqual(["✨ Fact B"]);
    expect(printed(run("fun-fact", { random: () => 0.99 }))).toEqual(["✨ Fact C"]);
  });

  it("theme switches dark, light and matrix, and rejects others", () => {
    for (const theme of ["dark", "light", "matrix"] as const) {
      expect(run(`theme ${theme}`).action).toEqual({ type: "theme", theme });
    }
    expect(run("theme pink").action).toBeUndefined();
  });

  it("neofetch shows the system-info card", () => {
    const out = printed(run("neofetch")).join("\n");
    expect(out).toContain("ada@portfolio");
    expect(out).toContain("OS: AI Engineer");
    expect(out).toContain("Shell: Python");
    expect(out).toContain("Uptime: 2 years");
    expect(out).toContain("Packages: 5 (skills)");
    expect(out).toContain("AL");
  });

  it("history lists commands typed this session", () => {
    expect(printed(run("history", { history: ["whoami", "history"] }))).toEqual([
      "  1  whoami",
      "  2  history",
    ]);
  });

  it("clear and exit return their actions", () => {
    expect(run("clear").action).toEqual({ type: "clear" });
    expect(run("exit").action).toEqual({ type: "exit" });
  });

  it("sudo hire-me grants permission and opens contact", () => {
    const out = run("sudo hire-me");
    expect(printed(out).join("\n")).toContain("Permission granted");
    expect(out.action).toEqual({ type: "hire-me" });
    expect(run("sudo rm -rf /").action).toBeUndefined();
  });

  it("ls shows the fake file system", () => {
    expect(printed(run("ls"))[0]?.trim()).toBe("about.txt  projects/  resume.pdf  contact.txt");
  });

  it("cd maps directories to sections", () => {
    expect(run("cd projects").action).toEqual({ type: "navigate", href: "/#projects" });
    expect(run("cd ~").action).toEqual({ type: "navigate", href: "/#top" });
    expect(printed(run("cd nowhere"))[0]).toBe("cd: no such file or directory: nowhere");
  });

  it("cat about.txt prints the about text; other files behave like a shell", () => {
    expect(printed(run("cat about.txt"))).toEqual(printed(run("about")));
    expect(printed(run("cat contact.txt"))).toEqual(printed(run("contact")));
    expect(printed(run("cat resume.pdf"))[0]).toContain("binary file");
    expect(printed(run("cat secrets.txt"))[0]).toBe("cat: secrets.txt: No such file or directory");
  });

  it("eggs shows easter-egg progress", () => {
    expect(printed(run("eggs"))).toEqual(["🥚 2/4 found"]);
  });

  it("unknown commands suggest the closest one", () => {
    expect(printed(run("hlep"))[0]).toBe("command not found: hlep. Did you mean help?");
    expect(printed(run("xyzzy"))[0]).toContain("Type `help`");
  });

  it("is case-insensitive and ignores extra spaces", () => {
    expect(printed(run("  WHOAMI  "))[0]).toBe("Ada Lovelace");
    expect(run("   ").lines).toEqual([]);
  });
});

describe("terminal helpers", () => {
  it("levenshtein counts edits", () => {
    expect(levenshtein("help", "help")).toBe(0);
    expect(levenshtein("hlep", "help")).toBe(2);
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("suggest only returns names within distance 2", () => {
    expect(suggest("abuot")).toBe("about");
    expect(suggest("zzzzzz")).toBeUndefined();
  });

  it("complete finishes command names and arguments", () => {
    expect(complete("neo", ctx())).toEqual(["neofetch"]);
    expect(complete("c", ctx())).toEqual(["cat", "cd", "clear", "contact"]);
    expect(complete("cat ab", ctx())).toEqual(["cat about.txt"]);
    expect(complete("theme m", ctx())).toEqual(["theme matrix"]);
    expect(complete("open doc", ctx())).toEqual(["open documind"]);
  });

  it("experienceUptime counts from the earliest start", () => {
    expect(experienceUptime(profile, new Date(2026, 9, 2))).toBe("2 years");
    expect(experienceUptime(profile, new Date(2025, 2, 1))).toBe("6 months");
  });

  it("skillsTable wraps long skill lists", () => {
    const many = {
      ...profile,
      skills: [{ group: "Backend" as const, items: Array(20).fill("Spring Boot") }],
    };
    const rows = skillsTable(many, 30);
    expect(new Set(rows.map((row) => row.length)).size).toBe(1);
    expect(rows.length).toBeGreaterThan(5);
  });
});
