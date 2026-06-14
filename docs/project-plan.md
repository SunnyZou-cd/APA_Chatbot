# APA Chatbot 项目策划案与 v0.0 原型计划

## 1. 项目背景

APA Chatbot 的定位不是“帮学生生成论文”的工具，而是一个面向学习的 APA 写作与引用教练。它帮助学生识别 APA 格式、引用、参考文献和专业写作中的常见问题，并通过提示、规则解释和示例引导学生自己修正。

该项目适合与 Generative AI Task Force、Psychology Department 和写作支持场景协作推进。核心价值是减少重复性 APA 格式错误，同时保护学生作者身份、学习过程和学术诚信。

## 2. 市场定位

现有工具中，Scribbr、MyBib、Citation Machine、QuillBot 等偏向快速生成 citation；Zotero 更适合作为参考文献管理工具；APA Academic Writer 更接近本项目的教学定位，但范围更大、门槛更高。

本项目的差异化定位是：

- 强调 “learn what to fix and why”，而不是只给最终答案。
- 默认 hint-first，再由学生选择是否 reveal correction。
- 对缺失信息保持透明，不编造作者、日期、DOI 或来源。
- 使用可解释的规则卡片，让学生知道每条反馈来自哪类 APA 规则。
- 对 AI 使用设置边界：可以解释引用和披露要求，但不代写、改写论点或伪造来源。

## 3. 目标用户与核心场景

主要用户：

- Psychology、Education、Social Sciences 等 APA 使用频繁课程中的学生。
- 需要提交 APA student paper 的写作密集型课程学生。
- 希望减少机械格式问题的教师和导师。

核心场景：

- 学生创建一条 journal article、book、webpage 等参考文献。
- 学生检查自己写出的 reference 或 in-text citation。
- 学生学习 APA 中 author/date、sentence case、DOI/URL、hanging indent 等规则。
- 学生理解 generative AI tool 如何引用，以及为什么 course policy 仍然重要。

## 4. v0.0 MVP 范围

v0.0 是一个可运行网页原型，放在 `C:\codex\apa-chatbot`。

包含：

- `Build`：选择 source type，填写字段，生成 reference entry、parenthetical citation、narrative citation。
- `Check`：粘贴 citation 或 reference，返回问题、hint、规则 ID、confidence，并支持 reveal correction。
- `Learn`：展示 rule cards、paper setup checklist、AI citation/disclosure guidance 和练习题。
- 预留 AI feedback provider 接口，但默认实现为 rule-based mock，不调用真实 AI API。
- 前端 UI 全英文，包括按钮、导航、表单、提示、示例、反馈和错误信息。

不包含：

- 登录系统。
- 数据库。
- 全文论文上传。
- 真实 AI API 调用。
- 学生输入持久化保存。
- 教师 dashboard。
- Citation.js / CSL 的完整接入。

## 5. 技术方案

技术栈：

- Vite
- React
- TypeScript
- 本地 CSS
- lucide-react icons

主要数据模型：

- `SourceType`：支持 journal article、book、book chapter、webpage、report、video、course material、generative AI tool。
- `SourceInput`：保存 author、date、title、source、publisher、DOI、URL、pages 等字段。
- `CitationResult`：保存 reference、parenthetical、narrative、citation parts 和 warnings。
- `CheckIssue`：保存 severity、message、hint、ruleId、suggestedCorrection 和 confidence。
- `RuleCard`：保存 rule title、plain-language explanation、example 和 source link。

实现原则：

- Citation 输出优先使用 deterministic rule library。
- AI 只预留为未来的分类、解释和反馈辅助，不作为 APA 最终格式的唯一依据。
- 学生文本不上传、不保存、不发送到外部服务。
- 反馈默认先提示，再由学生点击 reveal correction。

## 6. 守护边界

工具必须拒绝或避免以下行为：

- 写整段论文、discussion、literature review 或 argument。
- 改写学生的核心观点。
- 生成不存在的 source、DOI、作者或年份。
- 隐藏 AI 使用。
- 把 instructor policy 当成固定统一规则。

工具应该鼓励：

- 查找原始来源。
- 对缺失字段使用 APA 允许的透明处理方式。
- 对不确定规则咨询 instructor。
- 把反馈作为学习过程，而不是复制粘贴的终点。

## 7. 测试与验收标准

文档验收：

- `docs/project-plan.md` 可以独立阅读。
- 覆盖项目背景、市场定位、目标用户、MVP、技术方案、守护边界、测试计划。

网页验收：

- 首页直接进入工具界面，不是营销落地页。
- UI 全英文，不出现中文界面文字。
- `Build` 可以生成 reference、parenthetical、narrative。
- 缺少 author、date、DOI/URL 时会显示 warning。
- `Check` 对 sample reference 能提示缺年份、标题大小写、缺 DOI/URL 等问题。
- correction 默认隐藏，需要点击 reveal。
- `Learn` 展示 rule cards、checklist、practice prompts。
- 桌面端和移动端布局不重叠。
- 没有真实外部 API 请求。

## 8. 后续阶段

v0.1：

- 增加更多 source-type 格式规则。
- 扩充测试用例库。
- 增加 citation/reference matching 练习。

v0.2：

- 接入 Citation.js 或 CSL 处理更可靠的 APA 输出。
- 加入 export to docx 或 copy reference list。
- 增加 faculty review mode 的静态说明页。

v0.3：

- 在完成隐私、费用和失败兜底设计后，接入真实 AI feedback provider。
- 加入 API key 配置和清晰的学生隐私提示。
- 增加 instructor policy reminder 和可配置 assignment constraints。

Future：

- 可选 faculty assignment link。
- 聚合型、匿名化 analytics。
- 经过审批后的 pilot plan。
