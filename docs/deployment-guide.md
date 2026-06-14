# APA Coach v1.0 部署指南

这份指南的目标是把本地网页交付变成一个教授可以直接打开的网址。当前推荐使用 GitHub Pages，因为它不占用个人站域名，也适合课程项目展示。

当前 Vercel 备用地址：

```text
https://apa-chatbot.vercel.app
```

GitHub Pages 发布后的目标地址格式：

```text
https://<github-username>.github.io/apa-chatbot/
```

## 1. 部署前风险说明

- 上传到 GitHub/Vercel 后，源码会进入外部平台。
- 当前 v1.0 没有真实 AI API、没有账号登录、没有数据库、没有学生文本持久化存储。
- 如果以后接入 AI API，不要把 API key 写进前端源码；必须放在 Vercel 环境变量或后端服务中。
- 如果要收集真实学生数据或分析使用行为，应先确认课程政策、隐私说明和 IRB/assessment 边界。

## 2. 本地验收

在项目目录运行：

```powershell
cd C:\codex\apa-chatbot
npm run build
npm run preview
```

成功标志：

- `npm run build` 没有报错。
- 生成 `dist` 文件夹。
- 本地预览页面能打开 APA Coach。
- Build、Check、Learn、Faculty Review 四个入口都能使用。

## 3. 准备 GitHub 仓库

建议提交这些文件：

- `src`
- `docs`
- `index.html`
- `package.json`
- `package-lock.json`
- `README.md`
- `.gitignore`
- `vercel.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`

不要提交：

- `node_modules`
- `dist`
- `.env`
- `.vercel`

成功标志：

- GitHub 上能看到源码和文档。
- GitHub 上看不到 `node_modules`、`.env`、`.vercel`。

## 4. GitHub Pages 设置

项目已经包含 GitHub Actions 工作流：

```text
.github/workflows/deploy-github-pages.yml
```

它会在 push 到 `main` 时自动：

- 安装依赖。
- 运行 `npm run build:pages`。
- 上传 `dist`。
- 发布到 GitHub Pages。

GitHub 仓库需要启用：

```text
Settings -> Pages -> Source -> GitHub Actions
```

成功标志：

- GitHub Actions 里的 Deploy to GitHub Pages 工作流变绿。
- Pages 页面显示一个 `https://...github.io/apa-chatbot/` 链接。
- 打开链接后能看到 APA Coach v1.0。

## 5. Vercel 备用设置

在 Vercel 中导入 GitHub 仓库，使用：

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

本项目已包含 `vercel.json`，Vercel 通常会自动读取这些设置。

成功标志：

- Vercel 显示 Deployment Succeeded 或 Ready。
- 获得一个 `https://...vercel.app` 地址。
- 打开地址后能看到 APA Coach v1.0。

当前项目已经链接到：

```text
Vercel project: sunnyzou-cds-projects/apa-chatbot
Production URL: https://apa-chatbot.vercel.app
```

## 6. 给教授的交付内容

建议发给教授：

- 网站链接。
- `docs/professor-handoff.md` 中的简短说明。
- 说明当前是 v1.0 prototype，不会保存学生文本，也没有接入真实 AI API。
- 说明希望教授重点评审：教学边界、APA 规则说明、心理学写作适配性、是否适合学生试用。

## 7. 后续更新方式

每次修改后：

```powershell
git add .
git commit -m "Update APA Coach"
git push
```

成功标志：

- Vercel 自动开始新的部署。
- 部署成功后，线上链接显示最新版本。
