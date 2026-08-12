# H2CO3cumt 技术博客

这是部署到 <https://H2CO3cumt.github.io> 的个人技术博客源码，使用 **Hexo 8 + Butterfly 5** 构建，适合持续记录 FPGA、Verilog / RTL、数字电路、Robei EDA、Python、项目开发与学习日常。

博客支持 Markdown、Verilog / SystemVerilog 等代码高亮与复制、MathJax 数学公式、Mermaid 图表、文章目录、本地搜索、分类/标签/归档、RSS、站点地图、深色模式和移动端布局。

## 第一次安装

### 1. 安装 Node.js

安装 Node.js 22 LTS（最低要求为 Node.js 20.19）。安装后在终端确认：

```bash
node --version
```

### 2. 安装 pnpm

```bash
npm install -g pnpm
```

### 3. 安装博客依赖

进入本仓库目录后执行：

```bash
pnpm install
```

依赖版本记录在 `package.json` 与 `pnpm-lock.yaml` 中。一般不需要全局安装 Hexo。

## 本地预览

```bash
pnpm run server
```

然后访问终端提示的地址，默认是 <http://localhost:4000>。编辑 Markdown 后刷新页面即可查看结果。

生成完整静态网站并执行检查：

```bash
pnpm run build
pnpm run check
```

生成的网站位于 `public/`；该目录由构建自动产生，不需要提交到 Git。

## 新建文章

```bash
pnpm exec hexo new "文章标题"
```

也可以使用项目脚本：

```bash
pnpm run new -- "文章标题"
```

文章会出现在 `source/_posts/`，默认文件名包含日期。打开生成的 Markdown 文件填写内容：

```yaml
---
title: 文章标题
date: 2026-08-12 20:00:00
updated: 2026-08-12 20:00:00
categories:
  - FPGA
  - Verilog
tags:
  - FSM
  - RTL
description: 用一两句话概括文章内容。
cover: 'linear-gradient(135deg, #0a2b45, #0d7891)'
mathjax: false
mermaid: false
---
```

`categories` 和 `tags` 可自由增加，不受现有分类限制。上面的多级分类写法表示 `FPGA → Verilog`。

## 插入图片

把图片放入 `source/images/` 下，例如：

```text
source/images/posts/fsm/state-waveform.png
```

然后在 Markdown 中使用站点根路径：

```markdown
![状态机仿真波形](/images/posts/fsm/state-waveform.png "状态机仿真波形")
```

图片会自动限制在正文宽度内、按需加载并显示圆角；替代文字会作为图片说明。建议按文章建立子目录，不要把所有图片堆在同一层。

## 代码、公式与 Mermaid

代码块写法：

````markdown
```verilog
always @(posedge clk) begin
  q <= d;
end
```
````

常用语言标记包括 `verilog`、`systemverilog`、`python`、`c`、`cpp`、`bash`、`json`、`yaml`。

需要公式的文章，把头部的 `mathjax` 改为 `true`：

```markdown
行内公式：$T = N \times T_{clk}$

块级公式：

$$
u(k) = K_p e(k) + K_i \sum_{i=0}^{k} e(i)
$$
```

需要 Mermaid 的文章，把头部的 `mermaid` 改为 `true`：

````markdown
{% mermaid %}
flowchart LR
  A[输入] --> B[处理] --> C[输出]
{% endmermaid %}
````

这里采用 Butterfly 原生 Mermaid 标签写法，可避免代码高亮器先处理图表源码。

## 发布

正常情况下只需要提交博客源码和 Markdown：

```bash
git add .
git commit -m "新增文章：文章标题"
git push
```

推送到 `main` 或 `master` 后，`.github/workflows/pages.yml` 会自动：

1. 安装锁定依赖；
2. 构建 Hexo；
3. 检查生成页面与本地资源；
4. 发布到 GitHub Pages。

第一次使用时，需要在 GitHub 仓库中打开：

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

设置一次即可。之后不需要手工提交 `public/`。

## 修改个人信息和首页内容

常改位置如下：

| 要修改的内容 | 文件 |
| --- | --- |
| 网站名称、副标题、描述、作者、网址 | `_config.yml` |
| 导航栏、GitHub 链接、颜色、深色模式、搜索、TOC | `_config.butterfly.yml` |
| 首页说明、分类入口、项目卡片 | `source/_data/site.yml` |
| About 内容 | `source/about/index.md` |
| 头像 | `source/images/avatar/avatar-placeholder.svg`，并在 `_config.butterfly.yml` 修改路径 |
| favicon | `source/images/favicon.svg` |
| 自定义样式 | `source/css/custom.css` |

没有提供的个人资料均保留为“待填写”，请按需替换。

## 修改 Banner

当前 Banner 使用纯 CSS 深蓝/青蓝背景，不依赖外部图片。若要换成自己的图片：

1. 将图片放到 `source/images/banner.jpg`；
2. 打开 `_config.butterfly.yml`；
3. 把 `index_img` 改为：

```yaml
index_img: /images/banner.jpg
```

`default_top_img` 控制普通页面和文章未单独指定时的 Banner。文章也可在 Markdown 头部用 `top_img` 或 `cover` 指定自己的图片。

## 修改导航

打开 `_config.butterfly.yml`，修改 `menu`：

```yaml
menu:
  首页: / || fas fa-home
  文章: /articles/ || fas fa-book-open
  项目: /projects/ || fas fa-microchip
  关于: /about/ || fas fa-user
```

格式是 `显示名称: 路径 || 图标类名`。

## 新增分类和标签

分类和标签来自每篇 Markdown 的头部配置，会自动生成聚合页面，不需要手写 HTML：

```yaml
categories:
  - 数字电路
tags:
  - 时序分析
  - CDC
```

如果希望新分类同时显示在首页“技术分类”入口中，再编辑 `source/_data/site.yml` 的 `categories` 列表。文章本身不受该列表限制。

## 示例内容

`source/_posts/` 中自带三篇明确标记的示例文章，用于验证欢迎页、Verilog 代码、表格、公式、Mermaid 和项目记录模板。确认网站运行正常后，可以修改或删除它们。

## 目录说明

```text
.
├─ .github/workflows/       # GitHub Pages 自动构建部署
├─ scaffolds/               # 新文章模板
├─ scripts/                 # 首页扩展、文章页生成与构建检查
├─ source/
│  ├─ _data/                # 首页/项目集中数据
│  ├─ _posts/               # Markdown 文章
│  ├─ about/                # 关于页面
│  ├─ projects/             # 项目页面
│  ├─ images/               # Banner、头像、封面和文章图片
│  ├─ css/                  # 自定义视觉样式
│  └─ js/                   # 轻量交互脚本
├─ _config.yml              # Hexo 站点配置
├─ _config.butterfly.yml    # Butterfly 主题覆盖配置
├─ package.json             # 依赖与命令
└─ pnpm-lock.yaml           # 锁定依赖版本
```

主题通过 npm 安装，自定义内容全部放在主题外部，后续更新 Butterfly 时无需覆盖主题核心源码。
