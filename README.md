# APA Coach

APA Coach is a learning-first APA citation and writing-support prototype. It helps students build citation pairs, diagnose citation attempts, and learn common APA rules without writing papers for them.

## Version

Current version: `1.0.0`

## Live Site

Professor-facing URL: https://apa-chatbot.vercel.app

GitHub Pages target URL after publishing: `https://sunnyzou-cd.github.io/APA_Chatbot/`

## What This App Does

- Builds reference entries with matching parenthetical and narrative citations.
- Flags missing or uncertain citation information instead of inventing details.
- Gives hint-first feedback before revealing a suggested correction.
- Provides APA rule cards, paper setup checks, AI citation guidance, and short practice prompts.
- Includes a faculty review view that explains the learning boundary, privacy posture, and deployment readiness.

## What This App Does Not Do

- It does not write student papers.
- It does not rewrite arguments or literature reviews.
- It does not fabricate authors, dates, DOIs, or sources.
- It does not store student writing.
- It does not call a real AI API in v1.0.

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

See `docs/deployment-guide.md` for a step-by-step handoff.
