export type SourceType =
  | "journalArticle"
  | "book"
  | "bookChapter"
  | "webpage"
  | "report"
  | "video"
  | "courseMaterial"
  | "generativeAI";

export type Severity = "fix" | "check" | "ask";

export interface SourceInput {
  sourceType: SourceType;
  author: string;
  date: string;
  title: string;
  source: string;
  publisher: string;
  doi: string;
  url: string;
  pages: string;
}

export interface CitationPart {
  label: string;
  value: string;
  explanation: string;
}

export interface CitationResult {
  reference: string;
  parenthetical: string;
  narrative: string;
  parts: CitationPart[];
  warnings: string[];
}

export interface CheckIssue {
  severity: Severity;
  message: string;
  hint: string;
  ruleId: string;
  suggestedCorrection: string;
  confidence: "high" | "medium" | "low";
}

export interface RuleCard {
  id: string;
  title: string;
  plainLanguageRule: string;
  example: string;
  officialLink: string;
}
