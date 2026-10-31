# H2CO3cumt

<https://H2CO3cumt.github.io> 的源码。

这个站是一个记录本：一边收比赛和工程的档案，一边记日子和技术笔记。视觉上的取舍写在 [`DESIGN.md`](./DESIGN.md) 里，写文章之前建议先读一遍——排版规则、文案语气、哪些做法被明确排除，都在里面。

## 技术栈

- [Astro](https://astro.build) 静态生成，零运行时框架
- 内容集合（content collections）管两种内容：`works`（作品）和 `notes`（随笔）
- 思源宋体 / Source Serif 4 / IBM Plex Mono，自托管，不经过第三方 CDN
- KaTeX 渲染公式，Shiki 做代码高亮（亮暗双主题）
- GitHub Actions 构建并部署到 GitHub Pages

## 本地开发

Node.js 20.19 以上，pnpm 11。

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # 产物在 dist/
pnpm preview   # 预览构建结果
pnpm check     # 类型与内容 schema 检查
```

## 写东西

### 随笔

新建 `src/content/notes/文件名.md`，文件名就是网址（`/notes/文件名/`）：

```yaml
---
title: 标题
date: 2026-08-12
summary: 一句话，出现在列表第二行，可省略。
tags:
  - Verilog
---

正文。
```

### 作品

新建 `src/content/works/项目名.md`。作品页顶部那张参数表由 `specs` 生成，其余正文走 Markdown：

```yaml
---
title: 便携式逻辑分析仪
year: 2026
event: 全国大学生集成电路创新创业大赛
result: 一等奖
summary: 一句话说明。
specs:
  - label: 主控
    value: Xilinx Artix-7 XC7A35T
  - label: 系统时钟
    value: 100 MHz
  - label: 源码
    value: github.com/H2CO3cumt/xxx
    href: https://github.com/H2CO3cumt/xxx
---
```

`src/content/works/example.md` 是一份 `draft: true` 的示例，不会被发布，可以照着改。任何内容加 `draft: true` 就只留在本地。

### 图片

放 `public/` 下，Markdown 里用绝对路径引用：`![说明](/images/xxx.png)`。正文里不要用 HTML `<img>`，除非要控制更多属性。

## 目录

```text
.
├─ DESIGN.md                 # 视觉与文案规范，改版前先读
├─ astro.config.mjs          # site 地址、Markdown 插件、Shiki 主题
├─ public/                   # 原样拷贝的静态文件（favicon、robots.txt、图片）
├─ src/
│  ├─ content.config.ts      # 两个内容集合的 schema
│  ├─ content/
│  │  ├─ works/              # 作品档案
│  │  └─ notes/              # 随笔
│  ├─ components/SpecTable.astro
│  ├─ layouts/Base.astro     # 页眉、页脚、head、字体与全局样式入口
│  ├─ pages/
│  │  ├─ index.astro         # 首页：自述 + 作品索引 + 随笔索引
│  │  ├─ works/              # 列表与详情
│  │  ├─ notes/              # 列表与详情
│  │  ├─ about.astro
│  │  ├─ rss.xml.js
│  │  └─ 404.astro
│  └─ styles/global.css      # 所有样式；token 在文件顶部
└─ .github/workflows/pages.yml
```

## 部署

推送到 `main` 或 `master` 即触发构建，产物 `dist/` 发布到 GitHub Pages。仓库设置里需要确认：

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

## 许可

代码以 MIT 许可开源，见 [`LICENSE`](./LICENSE)。

`src/content/` 下的文章与作品文字、图片、波形图**不在 MIT 授权范围内**，版权由作者保留。要转载先问。
