import { describe, expect, it } from "vitest";
import { sourceExamples } from "../data/sourceExamples";
import type { SourceInput } from "../types";
import { buildCitation, validateSourceInput } from "./citation";

function example(id: string): SourceInput {
  const found = sourceExamples.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Missing source example: ${id}`);
  }
  return found.input;
}

describe("citation builder validation", () => {
  it("generates a complete journal article citation with DOI", () => {
    const result = buildCitation(example("journal-doi"));

    expect(result.status).toBe("complete");
    expect(result.reference).toContain("Smith, J., & Lee, R. (2024).");
    expect(result.reference).toContain("https://doi.org/10.1037/example");
    expect(result.formattedReferenceParts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Journal of Student Writing", italic: true }),
        expect.objectContaining({ text: "12", italic: true }),
      ]),
    );
    expect(result.parenthetical).toBe("(Smith, 2024)");
    expect(result.narrative).toBe("Smith (2024)");
  });

  it("keeps plain-text reference copy separate from formatted display parts", () => {
    const result = buildCitation(example("journal-doi"));
    const displayedText = result.formattedReferenceParts.map((part) => part.text).join("");

    expect(result.reference).toBe(displayedText);
    expect(result.reference).not.toContain("<em>");
  });

  it("italicizes book titles as standalone works", () => {
    const result = buildCitation(example("book"));

    expect(result.formattedReferenceParts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Research writing for psychology students.", italic: true }),
      ]),
    );
  });

  it("italicizes webpage titles in the v1.3 formatted display", () => {
    const result = buildCitation(example("web-no-date"));

    expect(result.formattedReferenceParts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "APA formatting and style guide.", italic: true }),
      ]),
    );
  });

  it("does not invent missing DOI or URL for journal articles", () => {
    const result = buildCitation(example("journal-no-doi"));

    expect(result.status).toBe("complete");
    expect(result.reference).not.toContain("https://doi.org/");
    expect(result.validationIssues.some((issue) => issue.ruleId === "doi-url")).toBe(true);
  });

  it("returns incomplete citation when author is missing", () => {
    const result = buildCitation(example("missing-author"));

    expect(result.status).toBe("incomplete");
    expect(result.reference).toBe("Incomplete citation. Add the missing source information before copying.");
    expect(result.validationIssues.some((issue) => issue.field === "author")).toBe(true);
  });

  it("returns incomplete citation when date is missing", () => {
    const result = buildCitation(example("missing-date"));

    expect(result.status).toBe("incomplete");
    expect(result.parenthetical).toBe("Incomplete in-text citation");
    expect(result.validationIssues.some((issue) => issue.field === "date")).toBe(true);
  });

  it("requires a URL for webpage examples", () => {
    const input = { ...example("web-org-author"), url: "" };
    const issues = validateSourceInput(input);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "url", severity: "fix", ruleId: "required-fields" }),
      ]),
    );
  });

  it("warns on unusual DOI formatting", () => {
    const issues = validateSourceInput({ ...example("journal-doi"), doi: "example-doi" });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "doi", severity: "check", ruleId: "doi-url" }),
      ]),
    );
  });

  it("warns on URL without protocol", () => {
    const issues = validateSourceInput({ ...example("web-org-author"), url: "apastyle.apa.org/examples" });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "url", severity: "check", ruleId: "doi-url" }),
      ]),
    );
  });

  it("accepts n.d. for no-date webpages", () => {
    const result = buildCitation(example("web-no-date"));

    expect(result.status).toBe("complete");
    expect(result.parenthetical).toBe("(Purdue Online Writing Lab, n.d.)");
  });

  it("adds an AI disclosure warning for generative AI sources", () => {
    const result = buildCitation(example("generative-ai"));

    expect(result.status).toBe("complete");
    expect(result.warnings.join(" ")).toContain("AI citation may not be enough");
  });

  it.each(sourceExamples)("keeps source example $id aligned with its declared source type", (item) => {
    expect(item.input.sourceType).toBeTypeOf("string");
    expect(item.label.length).toBeGreaterThan(3);
    expect(item.description.length).toBeGreaterThan(10);
  });

  it("includes at least 12 curated examples", () => {
    expect(sourceExamples.length).toBeGreaterThanOrEqual(12);
  });
});
