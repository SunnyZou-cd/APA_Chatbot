import type { CitationStyleDetection, CitationStyleGuess } from "../types";

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function hasApaAuthorDate(text: string): boolean {
  return (
    /\b[A-Z][A-Za-z'-]+,\s(?:[A-Z]\.\s?)+(?:,\s&\s[A-Z][A-Za-z'-]+,\s(?:[A-Z]\.\s?)*)?\s\((?:\d{4}|n\.d\.)\)\./.test(text) ||
    /^[^.]{4,}\.\s\((?:\d{4}|n\.d\.)\)\./.test(text)
  );
}

function hasApaInText(text: string): boolean {
  return /^\([A-Z][A-Za-z'-]+(?:\s&\s[A-Z][A-Za-z'-]+)?,\s(?:\d{4}|n\.d\.)\)$/i.test(text.trim());
}

function hasMlaReferencePattern(text: string): boolean {
  return (
    /^[A-Z][A-Za-z'-]+,\s[A-Z][^.]+\. "/.test(text) ||
    /^[^.]+\. "\S[^"]+"\s+[A-Z][^,]+,\s\d{4}/.test(text) ||
    /^[A-Z][A-Za-z'-]+,\s[A-Z][^.]+\. [^."]+\. [A-Z][^,]+,\s\d{4}\./.test(text) ||
    /"\S[^"]+"\.\s+[A-Z][^.,]+,\s(?:vol\.|no\.|pp\.|[A-Z][a-z]+ \d{1,2}, \d{4}|\d{4})/i.test(text) ||
    /\b(?:vol\.|no\.|pp\.)\s*\d+/i.test(text)
  );
}

function hasMlaInText(text: string): boolean {
  return /^\([A-Z][A-Za-z'-]+(?:\s\d+|\s\d+-\d+)\)$/i.test(text.trim());
}

function hasChicagoPattern(text: string): boolean {
  return (
    /^\d+\.\s[A-Z][A-Za-z'-]+\s[A-Z][A-Za-z'-]+,\s["“]/.test(text) ||
    /\bIbid\./i.test(text) ||
    /\bAccessed\s[A-Z][a-z]+\s\d{1,2},\s\d{4}/.test(text) ||
    /["“][^"”]+["”]\s+[^.]+ \d+,\sno\.\s\d+\s\(\d{4}\):\s\d+/i.test(text) ||
    /^[A-Z][A-Za-z'-]+,\s[A-Z][^.]+\. ["“][^"”]+["”]\./.test(text)
  );
}

function detection(
  guess: CitationStyleGuess,
  confidence: CitationStyleDetection["confidence"],
  evidence: string[],
): CitationStyleDetection {
  const messages: Record<CitationStyleGuess, string> = {
    apa: "This appears closer to APA style.",
    mla: "This appears closer to MLA style than APA style.",
    chicago: "This appears closer to Chicago style than APA style.",
    unknown: "The citation style is unclear from the current text.",
  };
  const actions: Record<CitationStyleGuess, string> = {
    apa: "Continue checking APA details against the source type and assignment directions.",
    mla: "Find the original source metadata, then rebuild the reference in APA author-date order.",
    chicago: "Find the original source metadata, then rebuild the reference in APA author-date order.",
    unknown: "Add the full reference entry or complete in-text citation before relying on a correction.",
  };

  return {
    guess,
    confidence,
    evidence,
    message: messages[guess],
    studentAction: actions[guess],
  };
}

export function detectCitationStyle(input: string): CitationStyleDetection {
  const text = normalize(input);

  if (!text) {
    return detection("unknown", "low", ["No citation text was provided."]);
  }

  const chicagoSignals = [
    hasChicagoPattern(text) ? "Chicago-style note, bibliography, Ibid., or accessed-date pattern detected." : "",
  ].filter(Boolean);

  if (chicagoSignals.length > 0) {
    return detection("chicago", "medium", chicagoSignals);
  }

  const mlaSignals = [
    hasMlaReferencePattern(text) ? "MLA-style quoted title or container details detected." : "",
    hasMlaInText(text) ? "Parenthetical citation looks like author-page MLA style." : "",
  ].filter(Boolean);

  if (mlaSignals.length > 0) {
    return detection("mla", mlaSignals.length > 1 ? "high" : "medium", mlaSignals);
  }

  const apaSignals = [
    hasApaAuthorDate(text) ? "APA-style author-date reference pattern detected." : "",
    hasApaInText(text) ? "APA-style author-date parenthetical citation detected." : "",
  ].filter(Boolean);

  if (apaSignals.length > 0) {
    return detection("apa", apaSignals.length > 1 ? "high" : "medium", apaSignals);
  }

  return detection("unknown", "low", ["No strong APA, MLA, or Chicago pattern was detected."]);
}
