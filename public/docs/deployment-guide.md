# APA Coach v1.5 Deployment Guide

## Recommended Deployment Path

Use Vercel for the professor-facing v1.5 link. Document Check depends on a light API route:

```text
POST /api/document-check
```

Current Vercel URL:

```text
https://apa-chatbot.vercel.app
```

GitHub Pages can remain as a static fallback, but it cannot run the v1.5 API.

## Risk Notes

- Deploying the site uploads source code to the hosting provider.
- v1.5 does not use student accounts, a database, Google login, or persistent student document storage.
- DOCX/PDF/TXT files are parsed only during the current API request.
- Optional BYOK LLM enhancement is manual and uses browser `sessionStorage`.
- API keys must never be committed to the repository.
- If LLM enhancement is used, the current document text is sent to the configured provider.
- Any student-data collection, analytics, or AI processing should be reviewed before a student pilot.

## Local Production Check

```powershell
npm run check
```

Success signs:

- Tests pass.
- Frontend build finishes without errors.
- Vercel API TypeScript check finishes without errors.
- Audit reports no high-severity dependency vulnerabilities.
- Build, Document Check, Learn, and Faculty Review are usable.
- Document Check can run Full document and Single reference / excerpt modes.
- DOCX extraction preserves italic/bold in HTML.
- PDF extraction returns text with layout-sensitive checks marked for manual review.

## Vercel Settings

Use:

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Node.js Version: 24.x
```

This repository includes:

```text
api/document-check.ts
vercel.json
tsconfig.api.json
```

The API route parses multipart input and returns structured Document Check feedback. It does not write uploaded files to a database.

## GitHub Pages Fallback

The existing GitHub Pages workflow can still publish a static page:

```text
.github/workflows/deploy-github-pages.yml
npm run build:pages
```

Do not use GitHub Pages as the v1.5 professor review target because `/api/document-check` will not run there.

## Share With Faculty

Send:

- The deployed Vercel URL.
- The Faculty Review page in the app.
- The professor handoff notes.
- The v1.5 upgrade notes.
- The v1.2 BYOK LLM guide if the professor wants to evaluate optional LLM feedback.
- A note that v1.5 is a review build and is not yet recommended for open student pilot use.
