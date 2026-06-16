import { describe, expect, it } from "vitest";
import { analyzeDocument, findInTextCitations } from "./documentAnalysis";

describe("v1.4 document analysis", () => {
  it("detects parenthetical, narrative, multi-source, and et al. citations", () => {
    const citations = findInTextCitations(
      "Smith (2024) reported one finding. Other work agreed (Lee, 2022; Brown et al., 2021). Smith and Lee (2024) added context.",
    );

    expect(citations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "narrative", author: "Smith", year: "2024" }),
        expect.objectContaining({ kind: "parenthetical", author: "Lee", year: "2022" }),
        expect.objectContaining({ kind: "parenthetical", author: "Brown", year: "2021" }),
      ]),
    );
    expect(citations.length).toBeGreaterThanOrEqual(4);
  });

  it("recognizes non-sample document citations and references", () => {
    const result = analyzeDocument({
      text: `Students use scaffolded feedback (Garcia, 2025; O'Neil, 2023).
Garcia (2025) described the same learning problem.

References
Garcia, M. (2025). Learning with citation feedback. Journal of Writing Studies, 8(1), 12-30. https://doi.org/10.1037/example
O'Neil, T. (2023). Research habits for writers. Academic Press.`,
      mode: "document",
    });

    expect(result.hasReferencesSection).toBe(true);
    expect(result.citations.length).toBeGreaterThanOrEqual(3);
    expect(result.references).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourceTypeGuess: "journalArticle", authors: "Garcia, M.", year: "2025" }),
        expect.objectContaining({ sourceTypeGuess: "book", authors: "O'Neil, T.", year: "2023" }),
      ]),
    );
    expect(result.issues.some((issue) => issue.message.includes("No clear APA-style"))).toBe(false);
  });

  it("generates journal corrections with italic journal title and volume", () => {
    const result = analyzeDocument({
      text: `References
Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example`,
      mode: "single-reference",
    });

    expect(result.corrections[0]).toEqual(
      expect.objectContaining({
        sourceTypeGuess: "journalArticle",
        correctedHtml: expect.stringContaining("<em>Journal of Student Writing</em>, <em>12</em>(2), 45-61."),
      }),
    );
    expect(result.corrections[0].correctedPlainText).not.toContain("<em>");
  });

  it("generates book corrections with italic book title", () => {
    const result = analyzeDocument({
      text: "Brown, T. (2021). Research writing for psychology students. Academic Press.",
      mode: "single-reference",
    });

    expect(result.corrections[0]).toEqual(
      expect.objectContaining({
        sourceTypeGuess: "book",
        correctedHtml: expect.stringContaining("<em>Research writing for psychology students.</em> Academic Press."),
      }),
    );
  });

  it("does not invent a correction when source metadata is insufficient", () => {
    const result = analyzeDocument({
      text: "Smith, J. (2024). Learning APA style.",
      mode: "single-reference",
    });

    expect(result.corrections[0]).toEqual(
      expect.objectContaining({
        correctedHtml: null,
        confidence: "low",
        missingFields: expect.arrayContaining(["source type"]),
      }),
    );
  });

  it("returns manual review reminders for layout-sensitive checks", () => {
    const result = analyzeDocument({
      text: "Short paper text with a citation (Smith, 2024).",
      mode: "document",
    });

    expect(result.manualReviewItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "document-spacing-font", severity: "ask", confidence: "low" }),
        expect.objectContaining({ ruleId: "document-headings", severity: "ask", confidence: "low" }),
      ]),
    );
    expect(result.manualReviewItems.some((issue) => issue.severity === "fix")).toBe(false);
  });
});
