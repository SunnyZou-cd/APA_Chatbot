import type { PracticePrompt, RuleCard, SourceType } from "../types";
import { sourceTypeConfigs } from "./sourceExamples";

export const sourceTypeLabels: Record<SourceType, string> = Object.fromEntries(
  Object.entries(sourceTypeConfigs).map(([key, config]) => [key, config.label]),
) as Record<SourceType, string>;

export const ruleCards: RuleCard[] = [
  {
    id: "author-date",
    topic: "In-text citations",
    title: "Author and date anchor the citation",
    plainLanguageRule:
      "APA in-text citations usually connect the author's name with the publication year. The same author and date should lead the matching reference entry.",
    example: "Parenthetical: (Smith, 2024). Narrative: Smith (2024) found...",
    commonMistake: "Using the author name without a year, or using a year in text that does not match the reference entry.",
    studentAction: "Check that the author and date in the sentence match the first part of the reference entry.",
    askInstructorWhen: "The source has no author, no date, or a course-specific citation policy.",
    officialLink: "https://apastyle.apa.org/style-grammar-guidelines/citations",
  },
  {
    id: "sentence-case",
    topic: "References",
    title: "Use sentence case for article titles",
    plainLanguageRule:
      "For article, webpage, and report titles in the reference list, capitalize the first word, the first word after a colon, and proper nouns.",
    example: "Learning APA style in first-year psychology: A guided practice study.",
    commonMistake: "Capitalizing every major word in an article or webpage title.",
    studentAction: "Rewrite article, webpage, and report titles in sentence case unless a proper noun requires capitalization.",
    askInstructorWhen: "You are unsure whether a word is a proper noun or part of an official title.",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/capitalization/sentence-case",
  },
  {
    id: "doi-url",
    topic: "References",
    title: "Include DOI or URL when it helps retrieval",
    plainLanguageRule:
      "A DOI is preferred when available. If no DOI is available for a retrievable online source, include a stable URL when required by the source type.",
    example: "https://doi.org/10.1037/0000-000",
    commonMistake: "Inventing a DOI, omitting a required URL, or writing DOI:10.xxxx instead of a DOI link.",
    studentAction: "Look for the DOI in the source record and use the stable URL only when needed.",
    askInstructorWhen: "The source is behind a course login, database, or private LMS page.",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/references/dois-urls",
  },
  {
    id: "hanging-indent",
    topic: "Paper setup",
    title: "Reference entries use a hanging indent",
    plainLanguageRule:
      "On the references page, the first line of each entry is flush left and later lines are indented.",
    example: "The visual layout matters even when the reference text itself is correct.",
    commonMistake: "Using spaces or tabs manually instead of paragraph indentation settings.",
    studentAction: "Use the hanging indent setting in the word processor for the entire reference list.",
    askInstructorWhen: "The assignment uses a template or asks for a modified reference format.",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/paper-format/reference-list",
  },
  {
    id: "ai-disclosure",
    topic: "AI citation/disclosure",
    title: "AI use may require citation and disclosure",
    plainLanguageRule:
      "APA citation rules are only one part of responsible AI use. Course policy may also require disclosure of how the tool was used.",
    example:
      "Use the course policy first, then apply APA guidance for citing software or generated output when needed.",
    commonMistake: "Assuming an APA citation is enough even when the course policy requires disclosure.",
    studentAction: "Document how the AI tool was used and check the assignment policy before submitting.",
    askInstructorWhen: "AI helped draft, summarize, translate, analyze, or substantially revise any part of the assignment.",
    officialLink:
      "https://apastyle.apa.org/blog/how-to-cite-chatgpt",
  },
  {
    id: "style-detection",
    topic: "Citation style differences",
    title: "APA is an author-date style",
    plainLanguageRule:
      "APA references usually begin with author and date. MLA and Chicago often organize the same source details in a different order.",
    example:
      "APA starts like: Smith, J. (2024). MLA often starts like: Smith, John. \"Title.\"",
    commonMistake: "Trying to fix an MLA citation by changing punctuation instead of rebuilding the source in APA order.",
    studentAction: "Identify the original source metadata, then rebuild the reference using the APA source type.",
    askInstructorWhen: "The assignment accepts multiple styles or gives course-specific citation rules.",
    officialLink: "https://apastyle.apa.org/style-grammar-guidelines/references/examples",
  },
  {
    id: "mla-vs-apa",
    topic: "Citation style differences",
    title: "MLA author-page is not APA author-date",
    plainLanguageRule:
      "MLA in-text citations often use author and page number, while APA in-text citations usually use author and year.",
    example: "MLA: (Smith 45). APA: (Smith, 2024).",
    commonMistake: "Submitting an author-page citation when the assignment asks for APA.",
    studentAction: "Find the publication year and rebuild the in-text citation in APA author-date format.",
    askInstructorWhen: "You cannot locate a date or the assignment asks for page numbers in a specific way.",
    officialLink: "https://apastyle.apa.org/style-grammar-guidelines/citations",
  },
];

