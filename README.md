# APA Coach

APA Coach is a learning-first APA citation and writing-support prototype. It helps students build citation pairs, diagnose citation attempts, review extracted full-draft signals, and learn common APA rules without writing papers for them.

## Version

Current version: `1.3.0`

## Live Site

Professor-facing GitHub Pages URL: `https://sunnyzou-cd.github.io/APA_Chatbot/`

## What This App Does

- Builds reference entries with matching parenthetical and narrative citations.
- Flags missing or uncertain citation information instead of inventing details.
- Displays source-type-specific italics in Build while keeping plain text copy behavior.
- Flags compressed author initials, likely italics-review needs, DOI/URL issues, and style-family differences.
- Provides a browser-only Document Check prototype for exported DOCX/PDF/TXT files and pasted text.
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

This project can be delivered through GitHub Pages without using a personal domain.

Recommended professor-facing deployment:

- GitHub Pages URL: `https://<github-username>.github.io/apa-chatbot/`
- Actual GitHub Pages URL: `https://sunnyzou-cd.github.io/APA_Chatbot/`
- Build command for Pages: `npm run build:pages`
- GitHub Actions workflow: `.github/workflows/deploy-github-pages.yml`

The project is also currently deployed on Vercel:

- Production URL: https://apa-chatbot.vercel.app
- Vercel project: `sunnyzou-cds-projects/apa-chatbot`

For future redeploys, use GitHub + Vercel:

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Use these settings:
   - Framework: Vite
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Share the Vercel URL with the professor.

See `public/docs/deployment-guide.md` and `public/docs/v1.3-upgrade-notes.md` for the current professor-facing handoff.
