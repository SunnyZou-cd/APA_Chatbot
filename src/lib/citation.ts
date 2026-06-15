import { fieldDefinitions, sourceTypeConfigs } from "../data/sourceExamples";
import type { CitationResult, SourceField, SourceInput, ValidationIssue } from "../types";

function clean(value: string): string {
  return value.trim();
}

function ensurePeriod(value: string): string {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function normalizeDate(date: string): string {
  return clean(date);
}

function authorForText(author: string): string {
  const text = clean(author);
  if (!text) return "Author";
  const firstAuthor = text.split(/, &| & | and /)[0]?.trim() || text;
  const lastName = firstAuthor.includes(",") ? firstAuthor.split(",")[0]?.trim() : firstAuthor;
  return lastName || "Author";
}

function formatDoiOrUrl(input: SourceInput): string {
  const doi = clean(input.doi);
  const url = clean(input.url);
  if (doi) {
    return doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
  }
  return url;
}

function fieldLabel(field: SourceField): string {
  return fieldDefinitions.find((definition) => definition.field === field)?.label ?? field;
}

export function validateSourceInput(input: SourceInput): ValidationIssue[] {
  const config = sourceTypeConfigs[input.sourceType];
  const issues: ValidationIssue[] = [];

  for (const field of config.requiredFields) {
    if (!clean(input[field])) {
      issues.push({
        field,
        severity: "fix",
        message: `${fieldLabel(field)} is required for ${config.label.toLowerCase()} references.`,
        studentAction: `Find the ${fieldLabel(field).toLowerCase()} in the original source before copying the citation.`,
        ruleId: "required-fields",
      });
    }
  }

  if (clean(input.date) && !/^(n\.d\.|\d{4}|\d{4},\s[A-Za-z]+\s\d{1,2})$/.test(clean(input.date))) {
    issues.push({
      field: "date",
      severity: "check",
      message: "Date format may need review.",
      studentAction: "Use a year, a source-specific full date, or n.d. only when no date is available.",
      ruleId: "author-date",
    });
  }

  if (clean(input.doi) && !/^(https:\/\/doi\.org\/)?10\.\S+\/\S+$/.test(clean(input.doi))) {
    issues.push({
      field: "doi",
      severity: "check",
      message: "DOI format looks unusual.",
      studentAction: "Verify the DOI in the original source. Do not invent or repair a DOI by guessing.",
      ruleId: "doi-url",
    });
  }

  if (clean(input.url) && !/^https?:\/\/\S+$/.test(clean(input.url))) {
    issues.push({
      field: "url",
      severity: "check",
      message: "URL should start with http:// or https://.",
      studentAction: "Copy a stable URL from the source page when a URL is required.",
      ruleId: "doi-url",
    });
  }

  if (!clean(input.doi) && !clean(input.url) && ["webpage", "video", "generativeAI"].includes(input.sourceType)) {
    issues.push({
      field: "url",
      severity: "fix",
      message: "A retrievable online source needs a URL when no DOI is available.",
      studentAction: "Locate a stable URL before using this reference.",
      ruleId: "doi-url",
    });
  }

  if (!clean(input.doi) && !clean(input.url) && ["journalArticle", "book", "bookChapter", "report"].includes(input.sourceType)) {
    issues.push({
      field: "doi",
      severity: "ask",
      message: "No DOI or URL was provided.",
      studentAction: "Check whether the source has a DOI or whether the assignment requires a retrieval URL.",
      ruleId: "doi-url",
    });
  }

  return issues;
}

function incompleteResult(input: SourceInput, validationIssues: ValidationIssue[]): CitationResult {
  const config = sourceTypeConfigs[input.sourceType];
  return {
    status: "incomplete",
    reference: "Incomplete citation",
    parenthetical: "Incomplete in-text citation",
    narrative: "Incomplete narrative citation",
    warnings: validationIssues.map((issue) => issue.message),
    validationIssues,
    parts: [
      {
        label: "Source type",
        value: config.label,
        explanation: "Complete the required fields before using this citation.",
      },
      {
        label: "Next step",
        value: "Review highlighted fields",
        explanation: "APA formatting depends on source type and source metadata. The tool will not invent missing details.",
      },
    ],
  };
}

export function buildCitation(input: SourceInput): CitationResult {
  const validationIssues = validateSourceInput(input);
  const blockingIssues = validationIssues.filter((issue) => issue.severity === "fix");

  if (blockingIssues.length > 0) {
    return incompleteResult(input, validationIssues);
  }

  const data = {
    ...input,
    author: clean(input.author),
    date: normalizeDate(input.date),
    title: clean(input.title),
    source: clean(input.source),
    publisher: clean(input.publisher),
    pages: clean(input.pages),
  };

  const title = ensurePeriod(data.title);
  const retrieval = formatDoiOrUrl(data);
  let reference = "";

  switch (data.sourceType) {
    case "book":
      reference = `${data.author} (${data.date}). ${title} ${data.publisher}.${retrieval ? ` ${retrieval}` : ""}`.trim();
      break;
    case "bookChapter":
      reference = `${data.author} (${data.date}). ${title} In ${data.source}${data.pages ? ` (pp. ${data.pages})` : ""}. ${data.publisher}.${retrieval ? ` ${retrieval}` : ""}`.trim();
      break;
    case "webpage":
      reference = `${data.author} (${data.date}). ${title} ${data.source}. ${retrieval}`.trim();
      break;
    case "report":
      reference = `${data.author} (${data.date}). ${title} ${data.publisher}.${retrieval ? ` ${retrieval}` : ""}`.trim();
      break;
    case "video":
      reference = `${data.author} (${data.date}). ${title} [Video]. ${data.source}. ${retrieval}`.trim();
      break;
    case "courseMaterial":
      reference = `${data.author} (${data.date}). ${title} [Course material]. ${data.source}.`.trim();
      break;
    case "generativeAI":
      reference = `${data.author} (${data.date}). ${title} [Large language model]. ${data.source}. ${retrieval}`.trim();
      break;
    case "journalArticle":
    default:
      reference = `${data.author} (${data.date}). ${title} ${data.source}${data.pages ? `, ${data.pages}` : ""}.${retrieval ? ` ${retrieval}` : ""}`.trim();
      break;
  }

  const textAuthor = authorForText(data.author);
  const warnings = validationIssues.map((issue) => issue.message);
  if (data.sourceType === "generativeAI") {
    warnings.push("AI citation may not be enough. Check the assignment policy for disclosure requirements.");
  }

  return {
    status: "complete",
    reference,
    parenthetical: `(${textAuthor}, ${data.date})`,
    narrative: `${textAuthor} (${data.date})`,
    parts: [
      {
        label: "Author",
        value: data.author,
        explanation: "Tells the reader who created the source.",
      },
      {
        label: "Date",
        value: data.date,
        explanation: "Connects the in-text citation to the reference entry.",
      },
      {
        label: "Title",
        value: data.title,
        explanation: "Uses source-type-specific capitalization and formatting.",
      },
      {
        label: "Source",
        value: data.source || data.publisher,
        explanation: "Helps the reader locate the container or publisher.",
      },
      {
        label: "DOI or URL",
        value: retrieval || "Not provided",
        explanation: "Supports retrieval when the source is online or has a DOI.",
      },
    ],
    warnings,
    validationIssues,
  };
}
