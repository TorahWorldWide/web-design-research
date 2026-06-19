/*
 * build.js v3 — CATEGORY-AWARE design-DNA clone generator.
 * Usage: node build.js <slug>
 *
 * What changed vs v2 (and WHY — see LESSONS.md #9-#13):
 *  - One fixed e-commerce skeleton is gone. Each brand renders in its CATEGORY
 *    archetype: luxury (editorial serif, huge whitespace, sharp), saas (clean
 *    sans marketing hero + feature cards, dark-mode aware), sport (bold loud
 *    image-led, pill CTAs), consumer (bright, very rounded, friendly).
 *  - Blocked-capture garbage is detected and NOT shipped as real. If a brand's
 *    tokens are the browser defaults from an "Access Denied" page
 *    (Times New Roman + #1151ff + 0 images), we fall back to category DEFAULT
 *    tokens and label the clone honestly as an "archetype reconstruction".
 *  - Contrast guard: hero/section text color is always computed to be readable
 *    on its background (fixes black-on-dark Notion, light-on-light Claude).
 *  - No text is ever overlaid on an OG share-card image (fixes double-text).
 *    Images live in their own band; hero text sits on a solid/gradient brand bg.
 *  - Accent sanitizer: rejects #1151ff, near-white, near-black, and == text;
 *    derives the most-saturated palette color, else the category default.
 *  - Nav + CTA labels match the category (no more "Men/Women/Sale" on an AI app).
 */
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node build.js <slug>'); process.exit(2); }
const ROOT = path.join(__dirname, 'companies', slug);
const tf = path.join(ROOT, 'tokens.json');
if (!fs.existsSync(tf)) { console.error('no tokens.json for', slug); process.exit(1); }

const d = JSON.parse(fs.readFileSync(tf, 'utf8'));
const t = d.tokens || {};
const meta = d.meta || {};
const rank = (obj, n) => Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0]);

// ---------- category map ----------
const CATEGORY = {
  // luxury / fashion houses
  tiffany:'luxury', cartier:'luxury', gucci:'luxury', louisvuitton:'luxury',
  balenciaga:'luxury', rolex:'luxury', davidyurman:'luxury', pandora:'luxury',
  // saas / ai / tech product
  chatgpt:'saas', claude:'saas', notion:'saas', figma:'saas',
  shopify:'saas', spotify:'saas', apple:'saas', applestore:'saas',
  // sportswear
  nike:'sport', adidas:'sport', lululemon:'sport',
  // consumer / lifestyle
  cocacola:'consumer', starbucks:'consumer', duolingo:'consumer',
  glossier:'consumer', airbnb:'consumer', nordstrom:'consumer',
};
const cat = CATEGORY[slug] || 'consumer';

// category default design language (used when extracted tokens are garbage,
// and to supply category-appropriate fallbacks / nav / cta everywhere)
const CAT = {
  luxury: {
    font: `Georgia,"Times New Roman","Bodoni MT",Didot,serif`,
    serif: true,
    accent: '#9a7b4f',        // muted gold
    radius: '0px',
    nav: ['The Maison','High Jewelry','Collections','Boutiques'],
    ctaPrimary: 'Discover', ctaGhost: 'Book an Appointment',
    layout: 'editorial',
    h1weight: '400', letter: '0.04em', upper: false,
  },
  saas: {
    font: `"Inter",system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`,
    serif: false,
    accent: '#4f46e5',        // indigo
    radius: '12px',
    nav: ['Product','Solutions','Pricing','Docs'],
    ctaPrimary: 'Get started', ctaGhost: 'Sign in',
    layout: 'product',
    h1weight: '700', letter: '-0.02em', upper: false,
  },
  sport: {
    font: `"Helvetica Neue",Helvetica,Arial,"Arial Narrow",sans-serif`,
    serif: false,
    accent: '#111111',
    radius: '30px',
    nav: ['Men','Women','Kids','Sale'],
    ctaPrimary: 'Shop', ctaGhost: 'Explore',
    layout: 'hype',
    h1weight: '800', letter: '-0.03em', upper: true,
  },
  consumer: {
    font: `"Poppins","Nunito Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`,
    serif: false,
    accent: '#e2342d',
    radius: '999px',
    nav: ['Shop','About','Stories','Contact'],
    ctaPrimary: 'Get started', ctaGhost: 'Learn more',
    layout: 'playful',
    h1weight: '800', letter: '-0.02em', upper: false,
  },
}[cat];

