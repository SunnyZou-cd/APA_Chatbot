import type { CheckIssue } from "../types";

export interface AiFeedbackProvider {
  diagnoseCitation(text: string): Promise<CheckIssue[]>;
}

export class RuleBasedFeedbackProvider implements AiFeedbackProvider {
  async diagnoseCitation(text: string): Promise<CheckIssue[]> {
    const value = text.trim();
    const issues: CheckIssue[] = [];

    if (!value) {
      return [
        {
          severity: "check",
          message: "Paste a citation or reference to receive feedback.",
          hint: "Try the sample reference if you want to see how diagnosis works.",
          ruleId: "author-date",
          suggestedCorrection: "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
          confidence: "high",
        },
      ];
    }

    if (!/\(\d{4}\)|\(\s*n\.d\.\s*\)/i.test(value)) {
      issues.push({
        severity: "fix",
        message: "The citation may be missing a publication year.",
        hint: "Find the year in the original source. If no date is available, use n.d. rather than guessing.",
        ruleId: "author-date",
        suggestedCorrection:
          "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61.",
        confidence: "high",
      });
    }

    if (/[A-Z][a-z]+\s[A-Z][a-z]+/.test(value) && !/\([12]\d{3}\)/.test(value)) {
      issues.push({
        severity: "check",
        message: "This looks like a reference entry, but the author-date pattern is unclear.",
        hint: "APA reference entries usually begin with Author, Initial. (Year).",
        ruleId: "author-date",
        suggestedCorrection:
          "Smith, J. (2024). Article title in sentence case. Journal Title, volume(issue), page range.",
        confidence: "medium",
      });
    }

    if (/\b[A-Z][a-z]+\s[A-Z][a-z]+\s[A-Z][a-z]+/.test(value)) {
      issues.push({
        severity: "check",
        message: "The title may be in title case instead of APA sentence case.",
        hint: "For article and webpage titles, capitalize only the first word, the first word after a colon, and proper nouns.",
        ruleId: "sentence-case",
        suggestedCorrection:
          "Learning APA style in first-year psychology: A guided practice study.",
        confidence: "medium",
      });
    }

    if (!/doi\.org|https?:\/\//i.test(value)) {
      issues.push({
        severity: "ask",
        message: "No DOI or URL was detected.",
        hint: "Check the source. A DOI is preferred when available; a URL may be needed for retrievable online sources.",
        ruleId: "doi-url",
        suggestedCorrection:
          "Add a DOI in URL format when available, such as https://doi.org/10.xxxx/xxxxx.",
        confidence: "medium",
      });
    }

    if (issues.length === 0) {
      issues.push({
        severity: "check",
        message: "No obvious v0.0 issues were found.",
        hint: "Still compare the citation with your assignment directions and an APA example.",
        ruleId: "author-date",
        suggestedCorrection: value,
        confidence: "low",
      });
    }

    return issues;
  }
}

export const aiFeedbackProvider: AiFeedbackProvider = new RuleBasedFeedbackProvider();
