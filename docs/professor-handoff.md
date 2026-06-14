# APA Coach v1.0 教授评审说明

## 简短介绍

APA Coach v1.0 是一个面向学生的 APA 学习辅助原型。它不是论文生成器，而是一个 citation、reference 和 APA 格式学习教练。

线上评审地址：

```text
https://apa-chatbot.vercel.app
```

学生可以用它：

- 建立 reference entry 与 in-text citation 的对应关系。
- 检查自己写出的 citation 或 reference。
- 先得到 hint，再选择是否查看 suggested correction。
- 学习 APA rule cards、paper setup checklist 和 AI citation/disclosure guidance。

## 当前版本边界

v1.0 不包含：

- 学生账号。
- 数据库。
- 真实 AI API 调用。
- 学生文本保存。
- 全文论文上传。
- 自动生成论文段落或改写论点。

## 建议评审重点

请重点关注：

- 是否符合 Psychology / APA writing 教学目标。
- Feedback 是否足够像 tutor，而不是 answer generator。
- Guardrails 是否清楚。
- AI citation/disclosure wording 是否适合课程政策。
- Build / Check / Learn / Faculty Review 四个入口是否适合学生使用。

## 推荐试用流程

1. 打开网站。
2. 在 Build 中查看 journal article 示例。
3. 删除年份或 DOI，观察 warning 是否清楚。
4. 在 Check 中使用 sample citation，点击 Check citation。
5. 查看 hint-first feedback，并点击 Reveal correction。
6. 在 Learn 中查看 APA rule cards 和 practice prompts。
7. 在 Faculty Review 中查看项目边界和隐私说明。

## 后续可以讨论的问题

- 是否需要加入更多 APA source types。
- 是否需要接入 Citation.js / CSL。
- 是否允许学生提交真实 citation 尝试。
- 是否需要课程专属 rule cards。
- 如果以后接入 AI，是否需要额外披露、审批或 IRB/assessment review。
