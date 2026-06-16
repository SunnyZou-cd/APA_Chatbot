import type { DocumentCheckIssue, DocumentCheckResult, UploadedDocumentKind } from "../types";

function issue(params: DocumentCheckIssue): DocumentCheckIssue {
  return params;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function splitReferenceLines(text: string): string[] {
  const match = text.match(/(?:^|\n)\s*References\s*\n([\s\S]*)/i);
  if (!match) return [];
  return match[1]
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20);
}

function hasReferencesHeading(text: string): boolean {
  return /(?:^|\n)\s*References\s*(?:\n|$)/i.test(text);
}

function findInTextCitations(text: string): Array<{ author: string; year: string; evidence: string }> {
  return Array.from(text.matchAll(/\(([A-Z][A-Za-z'’-]+)(?:\s(?:&|and)\s[A-Z][A-Za-z'’-]+| et al\.)?,\s*(\d{4}|n\.d\.)[^)]*\)/g)).map(
    (match) => ({
      author: match[1],
      year: match[2],
      evidence: match[0],
    }),
  );
}

function findReferenceKeys(lines: string[]): Set<string> {
  const keys = new Set<string>();
  for (const line of lines) {
    const match = line.match(/^([A-Z][A-Za-z'’-]+),\s.*\((\d{4}|n\.d\.)\)/);
    if (match) {
      keys.add(`${match[1].toLowerCase()}-${match[2].toLowerCase()}`);
    }
  }
  return keys;
}

function hasCompressedInitials(text: string): boolean {
  return /\b[A-Z][A-Za-z'’-]+,\s*(?:[A-Z]\.){2,}/.test(text);
}

function hasPossibleTitleCaseArticle(line: string): boolean {
  const match = line.match(/\)\.\s([^.]*)\./);
  const title = match?.[1] ?? "";
  const words = title.split(/\s+/).filter(Boolean);
  return words.length >= 4 && words.some((word) => /^(A|An|And|At|For|In|Of|On|The|To|With)$/.test(word));
}

function hasBadRetrievalFormat(line: string): boolean {
  return /doi\s*:?\s*10\./i.test(line) || /\s[a-z0-9.-]+\.[a-z]{2,}\//i.test(line);
}

function manualReviewChecklist(): DocumentCheckIssue[] {
  return [
    issue({
      severity: "ask",
      category: "title page",
      message: "Title page formatting needs human review.",
      whyItMatters: "A static browser text extractor cannot reliably verify every title page placement, page number, affiliation, or assignment-specific requirement.",
      studentAction: "Compare the title page with the assignment directions and an APA student paper example.",
      ruleId: "document-title-page",
      confidence: "low",
    }),
    issue({
      severity: "ask",
      category: "font/spacing",
      message: "Font, margins, double-spacing, and hanging indents need manual review.",
      whyItMatters: "Text extracted from DOCX or PDF can lose layout details, so the coach should not claim final formatting accuracy.",
      studentAction: "Open the document in Google Docs or Word and check font, margins, double-spacing, and reference hanging indents directly.",
      ruleId: "document-spacing-font",
      confidence: "low",
    }),
    issue({
      severity: "ask",
      category: "headings",
      message: "APA heading levels need manual review.",
      whyItMatters: "Heading level, bolding, centering, and capitalization are layout-sensitive and may not survive extraction.",
      studentAction: "Compare each heading with APA heading-level examples and course requirements.",
      ruleId: "document-headings",
      confidence: "low",
    }),
  ];
}

export function checkDocumentText(text: string, kind: UploadedDocumentKind = "text", sourceName = "Pasted text"): DocumentCheckResult {
  const normalized = normalizeText(text);
  const referenceLines = splitReferenceLines(normalized);
  const hasReferencesSection = hasReferencesHeading(normalized);
  const citations = findInTextCitations(normalized);
  const referenceKeys = findReferenceKeys(referenceLines);
  const issues: DocumentCheckIssue[] = [];

  if (!hasReferencesSection) {
    issues.push(
      issue({
        severity: "fix",
        category: "references",
        message: "No References section was detected.",
        whyItMatters: "APA papers usually need a reference list so readers can match in-text citations to full source information.",
        studentAction: "Add a References heading and include one reference entry for every cited source.",
        ruleId: "citation-reference-match",
        confidence: "high",
      }),
    );
  }

  if (citations.length === 0) {
    issues.push(
      issue({
        severity: "ask",
        category: "in-text citations",
        message: "No clear APA-style in-text citations were detected.",
        whyItMatters: "The paper may still cite sources in prose, but the coach could not find a clear author-date pattern.",
        studentAction: "Check whether source claims include APA author-date citations such as (Smith, 2024).",
        ruleId: "citation-reference-match",
        confidence: "medium",
      }),
    );
  }

  for (const citation of citations.slice(0, 8)) {
    const key = `${citation.author.toLowerCase()}-${citation.year.toLowerCase()}`;
    if (hasReferencesSection && referenceKeys.size > 0 && !referenceKeys.has(key)) {
      issues.push(
        issue({
          severity: "check",
          category: "references",
          message: "An in-text citation may not have a matching reference entry.",
          whyItMatters: "APA expects cited works in the paper to match a reference entry.",
          studentAction: `Look for a References entry beginning with ${citation.author} and the year ${citation.year}.`,
          ruleId: "citation-reference-match",
          confidence: "medium",
          evidence: citation.evidence,
        }),
      );
      break;
    }
  }

  const referenceText = referenceLines.join("\n");
  if (hasCompressedInitials(referenceText)) {
    issues.push(
      issue({
        severity: "fix",
        category: "reference formatting",
        message: "One or more reference authors may have compressed initials.",
        whyItMatters: "APA author initials should be separated with spaces, such as J. T.",
        studentAction: "Review each reference author and add spaces between multiple initials.",
        ruleId: "author-initials-spacing",
        confidence: "high",
      }),
    );
  }

  if (referenceLines.some(hasBadRetrievalFormat)) {
    issues.push(
      issue({
        severity: "check",
        category: "reference formatting",
        message: "A DOI or URL format may need review.",
        whyItMatters: "APA uses DOI links in URL format and URLs should include the protocol.",
        studentAction: "Use https://doi.org/... for DOIs and copy complete http:// or https:// URLs.",
        ruleId: "doi-url",
        confidence: "medium",
      }),
    );
  }

  if (referenceLines.some(hasPossibleTitleCaseArticle)) {
    issues.push(
      issue({
        severity: "check",
        category: "reference formatting",
        message: "A reference title may be in title case instead of sentence case.",
        whyItMatters: "Article, webpage, and report titles in APA references usually use sentence case.",
        studentAction: "Check whether the title should use sentence case for its source type.",
        ruleId: "sentence-case",
        confidence: "medium",
      }),
    );
  }

  if (referenceLines.length > 0) {
    issues.push(
      issue({
        severity: "ask",
        category: "reference formatting",
        message: "Italic formatting depends on source type and must be reviewed in the final document.",
        whyItMatters: "Plain text extraction cannot prove whether the student italicized article, webpage, journal, book, or report titles correctly.",
        studentAction: "For journal articles, review the journal title and volume; for standalone works, review the work title.",
        ruleId: "italics-source-type",
        confidence: "low",
      }),
    );
  }

  return {
    kind,
    sourceName,
    wordCount: wordCount(normalized),
    characterCount: normalized.length,
    hasReferencesSection,
    issues,
    manualReviewChecklist: manualReviewChecklist(),
    privacyNote: "This static prototype checks extracted text in the browser session only. It does not upload, store, or send the document to a server.",
  };
}
