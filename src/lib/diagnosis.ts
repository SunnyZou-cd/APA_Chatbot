import type { CheckIssue } from "../types";
import { detectCitationStyle } from "./styleDetection";

function issue(params: Omit<CheckIssue, "source"> & Partial<Pick<CheckIssue, "source">>): CheckIssue {
  return {
    source: "rule",
    ...params,
  };
}

function hasYearOrNoDate(text: string): boolean {
  return /\((?:\d{4}|n\.d\.)\)/i.test(text) || /,\s(?:\d{4}|n\.d\.)\)/i.test(text);
}

function looksMissingAuthor(text: string): boolean {
  return (
    /^\((?:\d{4}|n\.d\.)\)\./i.test(text) ||
    /^[^.]*\b(?:article|guide|handout|notes|report|study|tips)\b[^.]*\.\s\((?:\d{4}|n\.d\.)\)\./i.test(text)
  );
}

function looksLikeReference(text: string): boolean {
  return /\.\s/.test(text) && text.length > 35;
}

function looksLikeInTextCitation(text: string): boolean {
  return /^\(.+\)$/.test(text.trim()) || /\b[A-Z][a-z]+(?:\s&\s|\sand\s)[A-Z][a-z]+\s\(\d{4}\)/.test(text);
}

function hasRetrieval(text: string): boolean {
  return /https:\/\/doi\.org\/10\.\S+\/\S+|https?:\/\/\S+/i.test(text);
}

function hasDoiButNotUrlFormat(text: string): boolean {
  return /doi\s*:?\s*10\./i.test(text) && !/https:\/\/doi\.org\/10\./i.test(text);
}

function hasTitleCaseSignal(text: string): boolean {
  const titleMatch = text.match(/\)\.\s([^.]*)\./);
  const title = titleMatch?.[1] ?? "";
  const words = title.split(/\s+/).filter(Boolean);
  const capitalizedSmallWords = words.filter((word) => /^(A|An|And|At|For|In|Of|On|The|To|With)$/u.test(word));
  return words.length >= 4 && capitalizedSmallWords.length >= 1;
}

