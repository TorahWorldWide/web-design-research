/*
 * extract.js — Render a live site in real Chromium and pull GROUND-TRUTH design tokens.
 * Usage: node extract.js <slug> <url>
 * Writes everything under companies/<slug>/.
 * Crash-safe: any failure on one site exits non-zero but never corrupts other sites.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
const url = process.argv[3];
if (!slug || !url) { console.error('usage: node extract.js <slug> <url>'); process.exit(2); }

const ROOT = path.join(__dirname, 'companies', slug);
const RAW = path.join(ROOT, 'raw');
fs.mkdirSync(RAW, { recursive: true });

function save(file, data) { fs.writeFileSync(path.join(ROOT, file), data); }
function saveRaw(file, data) { fs.writeFileSync(path.join(RAW, file), data); }

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // tolerate slow/blocking sites — best effort, never hang forever
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); }
    catch (e2) { console.error('NAV FAIL', slug, e2.message); }
  }
  await page.waitForTimeout(3500); // let fonts/hero settle

  // ---- desktop screenshot ----
  try { await page.screenshot({ path: path.join(ROOT, 'screenshot-desktop.png'), fullPage: false }); } catch(e){ console.error('shot-desk', e.message); }
  try { await page.screenshot({ path: path.join(ROOT, 'screenshot-desktop-full.png'), fullPage: true }); } catch(e){ console.error('shot-full', e.message); }

  // ---- raw HTML ----
  try { saveRaw('index.html', await page.content()); } catch(e){}

  // ---- THE CORE: read computed styles from the REAL rendered DOM ----
  const tokens = await page.evaluate(() => {
    const out = {
      colors: {}, bgColors: {}, fontFamilies: {}, fontSizes: {}, fontWeights: {},
      radii: {}, shadows: {}, gaps: {}, buttons: [], links: [], headings: {},
      bodyBg: null, bodyColor: null, bodyFont: null, maxWidths: {},
    };
    const inc = (obj, k) => { if (k && k !== 'none' && k !== 'normal') obj[k] = (obj[k]||0)+1; };
    const rgbToHex = (c) => {
      if (!c) return null;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return c;
      const p = m[1].split(',').map(x => parseFloat(x.trim()));
      if (p.length >= 4 && p[3] === 0) return null; // fully transparent
      const h = p.slice(0,3).map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
      return '#' + h;
    };
    const bodyCS = getComputedStyle(document.body);
    out.bodyBg = rgbToHex(bodyCS.backgroundColor);
    out.bodyColor = rgbToHex(bodyCS.color);
    out.bodyFont = bodyCS.fontFamily;

    const all = Array.from(document.querySelectorAll('*')).slice(0, 4000);
    for (const el of all) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue; // invisible
      inc(out.colors, rgbToHex(cs.color));
      inc(out.bgColors, rgbToHex(cs.backgroundColor));
      inc(out.fontFamilies, cs.fontFamily);
      inc(out.fontSizes, cs.fontSize);
      inc(out.fontWeights, cs.fontWeight);
      inc(out.radii, cs.borderRadius);
      inc(out.shadows, cs.boxShadow);
    }

    // sample real buttons (computed, ground truth)
    const btns = Array.from(document.querySelectorAll('button, a[role=button], .btn, [class*=button i]')).slice(0, 12);
    for (const b of btns) {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      if (r.width === 0) continue;
      out.buttons.push({
        text: (b.innerText||'').trim().slice(0,30),
        bg: rgbToHex(cs.backgroundColor), color: rgbToHex(cs.color),
        fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily.split(',')[0],
        padding: cs.padding, borderRadius: cs.borderRadius, border: cs.border,
        textTransform: cs.textTransform, letterSpacing: cs.letterSpacing,
        boxShadow: cs.boxShadow, transition: cs.transition, cursor: cs.cursor,
      });
    }
    // headings h1-h3
    for (const tag of ['h1','h2','h3']) {
      const h = document.querySelector(tag);
      if (h) { const cs = getComputedStyle(h);
        out.headings[tag] = { fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily.split(',')[0], lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: rgbToHex(cs.color), textTransform: cs.textTransform };
      }
    }
    // detect transitions/animations present (for "buttons should bounce/fade")
    out.hasTransitions = btns.some(b => { const t = getComputedStyle(b).transition; return t && t !== 'all 0s ease 0s' && t !== 'none'; });
    return out;
  }).catch(e => { console.error('EVAL FAIL', e.message); return null; });

  // ---- HOVER PROBE: capture REAL hover-state deltas so clones behave identically ----
  // Hover each of the first few real buttons and record what visually changes.
  if (tokens && tokens.buttons && tokens.buttons.length) {
    try {
      const btnHandles = await page.$$('button, a[role=button], .btn, [class*=button i]');
      const probes = [];
      for (let i = 0; i < Math.min(btnHandles.length, 6); i++) {
        const h = btnHandles[i];
        try {
          const box = await h.boundingBox();
          if (!box || box.width === 0) continue;
          const before = await h.evaluate(el => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, transform: c.transform, opacity: c.opacity, boxShadow: c.boxShadow, scale: c.scale, borderColor: c.borderColor }; });
          await h.hover({ timeout: 2000 });
          await page.waitForTimeout(450); // let transition land
          const after = await h.evaluate(el => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, transform: c.transform, opacity: c.opacity, boxShadow: c.boxShadow, scale: c.scale, borderColor: c.borderColor, transition: c.transition }; });
          const changed = {};
          for (const k of ['bg','color','transform','opacity','boxShadow','scale','borderColor']) {
            if (before[k] !== after[k]) changed[k] = { from: before[k], to: after[k] };
          }
          if (Object.keys(changed).length) probes.push({ idx: i, transition: after.transition, changed });
          await page.mouse.move(5, 5); // un-hover
          await page.waitForTimeout(150);
        } catch(e) {}
      }
      tokens.hoverProbes = probes;
    } catch(e) { console.error('hover probe fail', e.message); }
  }

  // ---- collect linked stylesheet URLs + download them ----
  const cssLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(l => l.href)
  ).catch(()=>[]);

  // ---- font files actually used ----
  const fontFiles = await page.evaluate(() => {
    const fonts = new Set();
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules||[])) {
          if (rule.constructor.name === 'CSSFontFaceRule' || (rule.cssText||'').includes('@font-face')) {
            const m = (rule.cssText||'').match(/url\(([^)]+)\)/g);
            const fam = (rule.style && rule.style.fontFamily) || '';
            if (m) m.forEach(u => fonts.add((fam?fam+' :: ':'') + u.replace(/url\(|\)|"|'/g,'')));
          }
        }
      } catch(e) {}
    }
    return Array.from(fonts).slice(0, 40);
  }).catch(()=>[]);

  // ---- tech stack detection ----
  const tech = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const t = [];
    if (html.includes('_next/') || window.__NEXT_DATA__) t.push('Next.js / React');
    if (window.React || html.includes('react')) t.push('React');
    if (html.includes('__NUXT__')) t.push('Nuxt / Vue');
    if (html.includes('cdn.shopify') || html.includes('Shopify')) t.push('Shopify');
    if (html.includes('wp-content')) t.push('WordPress');
    if (html.includes('data-svelte') || html.includes('__SVELTEKIT')) t.push('Svelte');
    if (window.Webflow || html.includes('webflow')) t.push('Webflow');
    if (html.includes('framer')) t.push('Framer');
    return [...new Set(t)];
  }).catch(()=>[]);

  // ---- meta / hero images ----
  const meta = await page.evaluate(() => {
    const g = (p) => { const e = document.querySelector(`meta[property="${p}"], meta[name="${p}"]`); return e ? e.content : null; };
    const imgs = Array.from(document.querySelectorAll('img')).slice(0,20).map(i => ({ src: i.currentSrc||i.src, alt: (i.alt||'').slice(0,40), w: i.naturalWidth, h: i.naturalHeight }));
    return { title: document.title, ogImage: g('og:image'), ogTitle: g('og:title'), ogDesc: g('og:description'), images: imgs };
  }).catch(()=>({}));

  // download CSS files (best effort)
  let cssBlob = '';
  for (let i = 0; i < Math.min(cssLinks.length, 8); i++) {
    try {
      const resp = await ctx.request.get(cssLinks[i], { timeout: 15000 });
      if (resp.ok()) { const txt = await resp.text(); cssBlob += `\n/* ===== ${cssLinks[i]} ===== */\n` + txt; }
    } catch(e) {}
  }
  if (cssBlob) saveRaw('styles.css', cssBlob);

  const bundle = { slug, url, scrapedAt: new Date().toISOString(), tokens, cssLinks, fontFiles, tech, meta };
  save('tokens.json', JSON.stringify(bundle, null, 2));

  await browser.close();
  console.log('EXTRACT OK', slug);
})().catch(e => { console.error('FATAL', slug, e.message); process.exit(1); });
