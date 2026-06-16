import type { CheckIssue } from "../types";

export interface DiagnosisCase {
  id: string;
  label: string;
  input: string;
  expectedRuleIds: string[];
}

export const diagnosisCases: DiagnosisCase[] = [
  {
    id: "missing-year-reference",
    label: "Missing year in reference",
    input: "Smith, J. Learning APA style. Journal of Student Writing, 12(2), 45-61.",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "missing-doi-url",
    label: "Missing DOI or URL",
    input: "Smith, J. (2024). Learning APA style. Journal of Student Writing, 12(2), 45-61.",
    expectedRuleIds: ["doi-url"],
  },
  {
    id: "title-case-article",
    label: "Title case article title",
    input: "Smith, J. (2024). Learning APA Style In First-Year Psychology. Journal of Student Writing, 12(2), 45-61.",
    expectedRuleIds: ["sentence-case", "italics-source-type"],
  },
  {
    id: "compressed-author-initials",
    label: "Compressed author initials",
    input: "Lacy, J.T. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
    expectedRuleIds: ["author-initials-spacing"],
  },
  {
    id: "missing-volume-pages",
    label: "Missing volume and pages",
    input: "Smith, J. (2024). Learning APA style. Journal of Student Writing. https://doi.org/10.1037/example",
    expectedRuleIds: ["locator-details"],
  },
  {
    id: "in-text-no-year",
    label: "In-text citation without year",
    input: "(Smith)",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "in-text-narrative-no-year",
    label: "Narrative citation without year",
    input: "Smith found that students need practice.",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "doi-not-url-format",
    label: "DOI not in URL format",
    input: "Smith, J. (2024). Learning APA style. Journal of Student Writing, 12(2), 45-61. doi:10.1037/example",
    expectedRuleIds: ["doi-url"],
  },
  {
    id: "url-missing-protocol",
    label: "URL missing protocol",
    input: "American Psychological Association. (2024). Reference examples. APA Style. apastyle.apa.org/examples",
    expectedRuleIds: ["doi-url"],
  },
  {
    id: "ai-policy-risk",
    label: "AI citation policy risk",
    input: "OpenAI. (2026). ChatGPT. OpenAI. https://chat.openai.com/",
    expectedRuleIds: ["ai-disclosure"],
  },
  {
    id: "no-date-webpage",
    label: "No-date webpage check",
    input: "Purdue Online Writing Lab. APA formatting and style guide. Purdue OWL. https://owl.purdue.edu/",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "ampersand-narrative",
    label: "Ampersand in narrative sentence",
    input: "Smith & Lee (2024) found that students need practice.",
    expectedRuleIds: ["in-text-match"],
  },
  {
    id: "and-parenthetical",
    label: "And in parenthetical citation",
    input: "(Smith and Lee, 2024)",
    expectedRuleIds: ["in-text-match"],
  },
  {
    id: "missing-author",
    label: "Missing author",
    input: "(2024). Learning APA style. Journal of Student Writing, 12(2), 45-61.",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "uncertain-short-text",
    label: "Too little information",
    input: "APA citation?",
    expectedRuleIds: ["uncertain"],
  },
  {
    id: "report-missing-publisher",
    label: "Report missing publisher",
    input: "National report on student wellness. (2024). https://example.org/report",
    expectedRuleIds: ["author-date"],
  },
  {
    id: "book-no-publisher",
    label: "Book missing publisher",
    input: "Brown, T. (2021). Research writing for psychology students.",
    expectedRuleIds: ["source-container"],
  },
  {
    id: "missing-title",
    label: "Missing title",
    input: "Smith, J. (2024). Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
    expectedRuleIds: ["source-container"],
  },
  {
    id: "source-type-unclear",
    label: "Unclear source type",
    input: "Smith, J. (2024). Notes from class.",
    expectedRuleIds: ["uncertain"],
  },
  {
    id: "valid-ish-reference",
    label: "Mostly complete reference",
    input: "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
    expectedRuleIds: [],
  },
  {
    id: "course-policy",
    label: "Course material policy check",
    input: "Lacey, D. (2026). APA practice handout [Course material]. Blackboard course site.",
    expectedRuleIds: ["uncertain"],
  },
];

export function issueHasRule(issue: CheckIssue, ruleId: string): boolean {
  return issue.ruleId === ruleId;
}