function hasCompressedInitials(text: string): boolean {
  return /\b[A-Z][A-Za-z'’-]+,\s*(?:[A-Z]\.){2,}/.test(text);
}

function expandedInitialsExample(text: string): string {
  const match = text.match(/\b([A-Z][A-Za-z'’-]+),\s*((?:[A-Z]\.){2,})/);
  if (!match) return "Lacy, J. T. (2024). Title of work. Source.";
  const initials = match[2].match(/[A-Z]\./g)?.join(" ") ?? match[2];
  return `${match[1]}, ${initials}`;
}

function missingLocatorDetails(text: string): boolean {
  return /Journal|Review|Quarterly|Psychology/i.test(text) && !/\d+\s*\(\d+\)|\d+,\s*\d+-\d+/.test(text);
}

function hasContainerSignal(text: string): boolean {
  return /Journal|Review|Press|Publisher|YouTube|Blackboard|APA Style|Purdue|OpenAI|Institute|University/i.test(text);
}

function titleSourceBoundaryLooksUnclear(text: string): boolean {
  return /\((?:\d{4}|n\.d\.)\)\.\s(?:Journal|Teaching|College|Psychology)[^.]*\d+\s*\(/i.test(text);
}

function looksLikeOnlyAuthorDateTitle(text: string): boolean {
  const normalizedInitials = text.replace(/\b[A-Z]\./g, "A");
  return /^[^.]+\s\((?:\d{4}|n\.d\.)\)\.\s[^.]+\.$/i.test(normalizedInitials);
}

function looksLikeJournalArticleReference(text: string): boolean {
  return looksLikeReference(text) && /\((?:\d{4}|n\.d\.)\)\.\s[^.]+\.\s[^.]+,\s*\d+/i.test(text);
}

function looksLikeStandaloneWorkReference(text: string): boolean {
  return looksLikeReference(text) && /\((?:\d{4}|n\.d\.)\)\.\s[^.]+\.\s(?:[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*\.|https?:\/\/|www\.)/i.test(text);
}

export function diagnoseCitation(text: string): CheckIssue[] {
  const value = text.trim();
  const issues: CheckIssue[] = [];
  const styleDetection = detectCitationStyle(value);

  if (!value) {
    return [
      issue({
        severity: "check",
        message: "Paste a citation or reference to receive feedback.",
        whyItMatters: "The coach needs a student attempt before it can give formative feedback.",
        hint: "Try the sample reference if you want to see how diagnosis works.",
        studentAction: "Paste one reference entry or one in-text citation.",
        ruleId: "uncertain",
        ruleSource: "APA Coach input boundary",
        suggestedCorrection: "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
        confidence: "high",
      }),
    ];
  }

  if (value.length < 18) {
    issues.push(
      issue({
        severity: "ask",
        message: "There is not enough information to diagnose this confidently.",
        whyItMatters: "APA rules depend on source type, author, date, title, and source/container information.",
        hint: "Add the full reference entry or the complete sentence containing the in-text citation.",
        studentAction: "Find the original source details before requesting a correction.",
        ruleId: "uncertain",
        ruleSource: "APA Coach confidence boundary",
        suggestedCorrection: "No correction is suggested because the source type is unclear.",
        confidence: "low",
      }),
    );
  }

  if (styleDetection.guess === "mla") {
    issues.push(
      issue({
        severity: "ask",
        message: "This appears closer to MLA style than APA style.",
        whyItMatters: "MLA and APA organize source information differently. APA usually starts references with author and date, while MLA often emphasizes author, title, container, and page details.",
        hint: "Look for the original source metadata instead of trying to edit punctuation only.",
        studentAction: "Rebuild the citation in APA using author, date, title, source/container, and DOI or URL when needed.",
        ruleId: "style-detection",
        ruleSource: "APA Coach style detection pre-check",
        suggestedCorrection: "Use Build after confirming the original source details; this tool is not verifying the source or converting MLA automatically.",
        confidence: styleDetection.confidence,
        styleFamily: "mla",
        evidence: styleDetection.evidence.join(" "),
        needsInstructorReview: true,
      }),
    );
  }

  if (styleDetection.guess === "chicago") {
    issues.push(
      issue({
        severity: "ask",
        message: "This appears closer to Chicago style than APA style.",
        whyItMatters: "Chicago notes and bibliography patterns do not use APA's author-date reference structure.",
        hint: "Identify the source type and original metadata before attempting APA formatting.",
        studentAction: "Rebuild the source as an APA reference instead of copying the Chicago order.",
        ruleId: "style-detection",
        ruleSource: "APA Coach style detection pre-check",
        suggestedCorrection: "Use Build after confirming the original source details; this tool is not verifying the source or converting Chicago automatically.",
        confidence: styleDetection.confidence,
        styleFamily: "chicago",
        evidence: styleDetection.evidence.join(" "),
        needsInstructorReview: true,
      }),
    );
  }

  if (hasCompressedInitials(value)) {
    issues.push(
      issue({
        severity: "fix",
        message: "Author initials need spaces after each period.",
        whyItMatters: "APA reference entries use last name plus initials, and multiple initials are separated with spaces.",
        hint: "Check the author element before the date. A compressed form such as J.T. should be written with a space between initials.",
        studentAction: "Add a space between author initials after each period.",
        ruleId: "author-initials-spacing",
        ruleSource: "APA reference author formatting",
        suggestedCorrection: expandedInitialsExample(value),
        confidence: "high",
      }),
    );
  }

  if (!hasYearOrNoDate(value)) {
    issues.push(
      issue({
        severity: "fix",
        message: "The citation may be missing a publication year.",
        whyItMatters: "APA citations usually connect author and date so readers can match the in-text citation to the reference entry.",
        hint: "Find the year in the original source. If no date is available, use n.d. rather than guessing.",
        studentAction: "Add the year or n.d. in the correct author-date position.",
        ruleId: "author-date",
        ruleSource: "APA author-date citation principle",
        suggestedCorrection: "Smith, J. (2024). Article title in sentence case. Journal Title, 12(2), 45-61.",
        confidence: "high",
      }),
    );
  }

  if (looksLikeReference(value) && looksMissingAuthor(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "The author-date position may be missing or out of order.",
        whyItMatters: "APA reference entries usually begin with the author, followed by the date.",
        hint: "If the source truly has no author, the title moves to the author position. If it has an author, start with that author.",
        studentAction: "Confirm whether the first element is an author or title before using the citation.",
        ruleId: "author-date",
        ruleSource: "APA reference list author-date pattern",
        suggestedCorrection: "Author, A. A. (2024). Title of the work. Source.",
        confidence: "medium",
      }),
    );
  }

  if (looksLikeReference(value) && !hasRetrieval(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "No DOI or URL was detected.",
        whyItMatters: "A DOI or stable URL may be needed for retrievable online sources.",
        hint: "Check the original source. Use a DOI when available; use a stable URL when required.",
        studentAction: "Verify retrieval information instead of inventing it.",
        ruleId: "doi-url",
        ruleSource: "APA DOI and URL guidance",
        suggestedCorrection: "Add a DOI in URL format when available, such as https://doi.org/10.xxxx/xxxxx.",
        confidence: "medium",
      }),
    );
  }

  if (hasDoiButNotUrlFormat(value) || /\s[a-z0-9.-]+\.[a-z]{2,}\//i.test(value)) {
    issues.push(
      issue({
        severity: "check",
        message: "The retrieval link format may need review.",
        whyItMatters: "APA references use DOI links in URL format and URLs should include the protocol.",
        hint: "Use https://doi.org/... for DOIs and https://... for URLs.",
        studentAction: "Copy the verified DOI or URL from the source.",
        ruleId: "doi-url",
        ruleSource: "APA DOI and URL guidance",
        suggestedCorrection: "https://doi.org/10.1037/example",
        confidence: "medium",
      }),
    );
  }

  if (looksLikeReference(value) && hasTitleCaseSignal(value)) {
    issues.push(
      issue({
        severity: "check",
        message: "The title may be in title case instead of APA sentence case.",
        whyItMatters: "Article, webpage, and report titles in APA references usually use sentence case.",
        hint: "Capitalize the first word, the first word after a colon, and proper nouns.",
        studentAction: "Compare the title capitalization with an APA example for the source type.",
        ruleId: "sentence-case",
        ruleSource: "APA sentence case guidance",
        suggestedCorrection: "Learning APA style in first-year psychology: A guided practice study.",
        confidence: "medium",
      }),
    );
  }

  if (looksLikeJournalArticleReference(value)) {
    issues.push(
      issue({
        severity: "check",
        message: "Journal article references need source-type-specific italics.",
        whyItMatters: "For APA journal article references, the article title is not italicized; the journal title and volume number are italicized.",
        hint: "Use sentence case for the article title, then italicize the journal title and volume number in the final document.",
        studentAction: "Compare the article reference with an APA journal article example and review the journal title and volume formatting.",
        ruleId: "italics-source-type",
        ruleSource: "APA reference examples and Purdue OWL periodical guidance",
        suggestedCorrection: "Author, A. A. (2024). Article title in sentence case. Journal Title, 12(2), 45-61.",
        confidence: "medium",
      }),
    );
  } else if (looksLikeStandaloneWorkReference(value)) {
    issues.push(
      issue({
        severity: "check",
        message: "Standalone works often need the work title italicized.",
        whyItMatters: "Books, reports, some webpages, videos, and software/tool references use italics on the work title rather than on a journal title.",
        hint: "First identify the source type, then apply italics to the correct title element.",
        studentAction: "Compare the source with an APA example for that source type before final formatting.",
        ruleId: "italics-source-type",
        ruleSource: "APA source-type reference formatting guidance",
        suggestedCorrection: "Author, A. A. (2024). Title of the standalone work. Publisher or Site Name. URL",
        confidence: "low",
      }),
    );
  }

  if (looksLikeReference(value) && missingLocatorDetails(value)) {
    issues.push(
      issue({
        severity: "check",
        message: "Volume, issue, page range, or article details may be missing.",
        whyItMatters: "Journal article references usually include enough locator detail for readers to find the article.",
        hint: "Look for volume, issue, pages, or article number in the source record.",
        studentAction: "Add the locator details if the source provides them.",
        ruleId: "locator-details",
        ruleSource: "APA journal article reference pattern",
        suggestedCorrection: "Journal Title, 12(2), 45-61.",
        confidence: "medium",
      }),
    );
  }

  if (looksLikeReference(value) && titleSourceBoundaryLooksUnclear(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "The title and source/container boundary may need review.",
        whyItMatters: "APA reference entries usually separate the work title from the journal, book, website, or publisher.",
        hint: "Check whether the reference includes both the title of the work and the source/container.",
        studentAction: "Compare the attempt with the original source record before revealing a correction.",
        ruleId: "source-container",
        ruleSource: "APA source-type formatting principle",
        suggestedCorrection: "Author, A. A. (2024). Title of the article. Journal Title, 12(2), 45-61.",
        confidence: "low",
      }),
    );
  }

  if (looksLikeReference(value) && looksLikeOnlyAuthorDateTitle(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "The reference may be missing publisher or container information.",
        whyItMatters: "Books, reports, chapters, webpages, and articles need source details so readers can locate the work.",
        hint: "Look for a publisher, journal, website, platform, edited book, or DOI/URL depending on the source type.",
        studentAction: "Identify the source type and add the required source or publisher information.",
        ruleId: "source-container",
        ruleSource: "APA source-type formatting principle",
        suggestedCorrection: "Author, A. A. (2021). Title of the work. Publisher.",
        confidence: "low",
      }),
    );
  }

  if (looksLikeReference(value) && !hasContainerSignal(value) && value.split(".").length < 4) {
    issues.push(
      issue({
        severity: "ask",
        message: "The source type or container is unclear.",
        whyItMatters: "APA formatting changes based on whether the source is a journal article, book, chapter, webpage, report, or course material.",
        hint: "Identify the source type before applying a final format.",
        studentAction: "Find the journal, publisher, website, platform, or course site information.",
        ruleId: "source-container",
        ruleSource: "APA source-type formatting principle",
        suggestedCorrection: "No single correction is suggested until the source type is confirmed.",
        confidence: "low",
      }),
    );
  }

  if (looksLikeInTextCitation(value) && /\band\b/.test(value) && /^\(/.test(value)) {
    issues.push(
      issue({
        severity: "fix",
        message: "Parenthetical citations use an ampersand between two authors.",
        whyItMatters: "APA uses different connectors in parenthetical and narrative citations.",
        hint: "Use & inside parentheses.",
        studentAction: "Change 'and' to '&' in the parenthetical citation.",
        ruleId: "in-text-match",
        ruleSource: "APA in-text citation author connector rule",
        suggestedCorrection: "(Smith & Lee, 2024)",
        confidence: "high",
      }),
    );
  }

  if (looksLikeInTextCitation(value) && /\w\s&\s\w/.test(value) && !/^\(/.test(value)) {
    issues.push(
      issue({
        severity: "fix",
        message: "Narrative citations use 'and' between two authors.",
        whyItMatters: "APA uses '&' in parenthetical citations and 'and' in narrative prose.",
        hint: "Use 'and' when the authors are part of the sentence.",
        studentAction: "Change '&' to 'and' in the narrative citation.",
        ruleId: "in-text-match",
        ruleSource: "APA in-text citation author connector rule",
        suggestedCorrection: "Smith and Lee (2024)",
        confidence: "high",
      }),
    );
  }

  if (/ChatGPT|OpenAI|large language model|generative AI/i.test(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "AI use may require course disclosure beyond APA citation.",
        whyItMatters: "APA citation and instructor AI-use policy are related but not identical.",
        hint: "Check the course policy before relying on citation formatting alone.",
        studentAction: "Document how the AI tool was used and ask whether disclosure is required.",
        ruleId: "ai-disclosure",
        ruleSource: "APA AI citation guidance and course policy boundary",
        suggestedCorrection: "Cite the tool only when appropriate, and follow the course disclosure policy.",
        confidence: "medium",
      }),
    );
  }

  if (/course|Blackboard|Canvas|handout|class notes/i.test(value)) {
    issues.push(
      issue({
        severity: "ask",
        message: "Course materials may have instructor-specific requirements.",
        whyItMatters: "Some course materials are not publicly retrievable and may need assignment-specific handling.",
        hint: "Ask your instructor how they want course materials cited.",
        studentAction: "Use the course policy or assignment instructions before copying a final reference.",
        ruleId: "uncertain",
        ruleSource: "Instructor policy boundary",
        suggestedCorrection: "No universal correction is suggested for course-only materials.",
        confidence: "low",
      }),
    );
  }

  if (issues.length === 0) {
    issues.push(
      issue({
        severity: "check",
        message: "No obvious v1.3 rule-based issues were found.",
        whyItMatters: "Rule-based checks can miss APA details and cannot verify source truth.",
        hint: "Still compare the citation with your assignment directions and an APA example.",
        studentAction: "Verify the source metadata before using this as a final citation.",
        ruleId: "uncertain",
        ruleSource: "APA Coach confidence boundary",
        suggestedCorrection: value,
        confidence: "low",
      }),
    );
  }

  return issues;
}
