'use strict'

const fs = require('node:fs')
const path = require('node:path')

const publicDir = path.resolve(__dirname, '..', 'public')
const errors = []
const required = [
  'index.html',
  'articles/index.html',
  'categories/index.html',
  'tags/index.html',
  'archives/index.html',
  'projects/index.html',
  'about/index.html',
  '404.html',
  'search.json',
  'sitemap.xml',
  'atom.xml',
  'css/custom.css',
  'js/custom.js',
  'images/favicon.svg',
  'images/avatar/avatar-placeholder.svg'
]

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(dir, entry.name)
  return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

if (!fs.existsSync(publicDir)) {
  console.error('Build check failed: public/ does not exist.')
  process.exit(1)
}

for (const relative of required) {
  if (!fs.existsSync(path.join(publicDir, relative))) errors.push(`Missing required output: /${relative}`)
}

const htmlFiles = walk(publicDir).filter(file => file.endsWith('.html'))
const forbidden = [/href=["']undefined/i, /src=["']undefined/i, /url\(["']?undefined/i]

const ignoredPrefixes = [
  '/tags/',
  '/categories/',
  '/archives/',
  '/posts/',
  '/page/'
]

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(html)) errors.push(`${path.relative(publicDir, file)} contains ${pattern}`)
  }

  const localRefs = [...html.matchAll(/(?:href|src)=["'](\/(?!\/)[^"'#?]+)["']/g)].map(match => match[1])
  for (const urlPath of localRefs) {
    if (ignoredPrefixes.some(prefix => urlPath.startsWith(prefix))) continue
    const decoded = decodeURI(urlPath)
    const candidates = decoded.endsWith('/')
      ? [path.join(publicDir, decoded, 'index.html')]
      : [path.join(publicDir, decoded), path.join(publicDir, decoded, 'index.html')]
    if (!candidates.some(candidate => fs.existsSync(candidate))) {
      errors.push(`${path.relative(publicDir, file)} references missing local asset/page: ${urlPath}`)
    }
  }
}

const searchPath = path.join(publicDir, 'search.json')
if (fs.existsSync(searchPath)) {
  const search = JSON.parse(fs.readFileSync(searchPath, 'utf8'))
  if (!Array.isArray(search) || search.length < 3) errors.push('search.json should index the three example posts.')
  if (!search.every(item => Array.isArray(item.tags))) errors.push('search.json is missing tags for one or more posts.')
}

const indexPath = path.join(publicDir, 'index.html')
if (fs.existsSync(indexPath)) {
  const index = fs.readFileSync(indexPath, 'utf8')
  for (const marker of ['home-dashboard', '技术分类', '最新文章', 'prefers-reduced-motion']) {
    const target = marker === 'prefers-reduced-motion'
      ? fs.readFileSync(path.join(publicDir, 'css', 'custom.css'), 'utf8')
      : index
    if (!target.includes(marker)) errors.push(`Homepage verification marker missing: ${marker}`)
  }
}

if (errors.length) {
  console.error(`Build check failed with ${errors.length} problem(s):`)
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Build check passed: ${htmlFiles.length} HTML files verified.`)
