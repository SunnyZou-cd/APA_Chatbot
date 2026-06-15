# APA Coach v1.2 Deployment Guide

## Recommended Deployment Path

Use GitHub Pages for the professor-facing link. This keeps the project separate from any personal domain. APA Coach v1.2 is still a static Vite React app and does not require a backend server.

Current GitHub Pages URL:

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

## Risk Notes

- Deploying the site uploads source code to GitHub.
- v1.2 does not use student accounts, a database, or server-side student text storage.
- Optional BYOK LLM enhancement is client-side and manual.
- API keys must never be committed to the repository.
- BYOK keys are stored in browser `sessionStorage`, not in project source code.
- If LLM enhancement is used, citation text is sent to the configured provider.
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
- Build, Check, Learn, and Faculty Review are usable.
- Check can flag an MLA-style sample.
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
- The v1.2 BYOK LLM guide if the professor wants to evaluate optional LLM feedback.
- A note that v1.2 is a prototype and is not yet recommended for open student pilot use.

---

# 中文附录：APA Coach v1.2 部署说明

## 推荐部署方式

建议继续使用 GitHub Pages 作为教授评审链接。这样项目不会占用个人网站域名，也符合当前静态前端的形态。

线上地址：

```text
https://sunnyzou-cd.github.io/APA_Chatbot/
```

## 风险说明

v1.2 没有账号、数据库或服务端学生文本存储。可选 LLM 增强是浏览器端 BYOK：用户手动输入 API 信息并手动点击增强后，文本会发送给用户配置的 provider。API key 不能写进源码或仓库。

## 本地检查

运行：

```powershell
npm run check
npm run build:pages
```

成功标志是测试通过、构建成功、页面可用、Check 能识别 MLA 示例、LLM 设置面板可见且不会自动调用 API。
