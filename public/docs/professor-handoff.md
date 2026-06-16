# APA Coach v1.3 Faculty Review Notes

## Short Description

APA Coach v1.3 is a learning-first APA support prototype. It helps students build citation pairs, diagnose citation and reference attempts, review extracted full-draft signals, and learn APA formatting boundaries. It is not a paper generator, not a final APA validator, and not a source-verification tool.

Live review URL:

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

## What Changed in v1.3

- Reference feedback now checks compressed author initials such as `Lacy, J.T.` and teaches the spaced form `Lacy, J. T.`.
- Build output now displays source-type-specific italics while keeping plain text copy behavior.
- Check now gives source-type-specific italics guidance for journal articles and standalone works.
- A new Document Check prototype lets reviewers upload exported DOCX/PDF/TXT files or paste text.
- Document Check runs in the browser session and reports both automatic findings and manual review reminders.

## Current Boundaries

Version 1.3 does not include student accounts, a database, Google account access, server-side uploads, server-side storage, paper drafting, source truth verification, or automatic final APA approval.

Google Docs should be reviewed by exporting the file as `.docx` or `.pdf` first. The app does not connect to Google Drive or Google Docs.

## Module Summary

### Build

Build supports structured citation practice for selected source types. It blocks missing required metadata, keeps plain text references copyable, and visually marks expected italics for source-type-specific review.

### Check

Check combines rule-based diagnosis with citation-style detection. v1.3 adds author-initial spacing and italics guidance, while preserving the hint-first and reveal-second feedback model.

### Document Check

Document Check reviews extracted text from DOCX, PDF, TXT, or pasted text. It can flag likely reference-section, in-text citation, citation/reference match, initials-spacing, DOI/URL, title-case, and italics-review issues.

It cannot reliably verify layout-sensitive items such as font, margins, double-spacing, hanging indents, title page placement, or heading levels after text extraction. Those items are shown as manual review reminders.

### Optional BYOK LLM Enhancement

The LLM feature remains optional and manual. Users may enter an OpenAI-compatible base URL, API key, and model, then click the enhancement button. The key is stored only in browser `sessionStorage`. Document Check does not automatically send full papers to an LLM.

### Learn and Faculty Review

Learn includes APA rule cards, paper setup checks, AI citation/disclosure guidance, document-check guidance, and practice prompts. Faculty Review summarizes readiness, academic integrity boundaries, privacy concerns, and pilot limitations.

## Recommended Walkthrough

1. Open the live site.
2. Review the journal article example in Build and confirm the journal title and volume are visually italicized.
3. Open Check and test `Lacy, J.T.` to confirm initials-spacing feedback.
4. Use the MLA sample and confirm style detection explains APA versus MLA.
5. Open Document Check, use the sample, and review automatic findings plus manual review reminders.
6. Review LLM Settings without entering a real API key unless you intend to test your own provider.
7. Open Learn and review the References and Document check cards.
8. Open Faculty Review and evaluate the delivery, privacy, and pilot-readiness language.

## Not Pilot-Ready Until

- Faculty approve the curated source examples and source-type guidance.
- Faculty approve the Document Check limitation language.
- Course policy language is reviewed for AI disclosure expectations.
- BYOK key handling and provider CORS limitations are explained to reviewers.
- Students are told this is a coach, not a final APA validator.
- Any real student use has an approved privacy and academic-integrity policy.
