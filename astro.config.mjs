import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://H2CO3cumt.github.io',
  build: { format: 'directory' },
  markdown: {
    // Astro 7 默认用 Sätteri；公式要 KaTeX，所以显式挂回 unified 管线
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      // 只借 token 颜色，背景由 global.css 统一成纸面
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
  integrations: [sitemap()],
});
