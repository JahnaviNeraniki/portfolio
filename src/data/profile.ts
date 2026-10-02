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
  name: "Neraniki Jahnavi",
  handle: "JahnaviNeraniki",
  headline: "Full Stack Developer → AI Engineer",
  tagline: "I build AI systems that check their own work.",
  location: "Hyderabad, India",
  availability: "Open to AI Engineer roles",
  email: "neranikijahnavi@gmail.com",
  links: {
    github: "https://github.com/JahnaviNeraniki",
    linkedin: "https://www.linkedin.com/in/neranikijahnavi21/",
    resume: "/resume.pdf",
    others: [{ label: "LeetCode", url: "https://leetcode.com/u/Neraniki_Jahnavi/" }],
  },
  about: [
    "I'm a full stack developer with 2 years of experience building ProPay.ai, an AI-powered B2B procurement platform, for a US-based product startup. I work across the stack: React on the front, Spring Boot and Python microservices behind it, and PostgreSQL underneath.",
    "Most recently I built a FastAPI + LangGraph service that reads purchase orders with GPT-4o vision, with human-in-the-loop review, retry limits and correction routing so the extracted data can be trusted.",
    "I want to grow into the AI domain, and my current job is also teaching me DevOps, so I'm expanding my skills in both: building LLM-based workflows on one side, and Docker, Kubernetes and CI/CD on the other.",
    "I studied Computer Science and Engineering at Sree Vidyanikethan Engineering College, graduating in 2024 with a 9.33 CGPA.",
  ],
  photo: "/src/assets/photo.jpg",
  funFacts: [
    "I'm into fitness, and dancing is my favourite way to stay active",
    "Badminton is my go-to sport",
    "I love listening to music",
    "I watch a lot of movies",
    "I've recently started travelling and would love to experience new places",
  ],
  now: [
    "Expanding into DevOps with Docker, Kubernetes and CI/CD workflows",
    "Exploring AI/ML further while building LLM-based workflows",
  ],
  experience: [
    {
      company: "US-based product startup (ProPay.ai)",
      title: "Full Stack Developer",
      start: "2024-09",
      end: "Present",
      bullets: [
        "Built a Python microservice (FastAPI + LangGraph) that processes purchase orders (PDFs, images) through a 5-node GPT-4o vision workflow, extracting supplier/buyer entities, priced line items and item categories across 3 sequential stages.",
        "Added human-in-the-loop review nodes with retry limits, back-stage correction routing and partial field re-extraction, with Redis as the LangGraph checkpoint store to prevent session loss across load-balanced replicas.",
        "Migrated the EventStoreDB architecture to Kafka with Spring Cloud Stream, retries and dead letter queues, eliminating unrecoverable message failures.",
        "Built 10+ REST APIs across the Orders, Quotes and Masterdata microservices with Spring Boot, and integrated EU VAT compliance, Indian legal entity verification and QuickBooks webhooks.",
      ],
      tech: [
        "Python",
        "FastAPI",
        "LangGraph",
        "GPT-4o",
        "Spring Boot",
        "Kafka",
        "PostgreSQL",
        "Redis",
        "React",
        "Keycloak",
      ],
    },
  ],
  skills: [
    {
      group: "AI & LLMs",
      items: ["GPT-4o", "LangGraph", "Spring AI", "OpenAI APIs", "Prompt Engineering"],
    },
    {
      group: "Backend",
      items: [
        "Python",
        "Java",
        "Spring Boot",
        "Hibernate",
        "Spring Data JPA",
        "FastAPI",
        "Kafka",
        "Microservices",
        "Event-Driven Architecture",
        "CQRS",
        "Event Sourcing",
        "Keycloak",
        "JWT",
        "RBAC",
      ],
    },
    { group: "Data", items: ["PostgreSQL", "Redis", "Firebase", "EventStoreDB"] },
    { group: "DevOps", items: ["Docker", "Kubernetes", "CI/CD", "Git", "GitHub"] },
    { group: "Frontend", items: ["React", "JavaScript", "TypeScript", "Material UI"] },
  ],
  education: [
    {
      school: "Sree Vidyanikethan Engineering College",
      degree: "B.Tech in Computer Science and Engineering · 9.33 CGPA",
      year: "2020 – 2024",
    },
  ],
  certifications: [
    {
      name: "IBM DevOps and Software Engineering Professional Certificate (Coursera)",
      year: "Sep 2026",
    },
  ],
  uses: [
    {
      category: "Tools",
      items: [
        { name: "IntelliJ IDEA" },
        { name: "Postman" },
        { name: "Git & GitHub" },
        { name: "Docker" },
        { name: "OpenAPI" },
      ],
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
  experience: {
    education: "Education",
    certifications: "Certifications",
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
  palette: {
    label: "Command palette",
    placeholder: "Search pages, actions, projects…",
    results: "Results",
    noResults: "No results for",
  },
  terminal: {
    pageTitle: "Terminal",
    welcome: "Welcome to my portfolio terminal.",
  },
  eggs: {
    konami: "You found a secret. Want to talk about agents?",
    contact: "Contact",
  },
  notFound: {
    title: "Page not found",
    command: "cat page",
    error: "cat: page: No such file or directory",
    home: "cd ~",
  },
  posts: {
    back: "← All writing",
  },
  uses: {
    title: "Uses",
    intro: "The tools I use day to day.",
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