// ---------- color helpers ----------
function toRgb(hex){
  if (!hex) return null;
  let m = hex.match(/rgba?\(([^)]+)\)/);
  if (m){ const p=m[1].split(',').map(parseFloat); if(p[3]===0) return null; return [p[0],p[1],p[2]]; }
  m = hex.replace('#','');
  if (m.length===3) m = m.split('').map(c=>c+c).join('');
  if (!/^[0-9a-f]{6}$/i.test(m)) return null;
  return [parseInt(m.slice(0,2),16),parseInt(m.slice(2,4),16),parseInt(m.slice(4,6),16)];
}
function lum(hex){
  const c = toRgb(hex); if(!c) return 0.5;
  const a = c.map(v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function chroma(hex){ const c=toRgb(hex); if(!c) return 0; return (Math.max(...c)-Math.min(...c))/255; }
function readable(bg){ return lum(bg) > 0.45 ? '#141414' : '#ffffff'; }
function muted(bg){ return lum(bg) > 0.45 ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.62)'; }
function hexable(hex){ return !!toRgb(hex); }
// truncate at a word boundary (no ugly mid-word cuts), add ellipsis if trimmed
function clip(s, n){ s=(s||'').trim(); if(s.length<=n) return s; let c=s.slice(0,n); const sp=c.lastIndexOf(' '); if(sp>n*0.6) c=c.slice(0,sp); return c.replace(/[\s,.;:–-]+$/,'')+'…'; }

// ---------- detect blocked / garbage capture ----------
const rawFonts = rank(t.fontFamilies, 4);
const rawColors = rank(t.colors, 8);
const rawBgs = rank(t.bgColors, 8);
const images = (meta.images||[]).filter(i=>i && i.src);
const title = (meta.title||'');
const rawAccentGuess = (rawColors.find(c=>c && !['#111111','#000000','#ffffff','#707072'].includes(String(c).toLowerCase())) || '');
const looksDefaultFont = rawFonts.length===0 || /^"?times new roman"?$/i.test((rawFonts[0]||'').trim());
const blockedTitle = /access denied|error page|pardon our interruption|just a moment|forbidden/i.test(title);
const noImages = images.length === 0;
const BLOCKED = (looksDefaultFont && noImages) || blockedTitle ||
                (String(rawAccentGuess).toLowerCase()==='#1151ff' && noImages);

// ---------- resolve final tokens ----------
let pageBg, primaryText, accent, fontStack, h1Size, h1Weight, btnRadius;

// FONT: keep a usable extracted stack (append category-matching generic fallback);
// otherwise use the category default.
function fontUsable(stack){
  if (!stack) return false;
  if (/^"?times new roman"?$/i.test(stack.trim())) return false; // pure default fallback
  return true;
}
if (BLOCKED || !fontUsable(rawFonts[0])) {
  fontStack = CAT.font;
} else {
  const generic = (/serif/i.test(rawFonts[0]) && !/sans/i.test(rawFonts[0]))
    ? 'Georgia,serif'
    : 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  fontStack = rawFonts[0].replace(/\s+/g,' ').trim().replace(/,+$/,'') + ',' + generic;
}

// PAGE BG + TEXT
if (BLOCKED) {
  pageBg = '#ffffff'; primaryText = '#141414';
} else {
  pageBg = (hexable(t.bodyBg) && t.bodyBg) || rawBgs.find(hexable) || '#ffffff';
  primaryText = (hexable(t.bodyColor) && t.bodyColor) || readable(pageBg);
  // contrast guard: if body text is not readable on body bg, fix it
  const cText = toRgb(primaryText), cBg = toRgb(pageBg);
  if (cText && cBg) {
    const ratio = (Math.max(lum(primaryText),lum(pageBg))+0.05)/(Math.min(lum(primaryText),lum(pageBg))+0.05);
    if (ratio < 2.5) primaryText = readable(pageBg);
  }
}

// ACCENT: reject garbage, derive most-saturated palette color, else category default.
function accentBad(a){
  if (!a || !hexable(a)) return true;
  const s = String(a).toLowerCase();
  if (s === '#1151ff') return true;                 // build.js v1 hardcoded default
  if (lum(a) > 0.85) return true;                   // near white
  if (lum(a) < 0.04) return true;                   // near black
  if (s === String(primaryText).toLowerCase()) return true;
  if (chroma(a) < 0.10) return true;                // grey, not a real accent
  return false;
}
if (BLOCKED) {
  accent = CAT.accent;
} else {
  const cand = [...rawColors, ...rawBgs].filter(hexable);
  const chromatic = cand.filter(c=>chroma(c) >= 0.18 && lum(c) > 0.05 && lum(c) < 0.85);
  chromatic.sort((a,b)=>chroma(b)-chroma(a));
  accent = chromatic[0] || (accentBad(rawAccentGuess) ? CAT.accent : rawAccentGuess);
}

// shape + headings
const radii = rank(t.radii, 5).filter(r=>r && r!=='0px');
btnRadius = CAT.radius;  // category drives shape language (luxury sharp, consumer pill)
const h1 = (t.headings && t.headings.h1) || {};
h1Size = (cat==='luxury') ? '52px' : (cat==='sport' ? '76px' : '60px');
h1Weight = CAT.h1weight;

// ---------- keep emitting design-tokens.json + README (the trainable artifact) ----------
const design = {
  brand: slug, source: d.url, scrapedAt: d.scrapedAt, tech: d.tech,
  category: cat,
  capture: BLOCKED ? 'blocked (tokens are category archetype, not extracted)' : 'extracted',
  palette: { pageBg, primaryText, accent, rawTextColors: rawColors, rawBgColors: rawBgs },
  typography: { fontStack, rawPrimaryFont: rawFonts[0]||null, h1: { size:h1Size, weight:h1Weight } },
  shape: { buttonRadius: btnRadius, rawRadii: radii },
  nav: CAT.nav, cta: { primary: CAT.ctaPrimary, ghost: CAT.ctaGhost },
  ogImage: meta.ogImage || '', title: meta.title || '',
};
fs.writeFileSync(path.join(ROOT, 'design-tokens.json'), JSON.stringify(design, null, 2));

const readme = `# ${slug} — Design DNA (${cat})

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone and check it feels like the category.
${BLOCKED ? '> **NOTE:** live capture was BLOCKED by bot protection, so this clone is an *archetype reconstruction* from the brand\'s category, not extracted tokens.' : ''}

**Source:** ${d.url}
**Category:** ${cat}
**Captured:** ${d.scrapedAt}
**Capture quality:** ${BLOCKED ? '🛡️ blocked — archetype reconstruction' : '✅ extracted from live DOM'}

## Resolved tokens
- Page background: \`${pageBg}\`
- Primary text: \`${primaryText}\` (contrast-checked against bg)
- Accent: \`${accent}\`
- Font stack: \`${fontStack}\`
- Button radius: \`${btnRadius}\`
- Nav: ${CAT.nav.join(' · ')}
- CTAs: ${CAT.ctaPrimary} / ${CAT.ctaGhost}

## Files
- \`design-tokens.json\` — structured tokens (the trainable artifact)
- \`index.html\` — category-aware design-study clone
- \`screenshot-desktop.png\` — what the real site looked like (when capture succeeded)
`;
fs.writeFileSync(path.join(ROOT, 'README.md'), readme);

// ---------- category-aware rendering ----------
const heroText = readable(cat==='saas' && lum(pageBg)>0.45 ? pageBg : (cat==='sport' ? '#0a0a0a' : pageBg));
const titleClean = (slug.charAt(0).toUpperCase()+slug.slice(1));
// pick a real content image (not the OG text-card) for image bands
const contentImgs = images.filter(i=>i.src && i.w>300 && !/og|share|social|card/i.test(i.src));
const bigImg = (contentImgs.find(i=>i.w>700) || contentImgs[0] || {}).src || '';

const navHtml = `<nav><div class="logo">${slug.toUpperCase()}</div><ul>${CAT.nav.map(n=>`<li><a>${n}</a></li>`).join('')}</ul><button class="btn primary nbtn">${CAT.ctaGhost}</button></nav>`;

const blockedBanner = BLOCKED
  ? `<div class="banner warn">ARCHETYPE RECONSTRUCTION · ${slug.toUpperCase()} · live capture was blocked by bot protection — this shows the ${cat} category design language, not extracted tokens</div>`
  : `<div class="banner">DESIGN STUDY · ${slug.toUpperCase()} · ${cat} archetype · not affiliated · built from extracted tokens</div>`;

// ---- per-category body ----
let heroBlock = '', bodyBlock = '';

if (cat === 'luxury') {
  heroBlock = `<section class="hero editorial">
    <div class="hero-inner">
      <h1>${titleClean}</h1>
      <p class="tag">${BLOCKED?'Maison archetype':'Since 1837'}</p>
      <div class="cta"><a class="link-cta">${CAT.ctaPrimary}</a><a class="link-cta ghost">${CAT.ctaGhost}</a></div>
    </div>
  </section>`;
  bodyBlock = `
  ${bigImg?`<section class="imgband"><img src="${bigImg}" alt="" loading="lazy" onerror="this.closest('.imgband').remove()"></section>`:''}
  <section class="showcase">
    ${(contentImgs.slice(0,3).length?contentImgs.slice(0,3):[{},{},{}]).map((i,k)=>`
      <figure><div class="ph">${i.src?`<img src="${i.src}" loading="lazy" onerror="this.parentNode.classList.add('empty')">`:''}</div>
      <figcaption>${['The Collection','High Jewelry','The Icon'][k]}</figcaption></figure>`).join('')}
  </section>`;
}
else if (cat === 'saas') {
  heroBlock = `<section class="hero marketing">
    <div class="hero-inner">
      <span class="eyebrow">${titleClean}</span>
      <h1>${clip(meta.ogTitle||titleClean,52)}</h1>
      <p>${clip(meta.ogDesc||'The workspace that adapts to how you work.',110)}</p>
      <div class="cta"><button class="btn primary">${CAT.ctaPrimary}</button><button class="btn ghost">${CAT.ctaGhost}</button></div>
    </div>
  </section>`;
  bodyBlock = `<section class="features">
    ${[['⚡','Fast by default','Built for speed at any scale.'],['🔒','Secure','Enterprise-grade security baked in.'],['🤝','Collaborative','Your whole team, one place.']].map(f=>`
      <div class="fcard"><div class="ficon">${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></div>`).join('')}
  </section>
  ${bigImg?`<section class="productshot"><img src="${bigImg}" alt="" loading="lazy" onerror="this.closest('.productshot').remove()"></section>`:''}`;
}
else if (cat === 'sport') {
  const hypeBg = bigImg
    ? `style="background-image:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.05)),url('${bigImg}')"`
    : `style="background:linear-gradient(135deg,#0a0a0a,#2a2a2a)"`; // no-image fallback so white hero text stays visible
  heroBlock = `<section class="hero hype" ${hypeBg}>
    <div class="hero-inner">
      <h1>${clip(meta.ogTitle||titleClean,38)}</h1>
      <p>${clip(meta.ogDesc||'Engineered to move.',80)}</p>
      <div class="cta"><button class="btn primary">${CAT.ctaPrimary}</button><button class="btn ghost">${CAT.ctaGhost}</button></div>
    </div>
  </section>`;
  bodyBlock = `<section class="grid-sec"><h2>Featured</h2>
    <div class="grid">${(contentImgs.slice(0,8).length?contentImgs.slice(0,8):Array(4).fill({})).map(i=>`<div class="card"><div class="ph">${i.src?`<img src="${i.src}" loading="lazy" onerror="this.parentNode.classList.add('empty')">`:''}</div></div>`).join('')}</div>
  </section>`;
}
else { // consumer
  heroBlock = `<section class="hero playful">
    <div class="hero-inner">
      <h1>${clip(meta.ogTitle||titleClean,40)}</h1>
      <p>${clip(meta.ogDesc||'Made to make you smile.',90)}</p>
      <div class="cta"><button class="btn primary">${CAT.ctaPrimary}</button><button class="btn ghost">${CAT.ctaGhost}</button></div>
    </div>
    <div class="blob"></div>
  </section>`;
  bodyBlock = `<section class="grid-sec"><h2>Explore</h2>
    <div class="grid">${(contentImgs.slice(0,6).length?contentImgs.slice(0,6):Array(3).fill({})).map(i=>`<div class="card"><div class="ph">${i.src?`<img src="${i.src}" loading="lazy" onerror="this.parentNode.classList.add('empty')">`:''}</div></div>`).join('')}</div>
  </section>`;
}

// ---- palette strip (always honest about resolved tokens) ----
const paletteStrip = `<section class="palette"><h2>Resolved palette</h2><div class="swatches">${
  [pageBg,primaryText,accent].filter((v,i,a)=>v&&a.indexOf(v)===i).map(c=>`<div class="sw" style="background:${c};color:${readable(c)}">${c}</div>`).join('')
}</div></section>`;

const subText = muted(pageBg);

const clone = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${slug} clone — ${cat} design study</title>
<style>
:root{--bg:${pageBg};--text:${primaryText};--accent:${accent};--sub:${subText};--radius:${btnRadius};}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:${fontStack};-webkit-font-smoothing:antialiased;line-height:1.4}
.banner{background:var(--text);color:var(--bg);text-align:center;font-size:11.5px;padding:7px 12px;letter-spacing:.03em}
.banner.warn{background:#b8860b;color:#fff}
nav{display:flex;align-items:center;justify-content:space-between;padding:20px 44px;position:sticky;top:0;background:var(--bg);z-index:10;border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
nav .logo{font-weight:${cat==='luxury'?'400':'800'};font-size:${cat==='luxury'?'24px':'21px'};letter-spacing:${cat==='luxury'?'.18em':'-.02em'};${cat==='luxury'?'':'text-transform:uppercase'}}
nav ul{display:flex;gap:30px;list-style:none}
nav a{color:var(--text);text-decoration:none;font-size:14px;font-weight:${cat==='luxury'?'400':'500'};${cat==='luxury'?'letter-spacing:.08em;text-transform:uppercase;':''}cursor:pointer;opacity:.85;transition:opacity .2s}
nav a:hover{opacity:1}
.nbtn{padding:9px 20px;font-size:13px}
.btn{font-family:inherit;font-weight:${cat==='sport'||cat==='consumer'?'700':'600'};font-size:15px;padding:14px 32px;border-radius:var(--radius);border:2px solid transparent;cursor:pointer;${cat==='sport'?'text-transform:uppercase;letter-spacing:.02em;':''}transition:transform .22s cubic-bezier(.2,.8,.2,1),box-shadow .22s ease,background .22s ease,opacity .22s ease;will-change:transform}
.btn.primary{background:var(--accent);color:${readable(accent)}}
.btn.ghost{background:transparent;color:var(--text);border:2px solid color-mix(in srgb,var(--text) 35%,transparent)}
.btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--accent) 45%,transparent)}
.btn.ghost:hover{background:color-mix(in srgb,var(--text) 8%,transparent);transform:translateY(-2px)}
.btn:active{transform:translateY(1px) scale(.98)}

/* LUXURY */
.hero.editorial{min-height:84vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px}
.hero.editorial h1{font-size:${h1Size};font-weight:${h1Weight};letter-spacing:${CAT.letter};margin-bottom:18px}
.hero.editorial .tag{color:var(--sub);font-size:13px;letter-spacing:.22em;text-transform:uppercase;margin-bottom:34px}
.hero.editorial .cta{display:flex;gap:40px;justify-content:center}
.link-cta{font-size:13px;letter-spacing:.16em;text-transform:uppercase;border-bottom:1px solid var(--text);padding-bottom:4px;cursor:pointer;color:var(--text);text-decoration:none;transition:opacity .2s}
.link-cta.ghost{border-color:var(--sub);color:var(--sub)}
.link-cta:hover{opacity:.55}
.imgband{height:62vh;overflow:hidden}.imgband img{width:100%;height:100%;object-fit:cover}
.showcase{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px}
.showcase figure{text-align:center}
.showcase .ph{aspect-ratio:3/4;background:color-mix(in srgb,var(--text) 6%,var(--bg));display:flex;align-items:center;justify-content:center;overflow:hidden}
.showcase .ph img{width:100%;height:100%;object-fit:cover}
.showcase .ph.empty::after{content:'';}
.showcase figcaption{padding:22px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--sub)}

