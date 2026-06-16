# APA Coach v1.3 Deployment Guide

## Recommended Deployment Path

Use GitHub Pages for the professor-facing link. APA Coach v1.3 is still a static Vite React app and does not require a backend server.

Current GitHub Pages URL:

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

## Risk Notes

- Deploying the site uploads source code to GitHub.
- v1.3 does not use student accounts, a database, Google login, or server-side student document storage.
- Document Check reads DOCX/PDF/TXT files in the browser session and does not upload them to this app.
- Optional BYOK LLM enhancement is client-side and manual.
- API keys must never be committed to the repository.
- BYOK keys are stored in browser `sessionStorage`, not in project source code.
- If LLM enhancement is used, the current citation text is sent to the configured provider.
- Any student-data collection, analytics, or AI processing should be reviewed before a student pilot.

## Local Production Check

```powershell
npm run check
npm run build:pages
```

Success signs:

- Tests pass.
- The GitHub Pages build finishes without errors.
- The `dist` folder is created.
- Build, Check, Document Check, Learn, and Faculty Review are usable.
- Check can flag an MLA-style sample and compressed initials.
- Document Check can run the sample and show manual review reminders.
- The LLM settings panel is visible but does not call an API unless the user manually configures and triggers it.

## GitHub Pages Settings

This repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy-github-pages.yml
```

Set GitHub Pages to:

```text
Source: GitHub Actions
```

The workflow runs tests, audits high-severity dependencies, and builds with:

```text
npm run build:pages
```

## Vercel Fallback Notes

GitHub Pages is the preferred professor-facing deployment. If a Vercel fallback is used, use:

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

Do not put provider API keys in frontend source code or public Vercel environment variables for this static build.

## Share With Faculty

Send:

- The deployed GitHub Pages URL.
- The Faculty Review page in the app.
- The professor handoff notes.
- The v1.3 upgrade notes.
- The v1.2 BYOK LLM guide if the professor wants to evaluate optional LLM feedback.
- A note that v1.3 is a prototype and is not yet recommended for open student pilot use.
