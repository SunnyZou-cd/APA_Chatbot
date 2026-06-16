# APA Coach

APA Coach is a learning-first APA citation and writing-support prototype. It helps students build citation pairs, diagnose citation attempts, review extracted full-draft signals, and learn common APA rules without writing papers for them.

## Version

Current version: `1.4.0`

## Live Site

Professor-facing Vercel URL: `https://apa-chatbot.vercel.app`

Static GitHub Pages fallback: `https://sunnyzou-cd.github.io/APA_Chatbot/`

## What This App Does

- Builds reference entries with matching parenthetical and narrative citations.
- Flags missing or uncertain citation information instead of inventing details.
- Displays source-type-specific italics in Build while keeping plain text copy behavior.
- Provides Document Check as the main APA review entry point.
- Checks full documents, rich-text pasted excerpts, and single citation/reference entries in one workflow.
- Parses DOCX/PDF/TXT through a Vercel API route without storing files.
- Preserves DOCX and rich-text paste italics/bold in the editable review area.
- Detects parenthetical, narrative, multi-source, and `et al.` in-text citation patterns.
- Parses likely reference entries, guesses source type, and generates best-effort corrections with confidence labels.
- Flags compressed author initials, DOI/URL issues, title-case review needs, italics-review needs, and citation/reference mismatch.
- Gives hint-first feedback before revealing a suggested correction.
- Provides APA rule cards, paper setup checks, AI citation guidance, and short practice prompts.
- Includes a faculty review view that explains the learning boundary, privacy posture, and deployment readiness.

## What This App Does Not Do

- It does not write student papers.
- It does not rewrite arguments or literature reviews.
- It does not fabricate authors, dates, DOIs, or sources.
- It does not store uploaded documents or student writing.
- It does not connect to Google Docs or Google Drive; export a DOCX or PDF first.
- It does not guarantee final APA layout validation for fonts, margins, spacing, headings, title pages, or hanging indents.
- It does not call a real AI API unless a reviewer manually configures BYOK LLM enhancement and clicks the enhancement button.

## Local Development

```powershell
npm install
npm run dev
```

Success sign: open `http://127.0.0.1:5173/` and see the APA Coach interface.

## Production Check

```powershell
npm run build
npm run preview
```

Success sign: the production build appears in `dist`, and the preview page loads.

## Recommended Deployment

v1.4 should be reviewed on Vercel because Document Check uses a light API route.

- Production URL: https://apa-chatbot.vercel.app
- Vercel project: `sunnyzou-cds-projects/apa-chatbot`
- Build command: `npm run build`
- Output directory: `dist`

GitHub Pages can still host a static fallback, but it cannot run `/api/document-check`.

For future redeploys, use GitHub + Vercel:

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Use these settings:
   - Framework: Vite
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Share the Vercel URL with the professor.

See `public/docs/deployment-guide.md` and `public/docs/v1.4-upgrade-notes.md` for the current professor-facing handoff.