/* SAAS */
.hero.marketing{padding:96px 24px 72px;text-align:center;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 8%,var(--bg)),var(--bg))}
.hero.marketing .eyebrow{display:inline-block;font-size:13px;font-weight:600;color:var(--accent);letter-spacing:.04em;margin-bottom:18px}
.hero.marketing h1{font-size:${h1Size};font-weight:${h1Weight};letter-spacing:${CAT.letter};line-height:1.05;max-width:760px;margin:0 auto 20px}
.hero.marketing p{font-size:19px;color:var(--sub);max-width:560px;margin:0 auto 30px}
.hero .cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1080px;margin:0 auto;padding:40px 24px 64px}
.fcard{background:color-mix(in srgb,var(--text) 4%,var(--bg));border:1px solid color-mix(in srgb,var(--text) 9%,transparent);border-radius:16px;padding:30px 26px;transition:transform .3s ease,box-shadow .3s ease}
.fcard:hover{transform:translateY(-6px);box-shadow:0 16px 40px color-mix(in srgb,var(--text) 12%,transparent)}
.fcard .ficon{font-size:26px;margin-bottom:14px}
.fcard h3{font-size:19px;font-weight:700;margin-bottom:8px}
.fcard p{color:var(--sub);font-size:15px}
.productshot{max-width:1080px;margin:0 auto 72px;padding:0 24px}
.productshot img{width:100%;border-radius:18px;box-shadow:0 24px 60px color-mix(in srgb,var(--text) 16%,transparent);display:block}

