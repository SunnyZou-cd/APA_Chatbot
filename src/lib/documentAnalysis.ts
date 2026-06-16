import type {
  ApaCitationCandidate,
  ApaCorrectionCandidate,
  ApaReferenceCandidate,
  DocumentCheckIssue,
  DocumentCheckResultV14,
  UploadedDocumentKind,
} from "../types";

type Confidence = "high" | "medium" | "low";

const authorName = String.raw`[A-Z][A-Za-z'-]+`;
const yearToken = String.raw`(?:\d{4}|n\.d\.)`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, "\n");
}

export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function confidence(value: number): Confidence {
  if (value >= 3) return "high";
  if (value >= 2) return "medium";
  return "low";
}

export function findInTextCitations(text: string): ApaCitationCandidate[] {
  const citations: ApaCitationCandidate[] = [];
  const seen = new Set<string>();

  const add = (candidate: ApaCitationCandidate) => {
    const key = `${candidate.kind}-${candidate.author}-${candidate.year}-${candidate.evidence}-${candidate.startIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push(candidate);
    }
  };

  const parentheticalPattern = new RegExp(String.raw`\(([^()]*?${yearToken}[^()]*)\)`, "gi");
  for (const match of text.matchAll(parentheticalPattern)) {
    const evidence = match[0];
    const inside = match[1];
    for (const part of inside.split(";")) {
      const authorMatch = part.match(new RegExp(String.raw`\b(${authorName})(?:\s(?:&|and)\s${authorName}|\set al\.)?,\s*(${yearToken})`, "i"));
      if (authorMatch) {
        add({
          kind: "parenthetical",
          author: authorMatch[1],
          year: authorMatch[2],
          evidence,
          startIndex: match.index ?? 0,
        });
      }
    }
  }

  const narrativePattern = new RegExp(String.raw`\b(${authorName})(?:\s(?:and|&)\s${authorName}|\set al\.)?\s\(\s*(${yearToken})\s*\)`, "gi");
  for (const match of text.matchAll(narrativePattern)) {
    add({
      kind: "narrative",
      author: match[1],
      year: match[2],
      evidence: match[0],
      startIndex: match.index ?? 0,
    });
  }

  return citations;
}

function splitReferences(text: string): string[] {
  const referenceStart = text.search(/(?:^|\n)\s*References\s*(?:\n|$)/i);
  const source = referenceStart >= 0 ? text.slice(referenceStart).replace(/^\s*References\s*/i, "") : text;
  const lines = source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const entries: string[] = [];
  let current = "";

  for (const line of lines) {
    if ((/^[A-Z][A-Za-z'-]+,\s/.test(line) || /^.{2,140}\s\((?:\d{4}|n\.d\.)\)\./i.test(line)) && /\((?:\d{4}|n\.d\.)\)/i.test(line)) {
      if (current) entries.push(current.trim());
      current = line;
    } else if (current) {
      current += ` ${line}`;
    }
  }

  if (current) entries.push(current.trim());
  return entries.filter((entry) => entry.length > 20);
}

function sentenceCase(value: string): string {
  const text = value.trim();
  if (!text) return text;
  const lowered = text.toLowerCase();
  return lowered.replace(/(^\s*[a-z])|(:\s*[a-z])/g, (match) => match.toUpperCase());
}

function normalizeInitials(authorText: string): string {
  return authorText.replace(/\b([A-Z])\.(?=[A-Z]\.)/g, "$1. ");
}

function normalizeDoiOrUrl(value: string): string {
  const trimmed = value.trim().replace(/\.$/, "");
  if (!trimmed) return "";
  const doi = trimmed.match(/(?:https:\/\/doi\.org\/)?(10\.\S+\/\S+)/i)?.[1];
  if (doi) return `https://doi.org/${doi}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function parseReferenceEntry(entry: string): ApaReferenceCandidate {
  const match = entry.match(/^(.+?)\s\((\d{4}|n\.d\.)\)\.\s(.+)$/i);
  const editableFields = {
    authors: match?.[1] ? normalizeInitials(match[1].trim()) : "",
    year: match?.[2] ?? "",
    title: "",
    source: "",
    publisher: "",
    volumeIssuePages: "",
    doiOrUrl: "",
  };
  let score = 0;
  let sourceTypeGuess: ApaReferenceCandidate["sourceTypeGuess"] = "unknown";

  if (editableFields.authors) score += 1;
  if (editableFields.year) score += 1;

  const rest = match?.[3] ?? entry;
  const doiMatch = rest.match(/\s((?:https?:\/\/\S+)|(?:doi\s*:?\s*10\.\S+\/\S+)|(?:10\.\S+\/\S+)|(?:[a-z0-9.-]+\.[a-z]{2,}\/\S+))\.?$/i);
  const withoutRetrieval = doiMatch ? rest.slice(0, doiMatch.index).trim() : rest.trim();
  editableFields.doiOrUrl = doiMatch ? normalizeDoiOrUrl(doiMatch[1]) : "";

  const chapterMatch = withoutRetrieval.match(/^(.+?)\.\sIn\s(.+?)\s\((?:Ed\.|Eds\.)\),\s(.+?)\s\((pp\.\s[^)]+)\)\.\s(.+?)\.?$/i);
  const journalMatch = withoutRetrieval.match(/^(.+?)\.\s(.+?),\s(\d+(?:\([^)]*\))?(?:,\s[^.]+)?)\.?$/);
  const webpageMatch = withoutRetrieval.match(/^(.+?)\.\s(.+?)\.?$/);
  if (chapterMatch) {
    sourceTypeGuess = "bookChapter";
    editableFields.title = sentenceCase(chapterMatch[1]);
    editableFields.source = chapterMatch[3].trim();
    editableFields.publisher = chapterMatch[5].trim();
    editableFields.volumeIssuePages = chapterMatch[4].trim();
    score += 3;
  } else if (journalMatch) {
    sourceTypeGuess = "journalArticle";
    editableFields.title = sentenceCase(journalMatch[1]);
    editableFields.source = journalMatch[2].trim();
    editableFields.volumeIssuePages = journalMatch[3].trim();
    score += 3;
  } else {
    if (webpageMatch) {
      editableFields.title = sentenceCase(webpageMatch[1]);
      editableFields.publisher = webpageMatch[2].trim();
      sourceTypeGuess = editableFields.doiOrUrl || /Purdue|APA Style|Website|Online|Library|University/i.test(editableFields.publisher) ? "webpage" : "book";
      score += 2;
    } else if (withoutRetrieval) {
      editableFields.title = sentenceCase(withoutRetrieval.replace(/\.$/, ""));
      if (editableFields.doiOrUrl) sourceTypeGuess = "webpage";
      score += 1;
    }
  }

  return {
    originalText: entry,
    authors: editableFields.authors,
    year: editableFields.year,
    title: editableFields.title,
    source: editableFields.source || editableFields.publisher,
    volumeIssuePages: editableFields.volumeIssuePages,
    doiOrUrl: editableFields.doiOrUrl,
    sourceTypeGuess,
    confidence: confidence(score),
    editableFields,
  };
}

