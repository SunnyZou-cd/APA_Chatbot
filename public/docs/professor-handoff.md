# APA Coach v1.2 Faculty Review Notes

## Short Description

APA Coach v1.2 is a learning-first APA support prototype. It is designed to help students understand citation structure, APA reference patterns, academic integrity boundaries, and citation-style differences. It is not a paper generator, not a final APA validator, and not a source-verification tool.

Live review URL:

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

## What Students Can Try

- Build a reference entry with matching parenthetical and narrative in-text citations.
- Check a citation or reference attempt with rule-based feedback.
- Detect when an input appears closer to MLA or Chicago than APA.
- Read hint-first feedback before revealing a suggested correction.
- Review APA rule cards, paper setup checks, AI citation/disclosure reminders, and short practice prompts.
- Optionally test user-provided LLM feedback through an OpenAI-compatible BYOK interface.

## Current Boundaries

Version 1.2 does not include:

- Student accounts.
- A database.
- Server-side storage.
- Full-paper uploads.
- Paper drafting or argument rewriting.
- DOI, URL, author, date, or source truth verification.
- A built-in secure backend for API keys.
- Automatic MLA-to-APA or Chicago-to-APA conversion.

## v1.2 Module Summary

### Build

Build supports structured citation practice for selected source types. It uses required-field validation and shows `Incomplete citation` when key source metadata is missing. It does not invent missing source details and does not guarantee complete APA 7 coverage.

### Check

Check combines rule-based diagnosis with citation-style detection. It can flag common APA issues and can identify inputs that appear closer to MLA or Chicago. For example, an MLA-style reference now receives the warning: `This appears closer to MLA style than APA style.`

Check does not verify the real source, does not reliably parse every citation format, and does not perform a trustworthy automatic conversion from MLA or Chicago into APA.

### Optional BYOK LLM Enhancement

The LLM feature is optional and manual. Users may enter an OpenAI-compatible `base URL`, `API key`, and `model`, then click `Enhance with my LLM`. The key is stored only in browser `sessionStorage`.

This feature is intended for controlled review, not public student use. When used, the citation text is sent from the browser to the configured provider. Provider privacy and data handling depend on that provider.

### Learn

Learn includes APA rule cards, paper setup checks, AI citation/disclosure guidance, practice prompts, and citation-style difference cards. It supports learning, but it is not a substitute for instructor policy or an official APA manual.

### Faculty Review

Faculty Review summarizes readiness, academic integrity boundaries, privacy concerns, pilot limitations, and recommended walkthrough steps.

## Suggested Review Focus

Please review:

- Whether the tool feels like a tutor instead of an answer generator.
- Whether the academic integrity boundary is visible and clear.
- Whether the APA examples and warnings fit psychology coursework.
- Whether MLA/Chicago detection is useful for student mistakes.
- Whether optional BYOK LLM feedback is appropriate for faculty review only.
- Whether AI citation and disclosure language should be adjusted for course policy.
- Whether the tool should remain prototype-only before any student pilot.

## Recommended Walkthrough

1. Open the live site.
2. Review the journal article example in Build.
3. Choose an intentionally incomplete example and confirm that the citation is blocked.
4. Open Check and run the default sample.
5. Use the MLA sample and confirm that the style warning is clear.
6. Read the hint-first feedback, then reveal one suggested correction.
7. Review LLM Settings without entering a real API key unless you intend to test your own provider.
8. Open Learn and review the APA and citation-style-difference cards.
9. Open Faculty Review and evaluate the delivery, privacy, and pilot-readiness language.

## Not Pilot-Ready Until

- Faculty approve the curated examples and source-type guidance.
- Course policy language is reviewed for AI disclosure expectations.
- BYOK key handling and provider CORS limitations are explained to reviewers.
- Students are told this is a coach, not a final APA validator.
- Any real student use has an approved privacy and academic-integrity policy.

---

# 中文附录：APA Coach v1.2 教授评审说明

## 简短说明

APA Coach v1.2 是一个以学习为目标的 APA 支持原型。它帮助学生理解 citation 结构、APA reference 模式、学术诚信边界，以及 APA / MLA / Chicago 的差异。它不是论文生成器，也不是最终 APA 验证器。

## 当前边界

v1.2 不提供学生账号、数据库、服务端存储、全文论文上传、论文代写、真实来源验证，也不提供内置安全后端来保存 API key。MLA/Chicago 检测只是识别和解释，不是可靠的自动转换器。

## 模块概览

- Build：练习结构化生成 citation；关键字段缺失时显示 `Incomplete citation`，不会编造来源信息。
- Check：规则诊断 + citation style detection；能识别一些更像 MLA 或 Chicago 的输入。
- Optional BYOK LLM：用户可手动输入 OpenAI-compatible API 信息；API key 只存在浏览器 `sessionStorage`；点击增强时文本会发送给用户配置的 provider。
- Learn：包含 APA rule cards、paper setup、AI disclosure、practice prompts 和 citation style differences。
- Faculty Review：用于教授评审当前能力、隐私边界和试点限制。

## 建议评审重点

请重点看：工具是否像 tutor 而不是答案生成器；MLA/Chicago 检测是否有帮助；BYOK LLM 是否只适合受控评审；是否需要进一步调整课程政策、隐私说明和 AI disclosure 文案。
