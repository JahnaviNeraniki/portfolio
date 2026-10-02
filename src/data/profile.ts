// THE content file. Every name, sentence, date, link, and number on the site comes from here
// (or from the Markdown in src/content/). Replace every TODO placeholder, then run `npm run todo`.

export type SkillGroup = "AI & LLMs" | "Backend" | "Data" | "DevOps" | "Frontend";

export interface Profile {
  name: string;
  /** GitHub username, used in the terminal prompt: handle@portfolio:~$ */
  handle: string;
  headline: string;
  /** 1 sentence */
  tagline: string;
  location: string;
  /** Shown as a status pill */
  availability: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
    resume: string;
    others?: { label: string; url: string }[];
  };
  /** 2–4 short paragraphs */
  about: string[];
  /** Path under src/assets/ */
  photo: string;
  /** 3–6 items, used by the terminal `fun-fact` command and the About section */
  funFacts: string[];
  /** What you're doing now, 2–4 bullets */
  now: string[];
  experience: {
    company: string;
    title: string;
    /** "YYYY-MM" */
    start: string;
    /** "YYYY-MM" or "Present" */
    end: string | "Present";
    location?: string;
    /** 2–4 bullets, each with a number where possible */
    bullets: string[];
    tech: string[];
  }[];
  skills: { group: SkillGroup; items: string[] }[];
  education?: { school: string; degree: string; year: string }[];
  certifications?: { name: string; year: string; url?: string }[];
  /** The /uses page */
  uses: { category: string; items: { name: string; note?: string }[] }[];
}

export const profile: Profile = {
  name: "TODO: Full Name",
  handle: "TODO-username",
  headline: "AI Engineer | LLM Agents, RAG, Document AI",
  tagline: "TODO: your one-line tagline, e.g. I build AI systems that check their own work.",
  location: "Hyderabad, India",
  availability: "Open to AI Engineer roles",
  email: "TODO:you@example.com",
  links: {
    github: "https://github.com/TODO-username",
    linkedin: "https://www.linkedin.com/in/TODO-your-profile",
    resume: "/resume.pdf",
  },
  about: [
    "TODO: About paragraph 1 — who you are and what you build.",
    "TODO: About paragraph 2 — how you work and what you care about.",
  ],
  photo: "/src/assets/photo.jpg",
  funFacts: ["TODO: fun fact 1", "TODO: fun fact 2", "TODO: fun fact 3"],
  now: ["TODO: what you're doing now, item 1", "TODO: what you're doing now, item 2"],
  experience: [
    {
      company: "TODO: Company",
      title: "TODO: Official job title",
      start: "TODO: YYYY-MM",
      end: "Present",
      location: "TODO: City, Country",
      bullets: [
        "TODO: achievement with a number, e.g. cut processing time by 40%",
        "TODO: achievement with a number",
      ],
      tech: ["TODO: tech"],
    },
  ],
  // Pre-filled from the DocuMind tech stack. TODO: review and add the rest of your skills.
  skills: [
    {
      group: "AI & LLMs",
      items: ["LangGraph", "OpenAI", "Anthropic", "MCP", "RAG", "pgvector", "Langfuse"],
    },
    { group: "Backend", items: ["Python", "FastAPI", "Pydantic", "SQLAlchemy", "Redis"] },
    { group: "Data", items: ["PostgreSQL", "Tesseract", "Docling"] },
    { group: "DevOps", items: ["Docker", "GitHub Actions", "Prometheus", "Grafana"] },
    { group: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Vite"] },
  ],
  uses: [
    {
      category: "TODO: Hardware",
      items: [{ name: "TODO: laptop", note: "TODO: short note" }],
    },
    {
      category: "TODO: Editor & terminal",
      items: [{ name: "TODO: editor", note: "TODO: short note" }],
    },
  ],
};

/** Fixed wording used around the site (labels, buttons, short lines). Edit freely. */
export const copy = {
  skipLink: "Skip to content",
  nav: {
    about: "About",
    projects: "Projects",
    experience: "Experience",
    skills: "Skills",
    contact: "Contact",
    search: "Search",
    terminal: "Terminal",
  },
  footer: {
    builtWith: "Built with Astro, hosted free on GitHub Pages",
    lastUpdated: "Last updated",
    source: "Source code",
  },
  /** Home-page section headings; the mono label above each reads "// 01. about". */
  sections: {
    about: "About",
    featured: "Featured project",
    projects: "Projects",
    experience: "Experience",
    skills: "Skills",
    writing: "Writing",
    contact: "Contact",
  },
  hero: {
    view: "View",
    resume: "Download resume",
    contact: "Contact",
    hintBefore: "Press",
    hintAfter: "to open the terminal",
  },
  about: {
    now: "Now",
    funFact: "Fun fact",
  },
  featured: {
    caseStudy: "Read case study",
    code: "View code",
    playVideo: "Play demo video",
    videoComingSoon: "Demo video coming soon",
  },
  projects: {
    caseStudy: "Case study",
    code: "Code",
    filterLabel: "Filter projects by tech",
    comingSoonTitle: "More coming soon",
    comingSoonBody: "New projects are in the works. Meanwhile, see what I'm building on GitHub.",
    noMatch: "No projects match this filter yet.",
  },
  contact: {
    line: "Hiring for an AI Engineer? Let's talk.",
    copyEmail: "Copy email",
    copied: "Copied!",
    emailMe: "Email me",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    sent: "Thanks! Your message is on its way. I'll reply soon.",
    failed: "Something went wrong. Please email me instead.",
  },
};
