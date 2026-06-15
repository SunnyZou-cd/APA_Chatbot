import { describe, expect, it } from "vitest";
import { diagnosisCases, issueHasRule } from "../data/diagnosisCases";
import { diagnoseCitation } from "./diagnosis";

describe("citation diagnosis rules", () => {
  it.each(diagnosisCases)("detects expected issues for $id", (testCase) => {
    const issues = diagnoseCitation(testCase.input);

    for (const ruleId of testCase.expectedRuleIds) {
      expect(issues.some((issue) => issueHasRule(issue, ruleId))).toBe(true);
    }
  });

  it("uses low confidence when a reference appears complete but cannot be verified", () => {
    const testCase = diagnosisCases.find((item) => item.id === "valid-ish-reference");
    if (!testCase) {
      throw new Error("Missing valid-ish-reference diagnosis case");
    }

    const issues = diagnoseCitation(testCase.input);

    expect(issues).toEqual([
      expect.objectContaining({
        confidence: "low",
        ruleId: "uncertain",
        message: "No obvious v1.2 rule-based issues were found.",
      }),
    ]);
  });

  it("returns structured feedback fields for every diagnosis issue", () => {
    const issues = diagnoseCitation("Smith, J. The Article Title. Journal of Student Writing, 12(2).");

    for (const issue of issues) {
      expect(issue.message).toBeTruthy();
      expect(issue.hint).toBeTruthy();
      expect(issue.whyItMatters).toBeTruthy();
      expect(issue.studentAction).toBeTruthy();
      expect(issue.ruleSource).toBeTruthy();
      expect(issue.source).toBe("rule");
      expect(["fix", "check", "ask"]).toContain(issue.severity);
      expect(["high", "medium", "low"]).toContain(issue.confidence);
    }
  });

  it("does not pretend to verify source truth for very short input", () => {
    const issues = diagnoseCitation("APA?");

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "ask",
          confidence: "low",
          ruleId: "uncertain",
        }),
      ]),
    );
  });

  it("keeps corrections hidden as data rather than replacing the student attempt", () => {
    const issues = diagnoseCitation("(Smith and Lee, 2024)");

    expect(issues[0].suggestedCorrection).toBeTruthy();
    expect(issues[0].message).not.toBe(issues[0].suggestedCorrection);
  });

  it("flags MLA-style references before ordinary APA rule checks", () => {
    const issues = diagnoseCitation('Smith, John. "Learning APA Style." Journal of Student Writing, vol. 12, no. 2, 2024, pp. 45-61.');

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "style-detection",
          styleFamily: "mla",
          message: "This appears closer to MLA style than APA style.",
        }),
      ]),
    );
  });
});