export function findReferenceEntries(text: string): ApaReferenceCandidate[] {
  return splitReferences(text).map(parseReferenceEntry);
}

function correctionHtmlFor(reference: ApaReferenceCandidate): string | null {
  const { editableFields: fields } = reference;
  if (!fields.authors || !fields.year || !fields.title) return null;

  if (reference.sourceTypeGuess === "journalArticle") {
    if (!fields.source || !fields.volumeIssuePages) return null;
    const volumeMatch = fields.volumeIssuePages.match(/^(\d+)(.*)$/);
    const volume = volumeMatch?.[1] ?? fields.volumeIssuePages;
    const rest = volumeMatch?.[2] ?? "";
    return `${escapeHtml(fields.authors)} (${escapeHtml(fields.year)}). ${escapeHtml(fields.title)}. <em>${escapeHtml(fields.source)}</em>, <em>${escapeHtml(volume)}</em>${escapeHtml(rest)}.${fields.doiOrUrl ? ` ${escapeHtml(fields.doiOrUrl)}` : ""}`;
  }

  if (reference.sourceTypeGuess === "book" || reference.sourceTypeGuess === "webpage" || reference.sourceTypeGuess === "report") {
    const source = fields.publisher || fields.source;
    if (!source && !fields.doiOrUrl) return null;
    return `${escapeHtml(fields.authors)} (${escapeHtml(fields.year)}). <em>${escapeHtml(fields.title)}.</em>${source ? ` ${escapeHtml(source)}.` : ""}${fields.doiOrUrl ? ` ${escapeHtml(fields.doiOrUrl)}` : ""}`;
  }

  if (reference.sourceTypeGuess === "bookChapter") {
    if (!fields.source || !fields.publisher || !fields.volumeIssuePages) return null;
    return `${escapeHtml(fields.authors)} (${escapeHtml(fields.year)}). ${escapeHtml(fields.title)}. In <em>${escapeHtml(fields.source)}</em> (${escapeHtml(fields.volumeIssuePages)}). ${escapeHtml(fields.publisher)}.${fields.doiOrUrl ? ` ${escapeHtml(fields.doiOrUrl)}` : ""}`;
  }

  return null;
}

