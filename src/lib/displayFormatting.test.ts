import { describe, expect, it } from "vitest";
import { formatApaTextForDisplay } from "./displayFormatting";

describe("APA display formatting", () => {
  it("italicizes journal title and volume in a full journal reference", () => {
    const parts = formatApaTextForDisplay(
      "Smith, J. (2024). Article title in sentence case. Journal Title, 12(2), 45-61.",
    );

    expect(parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Journal Title", italic: true }),
        expect.objectContaining({ text: "12", italic: true }),
      ]),
    );
  });

  it("italicizes a standalone work title in a full reference", () => {
    const parts = formatApaTextForDisplay(
      "Author, A. A. (2024). Title of the standalone work. Publisher or Site Name. URL",
    );

    expect(parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Title of the standalone work.", italic: true }),
      ]),
    );
  });

  it("italicizes journal title and volume in a correction fragment", () => {
    const parts = formatApaTextForDisplay("Journal Title, 12(2), 45-61.");

    expect(parts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "Journal Title", italic: true }),
        expect.objectContaining({ text: "12", italic: true }),
      ]),
    );
  });

  it("does not italicize ordinary in-text citation examples", () => {
    const parts = formatApaTextForDisplay("Parenthetical: (Smith, 2024). Narrative: Smith (2024) found...");

    expect(parts).toEqual([{ text: "Parenthetical: (Smith, 2024). Narrative: Smith (2024) found..." }]);
  });
});
