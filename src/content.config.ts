import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * 开源作品：比赛与技术实践的档案，能开源的给仓库地址。
 * 参数表（specs）是作品页的视觉主体，见 DESIGN.md 第 5 节。
 */
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    /** 排序与列表左栏都用它 */
    year: z.number().int().min(2000).max(2100),
    /** 赛事或项目性质，例如"全国大学生集成电路创新创业大赛" */
    event: z.string().optional(),
    /** 获奖或状态，例如"一等奖"、"校赛二等奖"、"进行中" */
    result: z.string().optional(),
    /** 一句话说明，出现在列表第二行 */
    summary: z.string().optional(),
    /** 开源仓库地址；给了就会在参数表里自动补一行「源码」 */
    repo: z.url().optional(),
    /** 开源许可，例如 MIT、CERN-OHL-P-2.0、未定 */
    license: z.string().optional(),
    /** 参数表内容，按顺序渲染 */
    specs: z
      .array(z.object({ label: z.string(), value: z.string(), href: z.url().optional() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

/** 随笔：技术笔记、生活与心得。 */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 列表里可选的副行 */
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { works, notes };
