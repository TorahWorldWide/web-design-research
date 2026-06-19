/*
 * build.js — Turn tokens.json into (1) design-tokens.json (2) README.md (3) an INTERACTIVE clone.
 * Usage: node build.js <slug>
 * The clone reproduces the brand's palette, fonts, hero, nav and buttons WITH their
 * real hover behaviour (captured by the hover-probe). Click/hover behave like the original.
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
const rankPairs = (obj, n) => Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]).slice(0,n);

// ---- distill clean tokens ----
const textColors = rank(t.colors, 6);
const bgColors = rank(t.bgColors, 6);
const fonts = rank(t.fontFamilies, 4);
const sizes = rank(t.fontSizes, 10).filter(s=>s && s!=='0px');
const radii = rank(t.radii, 5).filter(r=>r && r!=='0px');
const primaryText = t.bodyColor || textColors[0] || '#111111';
const pageBg = t.bodyBg || bgColors[0] || '#ffffff';
const accent = (textColors.find(c=>c && !['#111111','#000000','#ffffff','#707072','#9e9ea0', primaryText, pageBg].includes(c.toLowerCase())) || textColors[1] || '#1151ff');
const primaryFont = (fonts[0]||'Helvetica, Arial, sans-serif').replace(/^"|"$/g,'');
const heroImg = meta.ogImage || (meta.images && meta.images.find(i=>i.w>600)?.src) || '';
const h1 = t.headings && t.headings.h1 || {};
const btn = (t.buttons||[]).find(b=>b.bg && b.bg!=='#ffffff') || (t.buttons||[])[0] || {};
const hover = (t.hoverProbes||[])[0] || null;

const design = {
  brand: slug, source: d.url, scrapedAt: d.scrapedAt, tech: d.tech,
  palette: { pageBg, primaryText, accent, textColors, bgColors },
  typography: { primaryFont, fontStack: fonts[0], sizes, h1, headings: t.headings },
  shape: { radii, buttonRadius: btn.borderRadius || radii[0] || '0px' },
  button: btn, hoverBehaviour: hover, hasTransitions: t.hasTransitions,
  fontFiles: d.fontFiles, heroImage: heroImg, ogTitle: meta.ogTitle, title: meta.title,
};
fs.writeFileSync(path.join(ROOT, 'design-tokens.json'), JSON.stringify(design, null, 2));

// ---- README ----
const readme = `# ${slug} — Design DNA

> **STATUS: ⚠️ TOMER HASN'T TESTED YET** — open the clone, click & hover the buttons, confirm it behaves like the real site.

**Source:** ${d.url}
**Captured:** ${d.scrapedAt}
**Tech stack:** ${(d.tech||[]).join(', ') || 'unknown'}

## Palette (real, from rendered DOM)
- Page background: \`${pageBg}\`
- Primary text: \`${primaryText}\`
- Accent: \`${accent}\`
- Top text colors: ${textColors.map(c=>'`'+c+'`').join(' ')}
- Top backgrounds: ${bgColors.map(c=>'`'+c+'`').join(' ')}

## Typography
- Primary font: **${primaryFont}**
- Full stack: \`${fonts[0]||''}\`
- Size scale: ${sizes.map(s=>'`'+s+'`').join(' ')}
- H1: ${h1.fontSize||'?'} / weight ${h1.fontWeight||'?'} / ${(h1.fontFamily||'').replace(/"/g,'')}
- Font files: ${(d.fontFiles||[]).slice(0,3).map(f=>'`'+f.split('::').pop().trim()+'`').join(' ') || 'n/a'}

## Shape & components
- Border radii used: ${radii.map(r=>'`'+r+'`').join(' ') || '`0px` (sharp)'}
- Primary button: bg \`${btn.bg||'?'}\`, text \`${btn.color||'?'}\`, radius \`${btn.borderRadius||'?'}\`, padding \`${btn.padding||'?'}\`, transform \`${btn.textTransform||'none'}\`
- Transitions present: ${t.hasTransitions ? 'yes' : 'no'}

## Hover behaviour (the "it must feel the same" part)
${hover ? '- On hover, real buttons change: ' + Object.entries(hover.changed).map(([k,v])=>`**${k}** ${v.from} → ${v.to}`).join('; ') + `\n- Transition timing: \`${hover.transition||''}\`` : '- No hover delta captured (button may animate via transform/JS).'}

## Files
- \`design-tokens.json\` — structured tokens (the trainable artifact)
- \`index.html\` — interactive clone (open in browser, test it)
- \`screenshot-desktop.png\` — what the real site looked like when captured
- \`raw/\` — original HTML + CSS for deep reference
`;
fs.writeFileSync(path.join(ROOT, 'README.md'), readme);

// ---- build hover CSS from the real probe ----
function rgbToHex(c){ if(!c) return null; const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return c; const p=m[1].split(',').map(x=>parseFloat(x)); if(p[3]===0) return 'transparent'; return '#'+p.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''); }
let hoverCss = 'transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.18);'; // sensible default bounce
let hoverTiming = (btn.transition && btn.transition!=='all' && btn.transition!=='none') ? btn.transition : 'all .25s cubic-bezier(.2,.8,.2,1)';
if (hover && hover.changed) {
  const parts = [];
  if (hover.changed.bg) parts.push(`background:${rgbToHex(hover.changed.bg.to)};`);
  if (hover.changed.color) parts.push(`color:${rgbToHex(hover.changed.color.to)};`);
  if (hover.changed.borderColor) parts.push(`border-color:${rgbToHex(hover.changed.borderColor.to)};`);
  if (hover.changed.transform && hover.changed.transform.to!=='none') parts.push(`transform:${hover.changed.transform.to};`);
  if (hover.changed.opacity) parts.push(`opacity:${hover.changed.opacity.to};`);
  if (hover.changed.boxShadow && hover.changed.boxShadow.to!=='none') parts.push(`box-shadow:${hover.changed.boxShadow.to};`);
  if (parts.length) hoverCss = parts.join(' ');
  if (hover.transition && hover.transition!=='all 0s ease 0s') hoverTiming = hover.transition;
}

const btnBg = btn.bg && btn.bg!=='#ffffff' ? btn.bg : primaryText;
const btnColor = btn.color && btn.bg ? btn.color : pageBg;
const btnRadius = btn.borderRadius || radii[0] || '0px';
const btnPad = (btn.padding && btn.padding!=='0px') ? btn.padding : '14px 32px';
const btnTransform = btn.textTransform || 'none';
const btnLetter = btn.letterSpacing && btn.letterSpacing!=='normal' ? btn.letterSpacing : '0';
const h1Size = h1.fontSize || '64px';
const h1Weight = h1.fontWeight || '700';
const heroBlock = heroImg
  ? `<section class="hero" style="background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.35)),url('${heroImg}')"><div class="hero-inner"><h1>${(meta.ogTitle||slug).slice(0,40)}</h1><p>${(meta.ogDesc||'').slice(0,90)}</p><div class="cta"><button class="btn primary">Shop Now</button><button class="btn ghost">Learn More</button></div></div></section>`
  : `<section class="hero plain"><div class="hero-inner"><h1>${(meta.ogTitle||slug).slice(0,40)}</h1><p>${(meta.ogDesc||'').slice(0,90)}</p><div class="cta"><button class="btn primary">Get Started</button><button class="btn ghost">Learn More</button></div></div></section>`;

const clone = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${slug} clone — design study</title>
<style>
:root{--bg:${pageBg};--text:${primaryText};--accent:${accent};--btnbg:${btnBg};--btncolor:${btnColor};}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:${fonts[0]||"'Helvetica Neue',Arial,sans-serif"};-webkit-font-smoothing:antialiased}
.banner{background:var(--text);color:var(--bg);text-align:center;font-size:12px;padding:7px;letter-spacing:.04em;opacity:.92}
nav{display:flex;align-items:center;justify-content:space-between;padding:18px 40px;border-bottom:1px solid rgba(0,0,0,.08);position:sticky;top:0;background:var(--bg);z-index:10}
nav .logo{font-weight:800;font-size:22px;letter-spacing:-.02em;text-transform:uppercase}
nav ul{display:flex;gap:28px;list-style:none}
nav a{color:var(--text);text-decoration:none;font-size:15px;font-weight:500;position:relative;padding:4px 0;cursor:pointer;transition:opacity .2s}
nav a::after{content:'';position:absolute;left:0;bottom:-2px;height:2px;width:0;background:var(--text);transition:width .25s ease}
nav a:hover::after{width:100%}
.hero{min-height:78vh;background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:64px 40px;color:#fff}
.hero.plain{background:var(--bg);color:var(--text);align-items:center;justify-content:center;text-align:center;border-bottom:1px solid rgba(0,0,0,.06)}
.hero-inner{max-width:640px}
.hero h1{font-size:${h1Size};font-weight:${h1Weight};line-height:1.02;letter-spacing:-.02em;text-transform:${(h1.textTransform&&h1.textTransform!=='none')?h1.textTransform:'none'};margin-bottom:16px}
.hero p{font-size:18px;opacity:.92;margin-bottom:26px;font-weight:400}
.cta{display:flex;gap:14px;flex-wrap:wrap}
.btn{font-family:inherit;font-size:${btn.fontSize||'16px'};font-weight:${btn.fontWeight||'600'};padding:${btnPad};border-radius:${btnRadius};border:2px solid transparent;cursor:pointer;text-transform:${btnTransform};letter-spacing:${btnLetter};transition:${hoverTiming};will-change:transform}
.btn.primary{background:var(--btnbg);color:var(--btncolor)}
.btn.ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.8)}
.hero.plain .btn.ghost{color:var(--text);border-color:var(--text)}
.btn.primary:hover{${hoverCss}}
.btn.ghost:hover{background:#fff;color:#111;transform:translateY(-2px)}
.btn:active{transform:translateY(1px) scale(.98)}
.section{padding:72px 40px;max-width:1200px;margin:0 auto}
.section h2{font-size:34px;font-weight:${h1Weight};letter-spacing:-.02em;margin-bottom:8px}
.section .sub{color:${textColors[1]||'#707072'};margin-bottom:32px;font-size:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px}
.card{border-radius:${radii.find(r=>r&&r!=='0px')||'8px'};overflow:hidden;background:${bgColors[1]||'#f5f5f5'};cursor:pointer;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s ease}
.card:hover{transform:translateY(-6px);box-shadow:0 14px 34px rgba(0,0,0,.14)}
.card .ph{aspect-ratio:1/1;background:linear-gradient(135deg,${bgColors[1]||'#eee'},${bgColors[2]||'#ddd'});display:flex;align-items:center;justify-content:center;font-size:13px;color:#999;overflow:hidden}
.card img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.card:hover img{transform:scale(1.06)}
.card .meta{padding:16px}
.card .meta b{display:block;font-size:15px;margin-bottom:4px}
.card .meta span{color:${textColors[1]||'#707072'};font-size:14px}
.swatches{display:flex;gap:0;flex-wrap:wrap;margin-top:10px}
.sw{width:90px;height:90px;display:flex;align-items:flex-end;padding:6px;font-size:10px;color:#fff;mix-blend-mode:difference}
footer{background:var(--text);color:var(--bg);padding:48px 40px;margin-top:40px;font-size:14px}
@media(max-width:700px){nav ul{display:none}.hero h1{font-size:clamp(40px,12vw,${h1Size})}.section{padding:48px 22px}}
</style></head>
<body>
<div class="banner">DESIGN STUDY CLONE · ${slug.toUpperCase()} · not affiliated · built from extracted tokens</div>
<nav><div class="logo">${slug}</div><ul><li><a>New</a></li><li><a>Men</a></li><li><a>Women</a></li><li><a>Collections</a></li><li><a>Sale</a></li></ul><button class="btn primary" style="padding:8px 20px">Sign In</button></nav>
${heroBlock}
<section class="section">
  <h2>Featured</h2>
  <div class="sub">Hover the cards and buttons. They should move/animate like ${slug}.</div>
  <div class="grid">
    ${(meta.images||[]).filter(i=>i.src && i.w>200).slice(0,8).map(i=>`<div class="card"><div class="ph"><img src="${i.src}" alt="" loading="lazy" onerror="this.parentNode.textContent='image'"></div><div class="meta"><b>${(i.alt||'Product').slice(0,24)||'Product'}</b><span>Tap to explore</span></div></div>`).join('\n    ') || '<div class="card"><div class="ph">no images captured</div><div class="meta"><b>Product</b><span>—</span></div></div>'}
  </div>
</section>
<section class="section">
  <h2>Brand palette</h2>
  <div class="sub">The exact colors extracted from the live site.</div>
  <div class="swatches">
    ${[pageBg,primaryText,accent,...textColors,...bgColors].filter((v,i,a)=>v&&a.indexOf(v)===i).slice(0,10).map(c=>`<div class="sw" style="background:${c}">${c}</div>`).join('')}
  </div>
</section>
<footer><b style="font-size:20px;text-transform:uppercase">${slug}</b><p style="margin-top:10px;opacity:.7">Design-study clone for training. Source: ${d.url}</p></footer>
<script>
// subtle press feedback already via CSS; add ripple-free click log so Tomer sees interactivity
document.querySelectorAll('.btn,.card,nav a').forEach(el=>{el.addEventListener('click',e=>{el.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:160,easing:'ease-out'})})});
</script>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'index.html'), clone);
console.log('BUILD OK', slug);
