import { describe, expect, it } from "vitest";
import { buildPaletteItems, createSearch } from "../../src/lib/search";

const items = buildPaletteItems({
  sections: [
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ],
  projects: [
    {
      slug: "documind",
      title: "DocuMind",
      summary: "Reads purchase orders",
      tech: ["Python", "pgvector", "LangGraph"],
    },
  ],
  pages: [{ href: "/uses", label: "Uses" }],
});
const search = createSearch(items);

describe("command palette search", () => {
  it("has the 3 groups: sections, case studies and pages; 6 actions; projects", () => {
    expect(items.filter((item) => item.group === "Navigate").map((item) => item.title)).toEqual([
      "About",
      "Contact",
      "DocuMind case study",
      "Uses",
    ]);
    expect(items.filter((item) => item.group === "Actions")).toHaveLength(6);
    expect(items.filter((item) => item.group === "Projects").map((item) => item.title)).toEqual([
      "DocuMind",
    ]);
  });

  it("returns everything for an empty query", () => {
    expect(search("")).toEqual(items);
  });

  it('finds DocuMind by a tech tag ("pgvector")', () => {
    const results = search("pgvector");
    expect(results.some((item) => item.group === "Projects" && item.title === "DocuMind")).toBe(
      true,
    );
  });

  it("matches fuzzily (typos)", () => {
    expect(search("resme")[0]?.title).toBe("Download resume");
    expect(search("termnal").some((item) => item.title === "Open terminal")).toBe(true);
  });

  it("keeps group order in results", () => {
    const groups = search("o").map((item) => item.group);
    const order = ["Navigate", "Actions", "Projects"];
    expect([...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(groups);
  });
});
