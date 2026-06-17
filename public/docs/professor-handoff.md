# APA Coach v1.5 Faculty Review Notes

## Short Description

APA Coach v1.5 is a learning-first APA support prototype. It helps students build citation pairs, review full documents or single references, and learn APA formatting boundaries without writing papers for them.

Live review URL:

```text
https://apa-chatbot.vercel.app
```

Static fallback:

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

The Vercel URL is the v1.5 review target because Document Check uses `/api/document-check`.

## What Changed in v1.5

- Document Check remains the main review entry point.
- The old Check workflow is folded into Document Check as Single reference / excerpt mode.
- Incomplete Build citations now show a non-copyable incomplete state instead of a complete-looking reference.
- Document Check results separate Detected issue, Possible issue, and Manual review required.
- Uploaded files show filename, type, size, parsing status, and layout reliability.
- PDF checks are presented as text extraction review, not full layout validation.
- LLM Settings are collapsed by default and include stronger key-use warnings.
- Learn practice prompts now include why, APA principle, and next-step feedback.
- Faculty Review includes a 3-step review flow and a feedback template.

## v1.4 Foundation

- DOCX/PDF/TXT parsing moved to a Vercel API route instead of a frontend dynamic import.
- DOCX and rich-text paste can preserve italic, bold, and basic paragraph structure in the review area.
- The parser recognizes parenthetical, narrative, multi-source, and `et al.` in-text citation patterns.
- Reference parsing now guesses source type and extracts candidate metadata.
- Corrections are best-effort, source-type-specific, and show confidence plus metadata-confirmation reminders.

## Current Boundaries

Version 1.5 does not include student accounts, a database, Google account access, Google Docs login, paper drafting, source truth verification, or automatic final APA approval.

Uploaded files are parsed only for the current request. The app does not save uploads to a database or connect to Google Drive.

PDF layout extraction is lower confidence than DOCX. Font, spacing, margins, heading levels, hanging indents, and title-page layout remain manual review items.

## Module Summary

### Build

Build supports structured citation practice for selected source types. It keeps plain text references copyable while visually marking expected italics.

### Document Check

Document Check accepts exported DOCX/PDF/TXT files, rich-text paste, and single references or excerpts. It can identify likely References sections, in-text citations, reference entries, citation/reference mismatches, compressed initials, DOI/URL issues, title-case review needs, and italics-review needs.

Generated corrections should be treated as teaching suggestions. Students must confirm the source type and metadata before using them.

### Optional BYOK LLM Enhancement

The LLM feature remains optional and manual. Users may enter an OpenAI-compatible base URL, API key, and model, then click the enhancement button. Document Check does not automatically send full papers to an LLM.

### Learn and Faculty Review

Learn includes APA rule cards, paper setup checks, AI citation/disclosure guidance, document-check guidance, and practice prompts. Faculty Review summarizes readiness, academic integrity boundaries, privacy concerns, and pilot limitations.

## Recommended Walkthrough

1. Open the Vercel live site.
2. Review the journal article example in Build and confirm the journal title and volume are visually italicized.
3. Open Document Check and run the sample in Full document mode.
4. Switch to Single reference / excerpt mode and check a single reference.
5. Upload a DOCX exported from Google Docs or Word and confirm italic/bold text remains visible.
6. Review generated corrections and the metadata confirmation panel.
7. Review LLM Settings without entering a real API key unless you intend to test your own provider.
8. Open Learn and review the References and Document check cards.

## Not Pilot-Ready Until

- Faculty approve the curated source examples and source-type guidance.
- Faculty approve the Document Check limitation language.
- Course policy language is reviewed for AI disclosure expectations.
- BYOK key handling and provider CORS limitations are explained to reviewers.
- Students are told this is a coach, not a final APA validator.
- Any real student use has an approved privacy and academic-integrity policy.
