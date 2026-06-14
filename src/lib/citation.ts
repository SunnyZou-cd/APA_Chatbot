import type { CitationResult, SourceInput } from "../types";

const fallbackInput: SourceInput = {
  sourceType: "journalArticle",
  author: "Smith, J.",
  date: "2024",
  title: "Learning APA style in first-year psychology",
  source: "Journal of Student Writing",
  publisher: "",
  doi: "10.1037/example",
  url: "",
  pages: "12(2), 45-61",
};

function clean(value: string): string {
  return value.trim();
}

function ensurePeriod(value: string): string {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function authorForText(author: string): string {
  const text = clean(author) || fallbackInput.author;
  const firstAuthor = text.split(/[,&]/)[0]?.trim() || text;
  const lastName = firstAuthor.split(",")[0]?.trim();
  return lastName || "Author";
}

function normalizeDate(date: string): string {
  return clean(date) || "n.d.";
}

function formatDoiOrUrl(input: SourceInput): string {
  const doi = clean(input.doi);
  const url = clean(input.url);
  if (doi) {
    return doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
  }
  return url;
}

export function buildCitation(input: SourceInput): CitationResult {
  const data = {
    ...fallbackInput,
    ...input,
    author: clean(input.author) || fallbackInput.author,
    date: normalizeDate(input.date),
    title: clean(input.title) || fallbackInput.title,
    source: clean(input.source) || fallbackInput.source,
    pages: clean(input.pages),
  };

  const warnings: string[] = [];
  if (!clean(input.author)) warnings.push("Author is missing. Do not invent an author; use the source or apply the no-author rule.");
  if (!clean(input.date)) warnings.push("Date is missing. Use n.d. only when the source truly has no date.");
  if (!clean(input.doi) && !clean(input.url)) warnings.push("DOI or URL is missing. Check whether this source requires a retrieval link.");

  const title = ensurePeriod(data.title);
  const retrieval = formatDoiOrUrl(data);
  let reference = "";

  switch (data.sourceType) {
    case "book":
      reference = `${data.author} (${data.date}). ${title} ${data.publisher || "Publisher"}. ${retrieval}`.trim();
      break;
    case "bookChapter":
      reference = `${data.author} (${data.date}). ${title} In ${data.source || "Editor"} (Ed.), ${data.publisher || "Book title"}${data.pages ? ` (pp. ${data.pages})` : ""}. ${retrieval}`.trim();
      break;
    case "webpage":
      reference = `${data.author} (${data.date}). ${title} ${data.source}. ${retrieval || "URL"}`.trim();
      break;
    case "report":
      reference = `${data.author} (${data.date}). ${title} ${data.publisher || data.source}. ${retrieval}`.trim();
      break;
    case "video":
      reference = `${data.author} (${data.date}). ${title} [Video]. ${data.source}. ${retrieval || "URL"}`.trim();
      break;
    case "courseMaterial":
      reference = `${data.author} (${data.date}). ${title} [Course material]. ${data.source || "Course site"}.`.trim();
      break;
    case "generativeAI":
      reference = `${data.author || "OpenAI"} (${data.date}). ${title} [Large language model]. ${data.source || "Software publisher"}. ${retrieval || "URL"}`.trim();
      warnings.push("AI citation may not be enough. Check the assignment policy for disclosure requirements.");
      break;
    case "journalArticle":
    default:
      reference = `${data.author} (${data.date}). ${title} ${data.source}${data.pages ? `, ${data.pages}` : ""}. ${retrieval}`.trim();
      break;
  }

  const textAuthor = authorForText(data.author);

  return {
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
        value: data.source || data.publisher || "Not provided",
        explanation: "Helps the reader locate the container or publisher.",
      },
      {
        label: "DOI or URL",
        value: retrieval || "Not provided",
        explanation: "Supports retrieval when the source is online or has a DOI.",
      },
    ],
    warnings,
  };
}