/* SPORT */
.hero.hype{min-height:80vh;background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:64px 44px;color:#fff}
.hero.hype .hero-inner{max-width:620px}
.hero.hype h1{font-size:${h1Size};font-weight:${h1Weight};letter-spacing:${CAT.letter};text-transform:uppercase;line-height:.98;margin-bottom:14px}
.hero.hype p{font-size:18px;margin-bottom:24px;opacity:.95}
.hero.hype .btn.ghost{color:#fff;border-color:rgba(255,255,255,.7)}
.grid-sec{padding:64px 44px;max-width:1280px;margin:0 auto}
.grid-sec h2{font-size:30px;font-weight:${h1Weight};letter-spacing:-.02em;margin-bottom:26px;${cat==='sport'?'text-transform:uppercase;':''}}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
.card{border-radius:${cat==='consumer'?'20px':'4px'};overflow:hidden;background:color-mix(in srgb,var(--text) 6%,var(--bg));cursor:pointer;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease}
.card:hover{transform:translateY(-6px);box-shadow:0 16px 38px color-mix(in srgb,var(--text) 16%,transparent)}
.card .ph{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden}
.card .ph img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.card:hover .ph img{transform:scale(1.06)}
.card .ph.empty{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,var(--bg)),var(--bg))}

/* CONSUMER */
.hero.playful{position:relative;padding:88px 44px 76px;text-align:center;overflow:hidden;background:color-mix(in srgb,var(--accent) 10%,var(--bg))}
.hero.playful .hero-inner{position:relative;z-index:2;max-width:680px;margin:0 auto}
.hero.playful h1{font-size:${h1Size};font-weight:${h1Weight};letter-spacing:${CAT.letter};line-height:1.05;margin-bottom:18px}
.hero.playful p{font-size:19px;color:var(--sub);margin-bottom:28px}
.hero.playful .blob{position:absolute;top:-120px;right:-80px;width:380px;height:380px;border-radius:50%;background:var(--accent);opacity:.18;filter:blur(8px)}