export function buildCorrection(reference: ApaReferenceCandidate): ApaCorrectionCandidate {
  const missingFields: string[] = [];
  const fields = reference.editableFields;
  if (!fields.authors) missingFields.push("authors");
  if (!fields.year) missingFields.push("year");
  if (!fields.title) missingFields.push("title");
  if (reference.sourceTypeGuess === "journalArticle" && !fields.source) missingFields.push("journal title");
  if (reference.sourceTypeGuess === "journalArticle" && !fields.volumeIssuePages) missingFields.push("volume/issue/pages");
  if (reference.sourceTypeGuess === "bookChapter" && (!fields.source || !fields.publisher || !fields.volumeIssuePages)) {
    missingFields.push("book title, page range, and publisher");
  }
  if (["book", "webpage", "report"].includes(reference.sourceTypeGuess) && !fields.publisher && !fields.source) {
    missingFields.push("publisher or site name");
  }
  if (reference.sourceTypeGuess === "unknown") missingFields.push("source type");

  const correctedHtml = missingFields.length === 0 ? correctionHtmlFor(reference) : null;
  const correctedPlainText = correctedHtml ? htmlToPlainText(correctedHtml).replace(/\n+/g, " ").trim() : "";

  return {
    originalText: reference.originalText,
    correctedHtml,
    correctedPlainText,
    confidence: correctedHtml ? reference.confidence : "low",
    sourceTypeGuess: reference.sourceTypeGuess,
    editableFields: reference.editableFields,
    missingFields,
    note: correctedHtml
      ? "Best-effort correction. Confirm source type and metadata before final use."
      : "Cannot generate a reliable correction yet. Confirm the missing metadata first.",
  };
}

function issue(params: DocumentCheckIssue): DocumentCheckIssue {
  return params;
}

function manualReviewItems(inputKind: UploadedDocumentKind): DocumentCheckIssue[] {
  return [
    issue({
      severity: "ask",
      category: "font/spacing",
      message: inputKind === "pdf" ? "PDF layout extraction is limited." : "Layout-sensitive APA formatting needs manual review.",
      whyItMatters: "Font, double-spacing, margins, heading levels, title page placement, and hanging indents may not be reliably preserved in automated extraction.",
      studentAction: "Verify these items in Word or Google Docs before submission.",
      ruleId: "document-spacing-font",
      confidence: "low",
    }),
    issue({
      severity: "ask",
      category: "title page",
      message: "Title page requirements need human review.",
      whyItMatters: "Student paper title pages often depend on assignment-specific requirements.",
      studentAction: "Compare the title page with the instructor directions and APA student paper examples.",
      ruleId: "document-title-page",
      confidence: "low",
    }),
    issue({
      severity: "ask",
      category: "headings",
      message: "APA heading levels need human review.",
      whyItMatters: "Heading level, bolding, indentation, and title case are difficult to verify reliably after extraction.",
      studentAction: "Compare headings with APA Level 1-5 examples in the original Word or Google Docs file.",
      ruleId: "document-headings",
      confidence: "low",
    }),
  ];
}