export const checklistItems = [
  "Title page matches the assignment type",
  "Page numbers are present and positioned consistently",
  "Main text is double-spaced unless the instructor says otherwise",
  "Headings follow APA level and capitalization rules",
  "Every in-text citation has a reference entry",
  "Every reference entry is cited in the paper",
  "Reference list starts on a new page",
  "Reference entries use hanging indentation",
  "Instructor-specific requirements are checked before submission",
];

export const practicePrompts: PracticePrompt[] = [
  {
    prompt: "Which citation uses narrative style?",
    choices: [
      {
        value: "Smith (2024) argued...",
        feedback: "Correct. The author is part of the sentence, so this is narrative style.",
      },
      {
        value: "(Smith, 2024)",
        feedback: "This is parenthetical style because both author and date are inside parentheses.",
      },
      {
        value: "(Smith & Lee, 2024)",
        feedback: "This is also parenthetical style, with an ampersand for two authors.",
      },
    ],
    answer: "Smith (2024) argued...",
    explanation: "Narrative citations make the author part of the sentence and put the date in parentheses.",
  },
  {
    prompt: "What should you do if the source has no date?",
    choices: [
      {
        value: "Use n.d. and avoid inventing a year",
        feedback: "Correct. Use n.d. only after confirming that no date is available.",
      },
      {
        value: "Guess the most likely year",
        feedback: "Do not guess bibliographic details. APA values transparent source information.",
      },
      {
        value: "Leave the date out everywhere",
        feedback: "The citation still needs a date position. Use n.d. when no date exists.",
      },
    ],
    answer: "Use n.d. and avoid inventing a year",
    explanation: "APA citation should not invent missing metadata. The no-date marker tells readers what is known.",
  },
  {
    prompt: "What is the safest next step when source information is missing?",
    choices: [
      {
        value: "Find the missing detail in the original source",
        feedback: "Correct. The source itself is the authority for bibliographic information.",
      },
      {
        value: "Ask the tool to create a DOI",
        feedback: "A DOI must never be invented. If there is no DOI, use the appropriate no-DOI format.",
      },
      {
        value: "Copy the closest citation from another article",
        feedback: "That can attach the wrong metadata to your source.",
      },
    ],
    answer: "Find the missing detail in the original source",
    explanation: "APA formatting depends on accurate source metadata, not just punctuation.",
  },
  {
    prompt: "Which statement best separates APA citation from AI disclosure?",
    choices: [
      {
        value: "APA citation and course disclosure may both matter",
        feedback: "Correct. Citation and course policy answer different questions.",
      },
      {
        value: "If you cite AI, you never need to disclose it",
        feedback: "Course policy may still require disclosure even if an APA citation is included.",
      },
      {
        value: "AI use never needs APA attention",
        feedback: "APA provides guidance for citing software and generated outputs in some contexts.",
      },
    ],
    answer: "APA citation and course disclosure may both matter",
    explanation: "APA style can guide citation format, while the instructor controls permitted use and disclosure expectations.",
  },
];
