import type { CitationStyleGuess } from "../types";

export interface StyleDetectionCase {
  id: string;
  input: string;
  expectedStyle: CitationStyleGuess;
}

export const styleDetectionCases: StyleDetectionCase[] = [
  {
    id: "apa-journal-reference",
    input: "Smith, J. (2024). Learning APA style in first-year psychology. Journal of Student Writing, 12(2), 45-61. https://doi.org/10.1037/example",
    expectedStyle: "apa",
  },
  {
    id: "apa-two-author-in-text",
    input: "(Smith & Lee, 2024)",
    expectedStyle: "apa",
  },
  {
    id: "apa-no-date-reference",
    input: "Purdue Online Writing Lab. (n.d.). APA formatting and style guide. Purdue OWL. https://owl.purdue.edu/",
    expectedStyle: "apa",
  },
  {
    id: "apa-book-reference",
    input: "Brown, T. (2021). Research writing for psychology students. Academic Press.",
    expectedStyle: "apa",
  },
  {
    id: "apa-org-author",
    input: "American Psychological Association. (2023). Reference examples. APA Style. https://apastyle.apa.org/",
    expectedStyle: "apa",
  },
  {
    id: "mla-journal-reference",
    input: 'Smith, John. "Learning APA Style in First-Year Psychology." Journal of Student Writing, vol. 12, no. 2, 2024, pp. 45-61.',
    expectedStyle: "mla",
  },
  {
    id: "mla-webpage",
    input: 'American Psychological Association. "Reference Examples." APA Style, 2024, apastyle.apa.org/examples.',
    expectedStyle: "mla",
  },
  {
    id: "mla-book",
    input: "Brown, Taylor. Research Writing for Psychology Students. Academic Press, 2021.",
    expectedStyle: "mla",
  },
  {
    id: "mla-author-page",
    input: "(Smith 45)",
    expectedStyle: "mla",
  },
  {
    id: "mla-page-range",
    input: "(Garcia 10-12)",
    expectedStyle: "mla",
  },
  {
    id: "mla-vol-no-pp",
    input: 'Garcia, Maria. "Writing Feedback." Teaching Psychology Review, vol. 8, no. 1, 2022, pp. 10-22.',
    expectedStyle: "mla",
  },
  {
    id: "chicago-note",
    input: '1. John Smith, "Learning APA Style," Journal of Student Writing 12, no. 2 (2024): 45-61.',
    expectedStyle: "chicago",
  },
  {
    id: "chicago-bibliography",
    input: 'Smith, John. "Learning APA Style." Journal of Student Writing 12, no. 2 (2024): 45-61.',
    expectedStyle: "chicago",
  },
  {
    id: "chicago-ibid",
    input: "Ibid., 48.",
    expectedStyle: "chicago",
  },
  {
    id: "chicago-accessed",
    input: 'Smith, John. "Learning APA Style." Student Writing Archive. Accessed June 1, 2024. https://example.edu.',
    expectedStyle: "chicago",
  },
  {
    id: "unknown-title-only",
    input: "Learning APA style in first-year psychology",
    expectedStyle: "unknown",
  },
  {
    id: "unknown-short-question",
    input: "APA citation?",
    expectedStyle: "unknown",
  },
  {
    id: "unknown-notes",
    input: "Notes from class about references and pages.",
    expectedStyle: "unknown",
  },
  {
    id: "unknown-partial-author",
    input: "Smith article on student writing",
    expectedStyle: "unknown",
  },
  {
    id: "unknown-url-only",
    input: "https://example.edu/student-writing",
    expectedStyle: "unknown",
  },
];
