import type { CheckIssue, CitationStyleGuess, LlmCheckResult, LlmProviderConfig } from "../types";
import { detectCitationStyle } from "./styleDetection";

export class LlmProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmProviderError";
  }
}

export function isLlmConfigured(config: LlmProviderConfig): boolean {
  return Boolean(config.baseUrl.trim() && config.apiKey.trim() && config.model.trim());
}

export function chatCompletionsUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  if (!normalized) return "";
  if (normalized.endsWith("/chat/completions")) return normalized;
  return `${normalized}/chat/completions`;
}

function safeIssue(params: Omit<CheckIssue, "source">): CheckIssue {
  return {
    source: "llm",
    needsInstructorReview: true,
    ...params,
  };
}

function fallbackResult(summary: string, styleGuess: CitationStyleGuess, confidence: LlmCheckResult["confidence"]): LlmCheckResult {
  return {
    summary,
    styleGuess,
    confidence,
    issues: [
      safeIssue({
        severity: "ask",
        message: "LLM feedback could not be structured safely.",
        whyItMatters: "The coach should not display unvalidated AI output as final citation advice.",
        hint: "Use the rule-based feedback first, then try another provider or model if needed.",
        studentAction: "Do not treat this LLM response as a verified APA correction.",
        ruleId: "llm-structured-output",
        ruleSource: "APA Coach LLM safety parser",
        suggestedCorrection: "No LLM correction is shown because the response did not match the expected structure.",
        confidence,
        styleFamily: styleGuess,
      }),
    ],
    nextSteps: ["Use the rule-based diagnosis and rebuild the source from original metadata."],
    safetyNotes: ["LLM output is optional coaching feedback and does not verify the source."],
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function normalizeStyleGuess(value: unknown, fallback: CitationStyleGuess): CitationStyleGuess {
  return value === "apa" || value === "mla" || value === "chicago" || value === "unknown" ? value : fallback;
}

function normalizeConfidence(value: unknown): LlmCheckResult["confidence"] {
  return value === "high" || value === "medium" || value === "low" ? value : "low";
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? trimmed;
  return JSON.parse(candidate);
}

export function parseLlmCheckResult(text: string, fallbackStyleGuess: CitationStyleGuess): LlmCheckResult {
  try {
    const parsed = extractJson(text) as Record<string, unknown>;
    const styleGuess = normalizeStyleGuess(parsed.styleGuess, fallbackStyleGuess);
    const confidence = normalizeConfidence(parsed.confidence);
    const rawIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const issues = rawIssues
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .slice(0, 6)
      .map((item) =>
        safeIssue({
          severity: item.severity === "fix" || item.severity === "check" || item.severity === "ask" ? item.severity : "ask",
          message: typeof item.message === "string" ? item.message : "LLM feedback needs review.",
          whyItMatters: typeof item.whyItMatters === "string" ? item.whyItMatters : "LLM output can be incomplete or mistaken.",
          hint: typeof item.hint === "string" ? item.hint : "Compare with the rule-based feedback.",
          studentAction: typeof item.studentAction === "string" ? item.studentAction : "Verify the original source metadata.",
          ruleId: typeof item.ruleId === "string" ? item.ruleId : "llm-feedback",
          ruleSource: typeof item.ruleSource === "string" ? item.ruleSource : "User-configured LLM",
          suggestedCorrection: typeof item.suggestedCorrection === "string" ? item.suggestedCorrection : "No verified correction provided.",
          confidence: normalizeConfidence(item.confidence),
          styleFamily: normalizeStyleGuess(item.styleFamily, styleGuess),
          evidence: typeof item.evidence === "string" ? item.evidence : undefined,
          needsInstructorReview: true,
        }),
      );

    if (typeof parsed.summary !== "string" || issues.length === 0) {
      return fallbackResult("The LLM response was missing required coaching fields.", styleGuess, "low");
    }

    return {
      summary: parsed.summary,
      styleGuess,
      confidence,
      issues,
      nextSteps: asStringArray(parsed.nextSteps),
      safetyNotes: asStringArray(parsed.safetyNotes),
    };
  } catch {
    return fallbackResult("The LLM response was not valid JSON.", fallbackStyleGuess, "low");
  }
}

function promptForCitationCheck(text: string): string {
  return `You are APA Coach, a citation tutor. Diagnose the student's citation attempt without verifying real source truth and without claiming final APA accuracy.

Return only JSON with this shape:
{
  "summary": "short tutoring summary",
  "styleGuess": "apa | mla | chicago | unknown",
  "confidence": "high | medium | low",
  "issues": [
    {
      "severity": "fix | check | ask",
      "message": "short issue title",
      "whyItMatters": "why this matters for APA learning",
      "hint": "hint-first feedback",
      "studentAction": "what the student should do next",
      "ruleId": "short-rule-id",
      "ruleSource": "APA Coach LLM guidance",
      "suggestedCorrection": "optional correction or no verified correction",
      "confidence": "high | medium | low",
      "styleFamily": "apa | mla | chicago | unknown",
      "evidence": "brief text signal"
    }
  ],
  "nextSteps": ["short action"],
  "safetyNotes": ["short caution"]
}

Student citation attempt:
${text}`;
}

async function callChatCompletions(config: LlmProviderConfig, prompt: string): Promise<string> {
  if (!isLlmConfigured(config)) {
    throw new LlmProviderError("Add a base URL, API key, and model before using LLM enhancement.");
  }

  try {
    const response = await fetch(chatCompletionsUrl(config.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: "You provide cautious citation tutoring. Never claim source verification. Return only JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new LlmProviderError(`The provider returned HTTP ${response.status}. Check the base URL, key, model, and provider quota.`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new LlmProviderError("The provider response did not include message content.");
    }
    return content;
  } catch (error) {
    if (error instanceof LlmProviderError) throw error;
    throw new LlmProviderError("The request could not reach the provider. Browser CORS policy may block direct BYOK calls. Use a provider that supports browser requests or a compatible proxy.");
  }
}

export async function enhanceCitationWithLlm(text: string, config: LlmProviderConfig): Promise<LlmCheckResult> {
  const fallbackStyleGuess = detectCitationStyle(text).guess;
  const content = await callChatCompletions(config, promptForCitationCheck(text));
  return parseLlmCheckResult(content, fallbackStyleGuess);
}

export async function testLlmConnection(config: LlmProviderConfig): Promise<string> {
  await callChatCompletions(config, 'Return only JSON: {"summary":"APA Coach ready","styleGuess":"unknown","confidence":"low","issues":[{"severity":"check","message":"Connection test passed","whyItMatters":"The provider accepted a request.","hint":"Use LLM enhancement only when needed.","studentAction":"Return to the citation check.","ruleId":"llm-connection","ruleSource":"APA Coach connection test","suggestedCorrection":"No citation correction was requested.","confidence":"low","styleFamily":"unknown","evidence":"connection test"}],"nextSteps":["Run rule-based feedback first."],"safetyNotes":["No student citation was sent in this test."]}');
  return "Connection test passed. No student citation was sent.";
}
