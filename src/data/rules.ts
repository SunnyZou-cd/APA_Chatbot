import type { RuleCard, SourceType } from "../types";

export const sourceTypeLabels: Record<SourceType, string> = {
  journalArticle: "Journal article",
  book: "Book",
  bookChapter: "Book chapter",
  webpage: "Webpage",
  report: "Report",
  video: "Video",
  courseMaterial: "Course material",
  generativeAI: "Generative AI tool",
};

export const ruleCards: RuleCard[] = [
  {
    id: "author-date",
    title: "Author and date anchor the citation",
    plainLanguageRule:
      "APA in-text citations usually connect the author's name with the publication year. The same author and date should lead the matching reference entry.",
    example: "Parenthetical: (Smith, 2024). Narrative: Smith (2024) found...",
    officialLink: "https://apastyle.apa.org/style-grammar-guidelines/citations",
  },
  {
    id: "sentence-case",
    title: "Use sentence case for article titles",
    plainLanguageRule:
      "For article, webpage, and report titles in the reference list, capitalize the first word, the first word after a colon, and proper nouns.",
    example:
      "Learning APA style in first-year psychology: A guided practice study.",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/capitalization/sentence-case",
  },
  {
    id: "doi-url",
    title: "Include DOI or URL when it helps retrieval",
    plainLanguageRule:
      "A DOI is preferred when available. If no DOI is available for a retrievable online source, include a stable URL when required by the source type.",
    example: "https://doi.org/10.1037/0000-000",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/references/dois-urls",
  },
  {
    id: "hanging-indent",
    title: "Reference entries use a hanging indent",
    plainLanguageRule:
      "On the references page, the first line of each entry is flush left and later lines are indented.",
    example:
      "The visual layout matters even when the reference text itself is correct.",
    officialLink:
      "https://apastyle.apa.org/style-grammar-guidelines/paper-format/reference-list",
  },
  {
    id: "ai-disclosure",
    title: "AI use may require citation and disclosure",
    plainLanguageRule:
      "APA citation rules are only one part of responsible AI use. Course policy may also require disclosure of how the tool was used.",
    example:
      "Use the course policy first, then apply APA guidance for citing software or generated output when needed.",
    officialLink:
      "https://apastyle.apa.org/blog/how-to-cite-chatgpt",
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

export const practicePrompts = [
  {
    prompt: "Which citation uses narrative style?",
    choices: ["Smith (2024) argued...", "(Smith, 2024)", "(Smith & Lee, 2024)"],
    answer: "Smith (2024) argued...",
  },
  {
    prompt: "What should you do if the source has no date?",
    choices: [
      "Use n.d. and avoid inventing a year",
      "Guess the most likely year",
      "Leave the date out everywhere",
    ],
    answer: "Use n.d. and avoid inventing a year",
  },
  {
    prompt: "What is the safest next step when source information is missing?",
    choices: [
      "Find the missing detail in the original source",
      "Ask the tool to create a DOI",
      "Copy the closest citation from another article",
    ],
    answer: "Find the missing detail in the original source",
  },
];
