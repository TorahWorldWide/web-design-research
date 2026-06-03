/*
 * snapshot.js — FAITHFUL static snapshot of a live site.
 * Instead of rebuilding from a fixed template, we capture the REAL rendered DOM,
 * inject <base href> so the real CSS/images/fonts load from the origin CDN, and
 * strip <script> so it can't redirect/wipe content. CSS hovers & transitions still
 * work because the real stylesheets are present. Result looks/behaves ~like the original.
 *
 * Usage: node snapshot.js <slug> <url>
 * Writes companies/<slug>/snapshot.html + snapshot-preview.png
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
const url = process.argv[3];
if (!slug || !url) { console.error('usage: node snapshot.js <slug> <url>'); process.exit(2); }
const ROOT = path.join(__dirname, 'companies', slug);
fs.mkdirSync(ROOT, { recursive: true });
const origin = new URL(url).origin + '/';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
  catch(e){ try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch(e2){ console.error('NAV FAIL', e2.message);} }
  await page.waitForTimeout(parseInt(process.env.SETTLE||'2500'));

  // trigger lazy-loaded images by scrolling the whole page, then back to top
  await page.evaluate(async () => {
    await new Promise(res => {
      let y = 0; const step = 600;
      const t = setInterval(() => { window.scrollBy(0, step); y += step; if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 120);
    });
  }).catch(()=>{});
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0,0));
  await page.waitForTimeout(800);

  // Inline same-origin <link rel=stylesheet> so styling survives even if hotlink/CSP blocks later.
  // Cross-origin links we leave as-is (base href will resolve them).
  await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    for (const l of links) {
      try {
        const href = l.href;
        const res = await fetch(href);
        if (!res.ok) continue;
        let css = await res.text();
        // rewrite relative url(...) inside this CSS to absolute against the stylesheet's own URL
        css = css.replace(/url\((['"]?)(?!data:|https?:|\/\/)([^'")]+)\1\)/g, (m, q, u) => {
          try { return `url(${new URL(u, href).href})`; } catch(e){ return m; }
        });
        const style = document.createElement('style');
        style.setAttribute('data-inlined-from', href);
        style.textContent = css;
        l.parentNode.replaceChild(style, l);
      } catch(e) {}
    }
  }).catch(e=>console.error('inline css fail', e.message));

  let html = await page.content();

  // strip scripts (so saved page can't redirect/hydrate-wipe), inject <base> for any remaining relative assets
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]+rel=["']?preload["']?[^>]*as=["']?script["']?[^>]*>/gi, '');
  if (!/<base /i.test(html)) html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}">`);
  // banner so it's clearly a study clone + marked untested
  html = html.replace(/<body([^>]*)>/i, `<body$1><div style="position:fixed;top:0;left:0;right:0;z-index:999999;background:#111;color:#fff;font:12px/1.4 system-ui;text-align:center;padding:6px">STUDY SNAPSHOT · ${slug} · TOMER HASN'T TESTED YET · hover/scroll work, links don't navigate</div>`);

  fs.writeFileSync(path.join(ROOT, 'snapshot.html'), html);

  // screenshot the saved snapshot to verify fidelity (load from file)
  const p2 = await ctx.newPage();
  await p2.goto('file://' + path.join(ROOT, 'snapshot.html'), { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
  await p2.waitForTimeout(2500);
  await p2.screenshot({ path: path.join(ROOT, 'snapshot-preview.png'), fullPage: false }).catch(()=>{});

  await browser.close();
  console.log('SNAPSHOT OK', slug);
})().catch(e => { console.error('FATAL', slug, e.message); process.exit(1); });
