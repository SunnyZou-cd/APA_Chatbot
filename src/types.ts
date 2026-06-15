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
export type CitationStatus = "complete" | "incomplete";
export type CitationStyleGuess = "apa" | "mla" | "chicago" | "unknown";
export type RuleTopic =
  | "In-text citations"
  | "References"
  | "Paper setup"
  | "AI citation/disclosure"
  | "Citation style differences";

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

export type SourceField = keyof Omit<SourceInput, "sourceType">;

export interface SourceFieldDefinition {
  field: SourceField;
  label: string;
  required: boolean;
  helper: string;
  placeholder: string;
  validationPattern?: string;
}

export interface SourceExample {
  id: string;
  label: string;
  description: string;
  input: SourceInput;
}

export interface SourceTypeConfig {
  sourceType: SourceType;
  label: string;
  requiredFields: SourceField[];
  optionalFields: SourceField[];
  examples: SourceExample[];
}

export interface ValidationIssue {
  field: SourceField | "sourceType";
  severity: Severity;
  message: string;
  studentAction: string;
  ruleId: string;
}

export interface CitationPart {
  label: string;
  value: string;
  explanation: string;
}

export interface CitationResult {
  status: CitationStatus;
  reference: string;
  parenthetical: string;
  narrative: string;
  parts: CitationPart[];
  warnings: string[];
  validationIssues: ValidationIssue[];
}

export interface CheckIssue {
  source: "rule" | "llm";
  severity: Severity;
  message: string;
  whyItMatters: string;
  hint: string;
  studentAction: string;
  ruleId: string;
  ruleSource: string;
  suggestedCorrection: string;
  confidence: "high" | "medium" | "low";
  styleFamily?: CitationStyleGuess;
  evidence?: string;
  needsInstructorReview?: boolean;
}

export interface CitationStyleDetection {
  guess: CitationStyleGuess;
  confidence: "high" | "medium" | "low";
  evidence: string[];
  message: string;
  studentAction: string;
}

export interface LlmProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  compatibilityMode: "openaiChatCompletions";
}

export interface LlmCheckResult {
  summary: string;
  styleGuess: CitationStyleGuess;
  issues: CheckIssue[];
  nextSteps: string[];
  safetyNotes: string[];
  confidence: "high" | "medium" | "low";
}

export interface RuleCard {
  id: string;
  topic: RuleTopic;
  title: string;
  plainLanguageRule: string;
  example: string;
  commonMistake: string;
  studentAction: string;
  askInstructorWhen: string;
  officialLink: string;
}

export interface PracticeChoice {
  value: string;
  feedback: string;
}

export interface PracticePrompt {
  prompt: string;
  choices: PracticeChoice[];
  answer: string;
  explanation: string;
}
