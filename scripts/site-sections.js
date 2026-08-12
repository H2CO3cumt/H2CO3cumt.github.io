'use strict'

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeLocalPath = value => {
  const path = String(value ?? '')
  return /^\/(?!\/)[^"'<>]*$/.test(path) ? path : '#'
}

const safeHttpUrl = value => {
  const url = String(value ?? '')
  return /^https:\/\//i.test(url) ? url : ''
}

const icon = name => {
  const paths = {
    chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>',
    code: '<path d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12"/>',
    circuit: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 6h8M6 8v4h6v4m6-8v4h-6"/>',
    waveform: '<path d="M3 12h3l2-7 4 14 3-10 2 3h4"/>',
    terminal: '<path d="m5 7 4 4-4 4m6 0h7"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
    project: '<path d="M4 7h6l2 2h8v10H4zM4 7V5h5l2 2"/>',
    notebook: '<path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4M4 6h2m-2 4h2m-2 4h2m-2 4h2"/>'
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.chip}</svg>`
}

const categoryCards = categories => (categories || []).map(item => `
  <a class="tech-category-card reveal-item" href="${safeLocalPath(item.path)}">
    <span class="tech-category-icon">${icon(item.icon)}</span>
    <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span>
    <span class="tech-card-arrow" aria-hidden="true">→</span>
  </a>`).join('')

const projectCards = projects => (projects || []).map((item, index) => {
  const image = safeLocalPath(item.image)
  const github = safeHttpUrl(item.github)
  const detail = safeLocalPath(item.detail)
  const visualStyle = image !== '#' ? ` style="background-image:url('${image}')"` : ''
  const stack = (item.stack || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')
  const links = [
    github ? `<a href="${github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : '',
    detail !== '#' ? `<a href="${detail}">项目详情 →</a>` : ''
  ].filter(Boolean).join('')
  return `<article class="project-card reveal-item">
    <div class="project-visual project-visual-${(index % 3) + 1}"${visualStyle}>
      <span>PROJECT ${String(index + 1).padStart(2, '0')}</span>
      <i aria-hidden="true"></i>
    </div>
    <div class="project-card-body">
      <span class="project-status">${escapeHtml(item.status || '待填写')}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="project-stack">${stack}</div>
      ${links ? `<div class="project-links">${links}</div>` : '<p class="project-empty">项目链接：待填写</p>'}
    </div>
  </article>`
}).join('')

const homeSections = site => `
<section class="home-dashboard" aria-labelledby="home-intro-title">
  <div class="home-intro reveal-item">
    <div>
      <span class="section-kicker">LEARNING LOG · ENGINEERING PRACTICE</span>
      <h2 id="home-intro-title">${escapeHtml(site.home?.intro_title)}</h2>
      <p>${escapeHtml(site.home?.intro_text)}</p>
    </div>
    <a class="primary-link" href="/archives/">浏览全部文章 <span aria-hidden="true">→</span></a>
  </div>
  <div class="section-heading reveal-item">
    <div><span class="section-index">01</span><span class="section-kicker">TOPICS</span><h2>技术分类</h2></div>
    <a href="/categories/">查看全部分类 →</a>
  </div>
  <div class="tech-category-grid">${categoryCards(site.categories)}</div>
  <div class="section-heading latest-heading reveal-item">
    <div><span class="section-index">02</span><span class="section-kicker">LATEST POSTS</span><h2>最新文章</h2></div>
  </div>
</section>`

const projectsSection = site => `
<div class="projects-intro">
  <span class="section-kicker">PROJECT ARCHIVE</span>
  <p>用于整理 FPGA、Robei EDA、Python、比赛作品与其他工程项目。以下卡片均为示例占位，不代表真实经历。</p>
</div>
<div class="project-grid">${projectCards(site.projects)}</div>
<aside class="edit-hint">项目数据集中维护在 <code>source/_data/site.yml</code>；图片建议放入 <code>source/images/projects/</code>。</aside>`

hexo.extend.filter.register('after_render:html', function addSiteSections (html) {
  const site = this.locals.get('data')?.site || {}

  const isHome = html.includes('id="recent-posts"') &&
    html.includes('full_page') &&
    html.includes('id="page-header"')

  if (isHome) {
    html = html.replace(/(<div\b(?=[^>]*\bid="recent-posts")[^>]*>)/, `$1${homeSections(site)}`)
    html = html.replace(/(<h1\b(?=[^>]*\bid="site-title")[^>]*>)/, `<span class="hero-eyebrow">${escapeHtml(site.hero?.eyebrow)}</span>$1`)
    html = html.replace('</span></div><div id="site_social_icons"', `</span><p class="hero-tagline">${escapeHtml(site.hero?.tagline)}</p></div><div id="site_social_icons"`)
  }

  if (html.includes('<!-- PROJECTS_GRID -->')) {
    html = html.replace('<!-- PROJECTS_GRID -->', projectsSection(site))
  }

  return html
})
