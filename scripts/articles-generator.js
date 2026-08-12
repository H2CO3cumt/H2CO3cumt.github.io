'use strict'

hexo.extend.generator.register('all-articles-page', locals => ({
  path: 'articles/index.html',
  layout: ['archive'],
  data: {
    title: '全部文章',
    archive: true,
    type: 'archive',
    posts: locals.posts.sort('-date'),
    top_img: 'linear-gradient(135deg, #071d31 0%, #0d526c 100%)'
  }
}))

// 为尚无文章的预留分类生成友好的空状态页；一旦分类中出现文章，
// Hexo 自带分类生成器会接管对应路径，分类名称不需要硬编码到模板。
hexo.extend.generator.register('declared-empty-categories', function (locals) {
  const declared = this.locals.get('data')?.site?.categories || []
  const existingPaths = new Set(locals.categories.map(item => item.path.replace(/\\/g, '/')))

  return declared
    .map(item => ({
      item,
      path: String(item.path || '').replace(/^\/+|\/+$/g, '') + '/index.html'
    }))
    .filter(({ path }) => path !== '/index.html' && !existingPaths.has(path.replace(/index\.html$/, '')))
    .map(({ item, path }) => ({
      path,
      layout: ['page'],
      data: {
        title: item.name,
        type: 'category-placeholder',
        comments: false,
        aside: true,
        top_img: 'linear-gradient(135deg, #071d31 0%, #0d526c 100%)',
        content: `<div class="empty-category"><span>COMING NEXT</span><h2>${item.name}</h2><p>该分类已预留，文章发布后会自动出现在这里。</p><a href="/categories/">返回全部分类 →</a></div>`
      }
    }))
})
