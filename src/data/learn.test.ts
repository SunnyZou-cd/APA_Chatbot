import { describe, expect, it } from "vitest";
import { assignmentMistakes, checklistItems, practicePrompts, ruleCards } from "./rules";

const expectedTopics = [
  "In-text citations",
  "References",
  "Paper setup",
  "AI citation/disclosure",
  "Citation style differences",
];

describe("learn module data", () => {
  it("includes rule cards for every topic filter", () => {
    for (const topic of expectedTopics) {
      expect(ruleCards.some((rule) => rule.topic === topic)).toBe(true);
    }
  });

  it.each(ruleCards)("keeps rule card $id complete for student learning", (rule) => {
    expect(rule.title).toBeTruthy();
    expect(rule.plainLanguageRule).toBeTruthy();
    expect(rule.example).toBeTruthy();
    expect(rule.commonMistake).toBeTruthy();
    expect(rule.studentAction).toBeTruthy();
    expect(rule.askInstructorWhen).toBeTruthy();
    expect(rule.officialLink).toMatch(/^https:\/\//);
  });

  it.each(practicePrompts)("includes explanation and feedback for prompt %#", (prompt) => {
    expect(prompt.explanation).toBeTruthy();
    expect(prompt.apaPrinciple).toBeTruthy();
    expect(prompt.nextStep).toBeTruthy();
    expect(prompt.choices.length).toBeGreaterThanOrEqual(2);
    expect(prompt.choices.some((choice) => choice.value === prompt.answer)).toBe(true);

    for (const choice of prompt.choices) {
      expect(choice.feedback).toBeTruthy();
    }
  });

  it("includes a practical paper setup checklist", () => {
    expect(checklistItems.length).toBeGreaterThanOrEqual(8);
    expect(checklistItems.join(" ")).toContain("hanging indentation");
  });

  it("includes AI citation and disclosure practice", () => {
    expect(practicePrompts.some((prompt) => prompt.prompt.includes("AI disclosure"))).toBe(true);
    expect(ruleCards.some((rule) => rule.id === "ai-disclosure")).toBe(true);
  });

  it("includes first-year assignment mistake guidance", () => {
    expect(assignmentMistakes.length).toBeGreaterThanOrEqual(4);
    expect(assignmentMistakes.some((item) => item.title.includes("MLA"))).toBe(true);
  });
});
