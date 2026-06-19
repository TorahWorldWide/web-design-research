/*
 * gallery.js v3 — features the CATEGORY-AWARE design-study clones (build.js v3 output),
 * grouped by category, with honest capture badges. Each card:
 *   - shows clone-preview.png (the fixed design-study clone)
 *   - "Open design-study clone" -> companies/<slug>/index.html
 *   - "Faithful copy" -> companies/<slug>/snapshot.html (only when a real snapshot exists)
 *   - badges: category (luxury/saas/sport/consumer) + capture (extracted / archetype)
 * Token-free.
 */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'companies');

// snapshot status (faithful copies)
const snapStatus = {};
try {
  fs.readFileSync(path.join(__dirname, 'snap-state.tsv'), 'utf8').trim().split('\n').forEach(l => {
    const [slug, st] = l.split('\t'); if (slug) snapStatus[slug] = st;
  });
} catch(e){}

function tokens(s){ try { return JSON.parse(fs.readFileSync(path.join(dir,s,'design-tokens.json'),'utf8')); } catch(e){ return null; } }

const slugs = fs.readdirSync(dir).filter(s=>fs.statSync(path.join(dir,s)).isDirectory()).sort();
const CAT_ORDER = { luxury:0, saas:1, sport:2, consumer:3 };

const items = slugs.map(s=>{
  const d = tokens(s);
  const cat = (d && d.category) || 'consumer';
  const blocked = d && /blocked/i.test(d.capture||'');
  const pal = d ? [d.palette.pageBg, d.palette.primaryText, d.palette.accent].filter(Boolean) : [];
  const hasSnap = snapStatus[s]==='DONE' && fs.existsSync(path.join(dir,s,'snapshot.html'));
  const prev = fs.existsSync(path.join(dir,s,'clone-preview.png')) ? `companies/${s}/clone-preview.png` : (fs.existsSync(path.join(dir,s,'screenshot-desktop.png'))?`companies/${s}/screenshot-desktop.png`:'');
  return { s, cat, blocked, pal, hasSnap, prev, tech: d ? (d.tech||[]).join(', ') : '' };
}).sort((a,b)=> (CAT_ORDER[a.cat]-CAT_ORDER[b.cat]) || a.s.localeCompare(b.s));

const CAT_LABEL = { luxury:'Luxury', saas:'SaaS / AI', sport:'Sportswear', consumer:'Consumer' };
const CAT_COLOR = { luxury:'#b8860b', saas:'#6366f1', sport:'#ef4444', consumer:'#ec4899' };

function card(it){
  const catTag = `<span class="tag cat" style="background:${CAT_COLOR[it.cat]}22;color:${CAT_COLOR[it.cat]};border:1px solid ${CAT_COLOR[it.cat]}55">${CAT_LABEL[it.cat]}</span>`;
  const capTag = it.blocked
    ? `<span class="tag warn">archetype</span>`
    : `<span class="tag ok">extracted</span>`;
  return `<div class="card">
    <div class="head"><b>${it.s}</b><div class="tags">${catTag}${capTag}</div></div>
    <div class="swatch">${it.pal.map(c=>`<i style="background:${c}"></i>`).join('')}</div>
    <a href="companies/${it.s}/index.html" target="_blank">${it.prev?`<img class="shot" src="${it.prev}" loading="lazy">`:'<div class="shot noimg">no preview</div>'}</a>
    <div class="actions">
      <a class="btn" href="companies/${it.s}/index.html" target="_blank">▶ Open design-study clone</a>
      <div class="lnks">${it.hasSnap?`<a class="lnk" href="companies/${it.s}/snapshot.html" target="_blank">faithful copy</a>`:''}<a class="lnk" href="companies/${it.s}/design-tokens.json" target="_blank">tokens</a></div>
    </div>
    ${it.blocked?`<div class="note">🛡️ live capture blocked by bot protection — this clone shows the ${it.cat} category design language (archetype), not extracted tokens.</div>`:''}
  </div>`;
}

// group cards by category with section headers
let body = '';
['luxury','saas','sport','consumer'].forEach(c=>{
  const group = items.filter(i=>i.cat===c);
  if (!group.length) return;
  body += `<h2 class="sec" style="color:${CAT_COLOR[c]}">${CAT_LABEL[c]} <span>· ${group.length}</span></h2><div class="grid">${group.map(card).join('')}</div>`;
});

const nTotal = items.length;
const nArche = items.filter(i=>i.blocked).length;
const nExtract = nTotal - nArche;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Web Design Research — category-aware design study</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#0b0d11;color:#e8eaed;padding:22px 18px 60px;max-width:1320px;margin:0 auto}
h1{font-size:26px;margin-bottom:6px;letter-spacing:-.02em}
.sub{color:#9aa0a6;margin-bottom:6px;font-size:14px;line-height:1.55}
.legend{color:#9aa0a6;font-size:12.5px;margin-bottom:26px}
.legend b{color:#e8eaed}
.sec{font-size:18px;margin:30px 0 14px;font-weight:700;letter-spacing:-.01em}
.sec span{color:#6b7280;font-weight:400;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px}
.card{background:#13161c;border:1px solid #242a33;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.head{display:flex;justify-content:space-between;align-items:center;padding:13px 15px 9px;gap:8px}
.head b{font-size:16px;text-transform:capitalize}
.tags{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
.tag{font-size:9.5px;padding:3px 8px;border-radius:20px;font-weight:600;white-space:nowrap}
.tag.ok{background:#0c351f;color:#34d399}
.tag.warn{background:#3a2c0a;color:#fbbf24}
.swatch{display:flex;gap:4px;padding:0 15px 9px}
.swatch i{width:34px;height:15px;border-radius:3px;border:1px solid #333}
.shot{width:100%;height:210px;object-fit:cover;object-position:top;background:#1a1d24;display:block;border-top:1px solid #242a33;border-bottom:1px solid #242a33}
.shot.noimg{display:flex;align-items:center;justify-content:center;color:#5b6270;font-size:13px}
.actions{padding:12px 15px;display:flex;flex-direction:column;gap:8px}
.btn{background:#4f46e5;color:#fff;text-decoration:none;padding:10px 13px;border-radius:9px;font-size:13px;font-weight:600;text-align:center;transition:background .2s}
.btn:hover{background:#6366f1}
.lnks{display:flex;gap:16px}
.lnk{color:#9aa0a6;font-size:12px;text-decoration:none}
.lnk:hover{color:#e8eaed}
.note{margin:0 15px 14px;padding:10px 12px;background:#1d1a10;border:1px solid #3a2c0a;border-radius:9px;font-size:11.5px;color:#c9b681;line-height:1.5}
footer{margin-top:44px;color:#5b6270;font-size:12px;line-height:1.6}
</style></head><body>
<h1>Web Design Research — Category-Aware Design Study</h1>
<div class="sub">${nTotal} brands studied, each rebuilt in its <b>category archetype</b> (luxury · SaaS/AI · sportswear · consumer) instead of one generic store template. Click <b>Open design-study clone</b> to view & test each.</div>
<div class="legend"><b>${nExtract} extracted</b> from the live site · <b>${nArche} archetype</b> reconstructions (live capture was blocked by bot protection — labelled honestly). Where a faithful pixel-copy exists, a <b>faithful copy</b> link is provided too.</div>
${body}
<footer>Design-study clones for training. Not affiliated with any brand. Built from extracted design tokens + category archetypes.<br>Tomer hasn't tested every clone yet — open a few and check they feel like the real category.</footer>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('GALLERY v3 OK —', nTotal, 'brands,', nExtract, 'extracted,', nArche, 'archetype');
