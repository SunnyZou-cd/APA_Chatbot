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
    id: "italics-source-type",
    topic: "References",
    title: "Italicize the right source element",
    plainLanguageRule:
      "APA italics depend on source type. For journal articles, italicize the journal title and volume. For standalone works, italicize the work title.",
    example:
      "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61.",
    commonMistake: "Italicizing the article title instead of the journal title, or forgetting to italicize a book or report title.",
    studentAction: "Identify the source type first, then compare the reference with a matching APA example.",
    askInstructorWhen: "The source type is unclear or the assignment provides a modified reference format.",
    officialLink: "https://apastyle.apa.org/instructional-aids/reference-examples.pdf",
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
    id: "document-check",
    topic: "Document check",
    title: "Whole-document review still needs human judgment",
    plainLanguageRule:
      "A browser prototype can find citation patterns and reference-list signals, but it cannot guarantee font, spacing, headings, title page, or hanging-indent accuracy after extraction.",
    example: "DOCX/PDF upload can flag likely issues, then ask the student to verify layout in Google Docs or Word.",
    commonMistake: "Treating extracted-text feedback as a final APA formatting approval.",
    studentAction: "Use the document check as a teaching review, then manually compare layout-sensitive items with APA examples and assignment directions.",
    askInstructorWhen: "The assignment has a template, course-specific title page, or modified APA requirements.",
    officialLink:
      "https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/index.html",
  },
  {
    id: "initials-spacing",
    topic: "References",
    title: "Separate multiple author initials",
    plainLanguageRule:
      "When an author has more than one initial, each initial keeps its period and the initials are separated with spaces.",
    example: "Lacy, J. T. (2024).",
    commonMistake: "Compressing initials as J.T. instead of J. T.",
    studentAction: "Review the author element in each reference entry before checking the rest of the format.",
    askInstructorWhen: "A name includes hyphenated initials, suffixes, or multiple family-name parts.",
    officialLink: "https://apastyle.apa.org/instructional-aids/reference-examples.pdf",
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

export const assignmentMistakes = [
  {
    title: "Mixing MLA and APA",
    studentAction: "Check whether in-text citations use author and year, not author and page only.",
  },
  {
    title: "Reference list without hanging indent",
    studentAction: "Use paragraph indentation settings instead of spaces or tabs.",
  },
  {
    title: "In-text citations do not match references",
    studentAction: "Match each cited author and year to one reference entry.",
  },
  {
    title: "AI citation confused with AI disclosure",
    studentAction: "Follow both APA citation guidance and the instructor's AI-use policy.",
  },
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
    apaPrinciple: "APA uses author-date citation. Narrative style makes the author part of the grammar of the sentence.",
    nextStep: "Look at one paragraph in your draft and decide whether each citation should be narrative or parenthetical.",
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
    apaPrinciple: "APA references should represent source metadata honestly instead of guessing missing information.",
    nextStep: "Check the original source page, PDF, or database record before using n.d.",
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
    apaPrinciple: "A formatted citation is only as reliable as the author, date, title, source, and retrieval details behind it.",
    nextStep: "Open the source record and fill in missing fields before copying any generated citation.",
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
    apaPrinciple: "Citation explains source use; course disclosure explains whether and how AI assistance was allowed.",
    nextStep: "Compare your AI-use note with the assignment directions before submitting.",
  },
];
