import { describe, expect, it } from "vitest";
import { checkDocumentText } from "./documentCheck";

describe("document check rules", () => {
  it("detects a References section in pasted text", () => {
    const result = checkDocumentText(`Students cite sources (Smith, 2024).

References
Smith, J. (2024). Learning APA style. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example`);

    expect(result.hasReferencesSection).toBe(true);
    expect(result.wordCount).toBeGreaterThan(10);
  });

  it("flags a likely citation/reference mismatch with medium confidence", () => {
    const result = checkDocumentText(`Students cite sources (Lacy, 2024).

References
Smith, J. (2024). Learning APA style. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example`);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "citation-reference-match",
          confidence: "medium",
          evidence: "(Lacy, 2024)",
        }),
      ]),
    );
  });

  it("returns manual review items for layout-sensitive checks", () => {
    const result = checkDocumentText("Short paper text without much formatting.");

    expect(result.manualReviewChecklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "document-spacing-font", severity: "ask", confidence: "low" }),
        expect.objectContaining({ ruleId: "document-headings", severity: "ask", confidence: "low" }),
      ]),
    );
    expect(result.manualReviewChecklist.some((issue) => issue.severity === "fix")).toBe(false);
  });

  it("checks reference formatting details in extracted text", () => {
    const result = checkDocumentText(`Students cite sources (Lacy, 2024).

References
Lacy, J.T. (2024). Learning APA Style In First-Year Psychology. Journal of Student Writing, 12(2), 45-61. doi:10.1037/example`);

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "author-initials-spacing" }),
        expect.objectContaining({ ruleId: "doi-url" }),
        expect.objectContaining({ ruleId: "sentence-case" }),
        expect.objectContaining({ ruleId: "italics-source-type", confidence: "low" }),
      ]),
    );
  });
});
