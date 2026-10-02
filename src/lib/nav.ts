import { copy } from "../data/profile";

/** Home-page sections linked from the nav, in order. Labels come from profile.ts. */
export const navLinks = [
  { id: "about", label: copy.nav.about },
  { id: "projects", label: copy.nav.projects },
  { id: "experience", label: copy.nav.experience },
  { id: "skills", label: copy.nav.skills },
  { id: "contact", label: copy.nav.contact },
].map((link) => ({ ...link, href: `/#${link.id}` }));

export type NavLink = (typeof navLinks)[number];