export function analyzeDocument(params: {
  html?: string;
  text?: string;
  sourceName?: string;
  inputKind?: UploadedDocumentKind;
  mode?: "document" | "single-reference";
}): DocumentCheckResultV14 {
  const inputKind = params.inputKind ?? "text";
  const documentHtml = params.html?.trim() ? params.html : textToHtml(params.text ?? "");
  const plainText = normalizeText(params.text?.trim() ? params.text : htmlToPlainText(documentHtml));
  const hasReferencesSection = /(?:^|\n)\s*References\s*(?:\n|$)/i.test(plainText);
  const citations = findInTextCitations(plainText);
  const references = findReferenceEntries(params.mode === "single-reference" ? `References\n${plainText}` : plainText);
  const corrections = references.map(buildCorrection);
  const referenceKeys = new Set(references.map((reference) => `${reference.authors.split(",")[0]?.toLowerCase()}-${reference.year.toLowerCase()}`));
  const issues: DocumentCheckIssue[] = [];

  if (params.mode !== "single-reference" && !hasReferencesSection && references.length === 0) {
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

  if (params.mode !== "single-reference" && citations.length === 0) {
    issues.push(
      issue({
        severity: "ask",
        category: "in-text citations",
        message: "No clear APA-style in-text citations were detected.",
        whyItMatters: "The paper may cite sources in prose, but the coach could not find an author-date pattern.",
        studentAction: "Check whether source claims include APA author-date citations such as (Smith, 2024) or Smith (2024).",
        ruleId: "citation-reference-match",
        confidence: "medium",
      }),
    );
  }

  for (const citation of citations.slice(0, 12)) {
    const key = `${citation.author.toLowerCase()}-${citation.year.toLowerCase()}`;
    if (referenceKeys.size > 0 && !referenceKeys.has(key)) {
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

  if (references.some((reference) => /\b[A-Z][A-Za-z'-]+,\s*(?:[A-Z]\.){2,}/.test(reference.originalText))) {
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

  if (references.some((reference) => /doi\s*:?\s*10\./i.test(reference.originalText) || /\s[a-z0-9.-]+\.[a-z]{2,}\//i.test(reference.originalText))) {
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

  if (references.some((reference) => /[a-z]\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+/.test(reference.originalText))) {
    issues.push(
      issue({
        severity: "check",
        category: "reference formatting",
        message: "A reference title may need sentence case review.",
        whyItMatters: "APA reference titles usually use sentence case except for proper nouns and words after a colon.",
        studentAction: "Review title capitalization against the original source and APA source-type examples.",
        ruleId: "sentence-case",
        confidence: "medium",
      }),
    );
  }

  if (references.length > 0) {
    issues.push(
      issue({
        severity: "ask",
        category: "reference formatting",
        message: "Confirm italics on the correct source element.",
        whyItMatters: "Journal articles usually italicize the journal title and volume, while standalone works usually italicize the title.",
        studentAction: "Use the generated correction as a starting point, then confirm the source type and metadata.",
        ruleId: "italics-source-type",
        confidence: "low",
      }),
    );
  }

  return {
    documentHtml,
    plainText,
    sourceName: params.sourceName ?? "Pasted text",
    inputKind,
    mode: params.mode ?? "document",
    wordCount: wordCount(plainText),
    characterCount: plainText.length,
    hasReferencesSection,
    citations,
    references,
    issues,
    manualReviewItems: manualReviewItems(inputKind),
    corrections,
    privacyNote: "Files are parsed only for this request. The app does not store uploads or connect to Google Docs.",
  };
}
