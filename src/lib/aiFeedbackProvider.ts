import type { CheckIssue } from "../types";
import { diagnoseCitation } from "./diagnosis";

export interface AiFeedbackProvider {
  diagnoseCitation(text: string): Promise<CheckIssue[]>;
}

export class RuleBasedFeedbackProvider implements AiFeedbackProvider {
  async diagnoseCitation(text: string): Promise<CheckIssue[]> {
    return diagnoseCitation(text);
  }
}

export const aiFeedbackProvider: AiFeedbackProvider = new RuleBasedFeedbackProvider();
