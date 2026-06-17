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
  | "Document check"
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

export interface FormattedReferencePart {
  text: string;
  italic?: boolean;
}

export interface CitationResult {
  status: CitationStatus;
  reference: string;
  formattedReferenceParts: FormattedReferencePart[];
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

export type UploadedDocumentKind = "docx" | "pdf" | "text";
export type DocumentIssueGroup = "detected" | "possible" | "manual";
export type DocumentParseStatus = "idle" | "parsing" | "success" | "text-extraction-only" | "error";

export interface DocumentCheckIssue {
  severity: Severity;
  category:
    | "title page"
    | "font/spacing"
    | "headings"
    | "in-text citations"
    | "references"
    | "reference formatting";
  message: string;
  whyItMatters: string;
  studentAction: string;
  ruleId:
    | "document-title-page"
    | "document-spacing-font"
    | "document-headings"
    | "citation-reference-match"
    | "author-initials-spacing"
    | "doi-url"
    | "sentence-case"
    | "italics-source-type";
  confidence: "high" | "medium" | "low";
  evidence?: string;
  displayGroup?: DocumentIssueGroup;
}

export interface DocumentCheckResult {
  kind: UploadedDocumentKind;
  sourceName: string;
  wordCount: number;
  characterCount: number;
  hasReferencesSection: boolean;
  issues: DocumentCheckIssue[];
  manualReviewChecklist: DocumentCheckIssue[];
  privacyNote: string;
}

export interface ApaCitationCandidate {
  kind: "parenthetical" | "narrative";
  author: string;
  year: string;
  evidence: string;
  startIndex: number;
}

export type ApaSourceTypeGuess = "journalArticle" | "book" | "bookChapter" | "webpage" | "report" | "unknown";

export interface ApaEditableFields {
  authors: string;
  year: string;
  title: string;
  source: string;
  publisher: string;
  volumeIssuePages: string;
  doiOrUrl: string;
}

export interface ApaReferenceCandidate {
  originalText: string;
  authors: string;
  year: string;
  title: string;
  source: string;
  volumeIssuePages: string;
  doiOrUrl: string;
  sourceTypeGuess: ApaSourceTypeGuess;
  confidence: "high" | "medium" | "low";
  editableFields: ApaEditableFields;
}

export interface ApaCorrectionCandidate {
  originalText: string;
  correctedHtml: string | null;
  correctedPlainText: string;
  confidence: "high" | "medium" | "low";
  sourceTypeGuess: ApaSourceTypeGuess;
  editableFields: ApaEditableFields;
  missingFields: string[];
  note: string;
}

export interface DocumentUploadSummary {
  sourceName: string;
  inputKind: UploadedDocumentKind;
  sizeBytes?: number;
  parseStatus: DocumentParseStatus;
  layoutReliability: "high" | "medium" | "low";
  message: string;
}

export interface DocumentCheckResultV15 {
  documentHtml: string;
  plainText: string;
  sourceName: string;
  inputKind: UploadedDocumentKind;
  mode: "document" | "single-reference";
  wordCount: number;
  characterCount: number;
  hasReferencesSection: boolean;
  citations: ApaCitationCandidate[];
  references: ApaReferenceCandidate[];
  issues: DocumentCheckIssue[];
  manualReviewItems: DocumentCheckIssue[];
  corrections: ApaCorrectionCandidate[];
  uploadSummary: DocumentUploadSummary;
  privacyNote: string;
}

export type DocumentCheckResultV14 = DocumentCheckResultV15;

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
  apaPrinciple: string;
  nextStep: string;
}
