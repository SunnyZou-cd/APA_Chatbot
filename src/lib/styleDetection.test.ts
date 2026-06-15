import { describe, expect, it } from "vitest";
import { styleDetectionCases } from "../data/styleDetectionCases";
import { detectCitationStyle } from "./styleDetection";

describe("citation style detection", () => {
  it("includes at least 20 mixed APA, MLA, Chicago, and unknown cases", () => {
    expect(styleDetectionCases.length).toBeGreaterThanOrEqual(20);
    expect(new Set(styleDetectionCases.map((item) => item.expectedStyle))).toEqual(
      new Set(["apa", "mla", "chicago", "unknown"]),
    );
  });

  it.each(styleDetectionCases)("detects $expectedStyle for $id", (testCase) => {
    expect(detectCitationStyle(testCase.input).guess).toBe(testCase.expectedStyle);
  });

  it("returns the exact MLA warning message needed by the Check UI", () => {
    const result = detectCitationStyle('Smith, John. "Learning APA Style." Journal of Student Writing, vol. 12, no. 2, 2024, pp. 45-61.');

    expect(result.message).toBe("This appears closer to MLA style than APA style.");
    expect(result.studentAction).toContain("rebuild");
    expect(result.evidence.length).toBeGreaterThan(0);
  });
});
