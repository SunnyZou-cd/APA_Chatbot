import type { FormattedReferencePart } from "../types";

const authorDatePrefix =
  String.raw`(?:[A-Z][A-Za-z'’-]+,\s(?:[A-Z]\.\s*)+(?:,\s&\s[A-Z][A-Za-z'’-]+,\s(?:[A-Z]\.\s*)+)?|[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){1,5})\s\((?:\d{4}|n\.d\.)\)\.\s`;

function partsFromJournalReference(text: string): FormattedReferencePart[] | null {
  const match = text.match(new RegExp(`^(${authorDatePrefix}[\\s\\S]*?\\.\\s)([^.]+?),\\s(\\d{1,3})(\\([^)]*\\))?([^.]*)\\.(.*)$`, "i"));
  if (!match) return null;

  return [
    { text: match[1] },
    { text: match[2], italic: true },
    { text: ", " },
    { text: match[3], italic: true },
    { text: match[4] ?? "" },
    { text: match[5] ?? "" },
    { text: "." },
    { text: match[6] ?? "" },
  ].filter((part) => part.text.length > 0);
}

function partsFromJournalFragment(text: string): FormattedReferencePart[] | null {
  const match = text.match(/^([A-Z][A-Za-z& .'’-]+?),\s(\d{1,3})(\([^)]*\))?([^.]*)\.(.*)$/);
  if (!match) return null;

  return [
    { text: match[1], italic: true },
    { text: ", " },
    { text: match[2], italic: true },
    { text: match[3] ?? "" },
    { text: match[4] ?? "" },
    { text: "." },
    { text: match[5] ?? "" },
  ].filter((part) => part.text.length > 0);
}

function partsFromStandaloneReference(text: string): FormattedReferencePart[] | null {
  const match = text.match(new RegExp(`^(${authorDatePrefix})([^.]+\\.)(\\s[\\s\\S]+)$`, "i"));
  if (!match) return null;

  return [
    { text: match[1] },
    { text: match[2], italic: true },
    { text: match[3] },
  ];
}

export function formatApaTextForDisplay(text: string): FormattedReferencePart[] {
  return (
    partsFromJournalReference(text) ??
    partsFromJournalFragment(text) ??
    partsFromStandaloneReference(text) ??
    [{ text }]
  );
}
