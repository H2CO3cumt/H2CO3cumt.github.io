import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: 'H2CO3cumt',
    description: '一个做数字电路的人的记录本：比赛作品、开源代码，和一些日子。',
    site: context.site ?? 'https://H2CO3cumt.github.io',
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.summary ?? '',
      link: `/notes/${note.id}/`,
    })),
    customData: '<language>zh-CN</language>',
  });
}
