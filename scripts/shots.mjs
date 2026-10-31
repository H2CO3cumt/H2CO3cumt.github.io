// 视觉与可读性自查：用本机已有的 Edge/Chrome 截图，
// 同时检测横向溢出、控制台报错、每页 h1 数量，以及文本对比度。
// 用法：pnpm preview 起服务后，node scripts/shots.mjs [baseUrl] [额外路径,逗号分隔]
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const EXTRA = (process.argv[3] ?? '').split(',').filter(Boolean);
const OUT = '.shots';

const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'notes', path: '/notes/' },
  { name: 'note', path: '/notes/verilog-fsm/' },
  { name: 'archive', path: '/archive/' },
  { name: 'tags', path: '/tags/' },
  { name: 'works', path: '/works/' },
  { name: 'about', path: '/about/' },
  { name: '404', path: '/404.html' },
  ...EXTRA.map((path) => ({
    name: path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root',
    path,
  })),
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const SCHEMES = ['light', 'dark'];

// DESIGN.md 第 9 节：正文 ≥ 7:1，次要文字 ≥ 4.5:1
const A11Y_TARGETS = [
  { sel: 'body', min: 7 },
  { sel: '.prose p', min: 7 },
  { sel: '.spec td', min: 7 },
  { sel: '.entries .what a', min: 7 },
  { sel: '.quiet', min: 4.5 },
  { sel: '.byline', min: 4.5 },
  { sel: '.entries .when', min: 4.5 },
  { sel: '.entries .aside', min: 4.5 },
  { sel: '.tags', min: 4.5 },
  { sel: '.spec th', min: 4.5 },
  { sel: '.prose a', min: 4.5 },
  { sel: '.prose code', min: 4.5 },
  { sel: '.prose pre code', min: 4.5 },
  { sel: 'footer', min: 4.5 },
];

const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('找不到本机浏览器，请手动指定 executablePath。');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });
const problems = [];
const seen = new Set();
const report = (msg) => {
  if (seen.has(msg)) return;
  seen.add(msg);
  problems.push(msg);
};
let focusChecks = 0;

for (const scheme of SCHEMES) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: scheme,
      deviceScaleFactor: 1,
      isMobile: vp.name === 'mobile',
      hasTouch: vp.name === 'mobile',
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') report(`[console] ${msg.text()}`);
    });
    page.on('pageerror', (err) => report(`[pageerror] ${err.message}`));
    page.on('requestfailed', (req) =>
      report(`[request] ${req.url()} :: ${req.failure()?.errorText}`),
    );

    for (const target of PAGES) {
      await page.goto(BASE + target.path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const where = `${target.name}@${vp.name}/${scheme}`;
      const metrics = await page.evaluate(
        ({ targets }) => {
          const parse = (css) => {
            const m = css.match(/rgba?\(([^)]+)\)/);
            if (!m) return null;
            const [r, g, b, a = 1] = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
            return { r, g, b, a };
          };
          const lin = (c) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          const ratio = (fg, bg) => {
            const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
            return (a + 0.05) / (b + 0.05);
          };
          const bgOf = (el) => {
            let cur = el;
            while (cur && cur !== document.documentElement) {
              const c = parse(getComputedStyle(cur).backgroundColor);
              if (c && c.a > 0.5) return c;
              cur = cur.parentElement;
            }
            const root = parse(getComputedStyle(document.documentElement).backgroundColor);
            return root && root.a > 0.5 ? root : { r: 255, g: 255, b: 255, a: 1 };
          };

          const contrast = [];
          for (const t of targets) {
            const el = document.querySelector(t.sel);
            if (!el) continue;
            const fg = parse(getComputedStyle(el).color);
            if (!fg) continue;
            contrast.push({
              sel: t.sel,
              min: t.min,
              ratio: Math.round(ratio(fg, bgOf(el)) * 10) / 10,
            });
          }

          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            h1: document.querySelectorAll('h1').length,
            contrast,
          };
        },
        { targets: A11Y_TARGETS },
      );

      if (metrics.scrollWidth > metrics.clientWidth + 1) {
        report(
          `[overflow] ${where}: scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth}`,
        );
      }
      if (metrics.h1 !== 1) {
        report(`[a11y] ${where}: h1 数量为 ${metrics.h1}`);
      }
      for (const c of metrics.contrast) {
        if (c.ratio < c.min) {
          report(`[contrast] ${where} ${c.sel}: ${c.ratio}:1 < ${c.min}:1`);
        }
      }

      const file = join(OUT, `${target.name}-${vp.name}-${scheme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`shot ${file}`);

      // 键盘可达性只在桌面亮色下查一次：焦点顺序 + 是否有可见焦点框
      if (scheme === 'light' && vp.name === 'desktop') {
        const seenFocus = [];
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press('Tab');
          const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              text: (el.textContent ?? '').trim().slice(0, 10),
              href: el.getAttribute('href'),
              hasRing: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1,
              visible: r.width > 0 && r.height > 0,
              inViewport: r.top >= 0 && r.left >= 0,
            };
          });
          if (!info) break;
          seenFocus.push(info);
          if (!info.visible) {
            report(`[keyboard] ${where}: 焦点停在不可见元素 "${info.text}"`);
          } else if (!info.hasRing) {
            report(`[keyboard] ${where}: 焦点元素没有可见焦点框 "${info.text}"`);
          }
        }
        const skip = seenFocus.find((f) => f.href === '#main');
        if (!skip) {
          report(`[keyboard] ${where}: 第一下 Tab 没有落到"跳到正文"`);
        } else {
          focusChecks++;
        }
      }
    }

    await context.close();
  }
}

await browser.close();

if (problems.length > 0) {
  console.log('\n发现的问题：');
  for (const p of problems) console.log('  ' + p);
} else {
  console.log(
    `\n通过：无横向溢出、无控制台报错、每页恰好一个 h1、对比度全部达标、${focusChecks} 个页面的键盘焦点顺序与焦点框正常。`,
  );
}
