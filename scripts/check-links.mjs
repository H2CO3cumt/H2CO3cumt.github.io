// 构建产物里的内部链接检查：扫 dist 下的 HTML，验证每个站内链接都有对应的文件。
// 用法：pnpm build && node scripts/check-links.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve('dist');

if (!existsSync(DIST)) {
  console.error('找不到 dist/，先跑 pnpm build。');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const broken = [];
const checked = new Set();

/** 把站内链接解析成 dist 里的实际文件路径。 */
function resolveTarget(href) {
  const path = href.split('#')[0].split('?')[0];
  if (!path.startsWith('/')) return null; // 相对链接由浏览器按当前路径解析，这里只查绝对路径
  const candidates = [join(DIST, path), join(DIST, path, 'index.html'), join(DIST, `${path}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const from = file.slice(DIST.length).replace(/\\/g, '/');

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|data:|#|javascript:)/.test(href)) continue;
    if (checked.has(href)) continue;
    checked.add(href);
    if (!resolveTarget(href)) broken.push(`${from} → ${href}`);
  }
}

console.log(`检查了 ${htmlFiles.length} 个 HTML 页面、${checked.size} 个站内链接。`);

if (broken.length > 0) {
  console.log('\n断链：');
  for (const b of broken) console.log('  ' + b);
  process.exit(1);
}

console.log('没有断链。');
