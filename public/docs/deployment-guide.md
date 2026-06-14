# APA Coach v1.0 Deployment Guide

## Recommended Deployment Path

Use GitHub Pages for the professor-facing link. This keeps the project separate from any personal domain. The project is a static Vite React app, so it does not need a backend server for version 1.0.

Current Vercel fallback URL:

```text
https://apa-chatbot.vercel.app
```

GitHub Pages target URL after publishing:

```text
https://<github-username>.github.io/apa-chatbot/
```

## Risk Notes

- Deploying the site uploads source code to GitHub and Vercel.
- Version 1.0 does not call a live AI API, does not store student text, and does not use a database.
- Future API keys must not be placed in frontend source code.
- Any student-data collection, analytics, or AI processing should be reviewed before a student pilot.

## Local Production Check

```powershell
npm run build
npm run preview
```

Success signs:

- The build finishes without errors.
- The `dist` folder is created.
- The preview page loads the APA Coach interface.
- Build, Check, Learn, and Faculty Review are usable.

## GitHub Pages Settings

This repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy-github-pages.yml
```

Set GitHub Pages to:

```text
Source: GitHub Actions
```

The workflow builds with:

```text
npm run build:pages
```

## Vercel Fallback Settings

Use these settings when importing the GitHub repository:

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

This repository also includes `vercel.json`, so Vercel should detect the same settings automatically.

Current Vercel project:

```text
sunnyzou-cds-projects/apa-chatbot
```

## Share With Faculty

Send:

- The deployed site URL.
- The Faculty Review page in the app.
- The repository README if the professor wants project details.
- A note that version 1.0 is a prototype with no student text storage and no live AI API calls.