.palette{padding:48px 44px;max-width:1280px;margin:0 auto}
.palette h2{font-size:20px;font-weight:700;margin-bottom:16px}
.swatches{display:flex;gap:0;flex-wrap:wrap}
.sw{min-width:120px;height:80px;display:flex;align-items:flex-end;padding:8px;font-size:12px;font-family:monospace}
footer{background:var(--text);color:var(--bg);padding:48px 44px;margin-top:20px;font-size:13px}
footer b{font-size:20px;${cat==='luxury'?'letter-spacing:.18em;':'text-transform:uppercase;'}}
@media(max-width:760px){nav ul{display:none}.features,.showcase{grid-template-columns:1fr}.hero h1{font-size:clamp(36px,11vw,${h1Size})}}
</style></head>
<body>
${blockedBanner}
${navHtml}
${heroBlock}
${bodyBlock}
${paletteStrip}
<footer><b>${slug}</b><p style="margin-top:10px;opacity:.75">Category-aware design-study clone (${cat}). Source: ${d.url}</p></footer>
<script>
document.querySelectorAll('.btn,.card,.fcard,nav a,.link-cta').forEach(el=>{el.addEventListener('click',()=>el.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:150,easing:'ease-out'}))});
</script>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'index.html'), clone);
console.log('BUILD OK', slug, '['+cat+(BLOCKED?', archetype-reconstruction':'')+']');
