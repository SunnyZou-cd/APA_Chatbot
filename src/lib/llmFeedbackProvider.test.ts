import { afterEach, describe, expect, it, vi } from "vitest";
import type { LlmProviderConfig } from "../types";
import {
  chatCompletionsUrl,
  enhanceCitationWithLlm,
  isLlmConfigured,
  parseLlmCheckResult,
} from "./llmFeedbackProvider";

const configured: LlmProviderConfig = {
  baseUrl: "https://provider.example/v1",
  apiKey: "test-key",
  model: "test-model",
  compatibilityMode: "openaiChatCompletions",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LLM feedback provider", () => {
  it("requires base URL, API key, and model", () => {
    expect(isLlmConfigured(configured)).toBe(true);
    expect(isLlmConfigured({ ...configured, apiKey: "" })).toBe(false);
    expect(isLlmConfigured({ ...configured, model: "" })).toBe(false);
    expect(isLlmConfigured({ ...configured, baseUrl: "" })).toBe(false);
  });

  it("builds OpenAI-compatible chat completions URLs", () => {
    expect(chatCompletionsUrl("https://api.openai.com/v1")).toBe("https://api.openai.com/v1/chat/completions");
    expect(chatCompletionsUrl("https://provider.example/v1/chat/completions")).toBe("https://provider.example/v1/chat/completions");
  });

  it("throws a clear error when config is incomplete", async () => {
    await expect(enhanceCitationWithLlm("Smith, J. (2024). Title. Journal.", { ...configured, apiKey: "" })).rejects.toThrow(
      "Add a base URL, API key, and model",
    );
  });

  it("parses valid structured LLM JSON into safe LLM issues", () => {
    const parsed = parseLlmCheckResult(
      JSON.stringify({
        summary: "The citation looks like MLA.",
        styleGuess: "mla",
        confidence: "medium",
        issues: [
          {
            severity: "ask",
            message: "This looks like MLA.",
            whyItMatters: "APA uses author-date order.",
            hint: "Use original source metadata.",
            studentAction: "Rebuild in APA.",
            ruleId: "style-detection",
            ruleSource: "User-configured LLM",
            suggestedCorrection: "No verified correction.",
            confidence: "medium",
            styleFamily: "mla",
            evidence: "Quoted title and vol./no./pp.",
          },
        ],
        nextSteps: ["Use Build."],
        safetyNotes: ["Do not treat this as source verification."],
      }),
      "unknown",
    );

    expect(parsed.styleGuess).toBe("mla");
    expect(parsed.issues[0]).toEqual(
      expect.objectContaining({
        source: "llm",
        needsInstructorReview: true,
        ruleId: "style-detection",
      }),
    );
  });

  it("falls back safely on invalid JSON", () => {
    const parsed = parseLlmCheckResult("not json", "mla");

    expect(parsed.summary).toBe("The LLM response was not valid JSON.");
    expect(parsed.issues[0]).toEqual(
      expect.objectContaining({
        source: "llm",
        ruleId: "llm-structured-output",
        styleFamily: "mla",
      }),
    );
  });

  it("sends requests only when explicitly called", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: "LLM summary",
                  styleGuess: "apa",
                  confidence: "low",
                  issues: [
                    {
                      severity: "check",
                      message: "Review source type.",
                      whyItMatters: "Source type changes APA format.",
                      hint: "Compare with an example.",
                      studentAction: "Confirm the source type.",
                      ruleId: "source-container",
                      ruleSource: "User-configured LLM",
                      suggestedCorrection: "No verified correction.",
                      confidence: "low",
                      styleFamily: "apa",
                      evidence: "Author-date pattern.",
                    },
                  ],
                  nextSteps: ["Confirm source metadata."],
                  safetyNotes: ["LLM did not verify the source."],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await enhanceCitationWithLlm("Smith, J. (2024). Title. Journal.", configured);
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;

    expect(result.summary).toBe("LLM summary");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calls[0][0]).toBe("https://provider.example/v1/chat/completions");
  });

  it("turns network or CORS failures into a friendly error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));

    await expect(enhanceCitationWithLlm("Smith 45", configured)).rejects.toThrow("Browser CORS policy may block direct BYOK calls");
  });
});
