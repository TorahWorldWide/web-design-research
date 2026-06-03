/*
 * gallery.js v2 — feature FAITHFUL SNAPSHOTS. Reads snap-state.tsv for honest status.
 * DONE  -> show snapshot-preview.png, link to snapshot.html (the faithful copy)
 * BLOCKED -> show a "blocked by bot protection" card (no fake success)
 * Token-free.
 */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'companies');

// read status
const status = {};
try {
  fs.readFileSync(path.join(__dirname, 'snap-state.tsv'), 'utf8').trim().split('\n').forEach(l => {
    const [slug, st] = l.split('\t'); if (slug) status[slug] = st;
  });
} catch(e){}

const order = Object.keys(status).sort((a,b)=>{
  const w = s => status[s]==='DONE'?0:1; return w(a)-w(b) || a.localeCompare(b);
});

function tokens(s){ try { return JSON.parse(fs.readFileSync(path.join(dir,s,'design-tokens.json'),'utf8')); } catch(e){ return null; } }

const cards = order.map(s => {
  const st = status[s];
  const d = tokens(s);
  const tech = d ? (d.tech||[]).join(', ') : '';
  const pal = d ? [d.palette.pageBg, d.palette.primaryText, d.palette.accent].filter(Boolean) : [];
  if (st === 'DONE' && fs.existsSync(path.join(dir,s,'snapshot.html'))) {
    const prev = fs.existsSync(path.join(dir,s,'snapshot-preview.png')) ? `companies/${s}/snapshot-preview.png` : `companies/${s}/screenshot-desktop.png`;
    return `<div class="card done">
      <div class="head"><b>${s}</b><span class="tag ok">faithful</span></div>
      <div class="swatch">${pal.map(c=>`<i style="background:${c}"></i>`).join('')}</div>
      <a href="companies/${s}/snapshot.html" target="_blank"><img class="shot" src="${prev}" loading="lazy"></a>
      <div class="actions">
        <a class="btn" href="companies/${s}/snapshot.html" target="_blank">▶ Open faithful copy (test hover/scroll)</a>
        <a class="lnk" href="companies/${s}/design-tokens.json" target="_blank">tokens</a>
      </div>
      <div class="tech">${tech}</div>
    </div>`;
  }
  // blocked
  return `<div class="card blocked">
    <div class="head"><b>${s}</b><span class="tag warn">blocked</span></div>
    <div class="blockbox">🛡️ Blocked by the site's bot protection (Akamai/Cloudflare).<br>Can't snapshot from a server. ${d?'Design tokens were still extracted.':''}</div>
    ${d?`<div class="actions"><a class="lnk" href="companies/${s}/design-tokens.json" target="_blank">view extracted tokens</a></div>`:''}
  </div>`;
}).join('\n');

const nDone = order.filter(s=>status[s]==='DONE').length;
const nBlock = order.filter(s=>status[s]==='BLOCKED').length;

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Web Design Research — faithful clones</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0d0f13;color:#e8eaed;padding:22px}
h1{font-size:25px;margin-bottom:4px}
.sub{color:#9aa0a6;margin-bottom:8px;font-size:14px;line-height:1.5}
.legend{color:#9aa0a6;font-size:12px;margin-bottom:22px}
.legend b{color:#e8eaed}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px}
.card{background:#161a21;border:1px solid #262b34;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.card.blocked{opacity:.72}
.head{display:flex;justify-content:space-between;align-items:center;padding:13px 15px 8px}
.head b{font-size:17px;text-transform:capitalize}
.tag{font-size:10px;padding:3px 8px;border-radius:20px;font-weight:600}
.tag.ok{background:#0c3;color:#031}
.tag.warn{background:#fb3;color:#310}
.swatch{display:flex;gap:4px;padding:0 15px 9px}
.swatch i{width:30px;height:16px;border-radius:3px;border:1px solid #333}
.shot{width:100%;height:200px;object-fit:cover;object-position:top;background:#222;display:block;border-top:1px solid #262b34;border-bottom:1px solid #262b34}
.blockbox{margin:10px 15px;padding:22px 14px;background:#1d2128;border-radius:10px;font-size:13px;color:#b9bfc7;text-align:center;line-height:1.6}
.actions{display:flex;align-items:center;justify-content:space-between;padding:12px 15px}
.btn{background:#1151ff;color:#fff;text-decoration:none;padding:9px 13px;border-radius:8px;font-size:12.5px;font-weight:600}
.lnk{color:#9aa0a6;font-size:12px;text-decoration:none}
.tech{color:#6b7280;font-size:11px;padding:0 15px 14px}
</style></head><body>
<h1>Web Design Research — Faithful Clones</h1>
<div class="sub">${nDone} faithful copies you can open, hover and scroll. Each is the REAL rendered page (real CSS, real images), with scripts removed so links don't navigate. <b>Tomer hasn't tested yet</b> — click "Open faithful copy" and check it behaves like the original.</div>
<div class="legend"><b>${nDone} faithful</b> · <b>${nBlock} blocked</b> by bot protection (luxury/retail sites shield against servers — that's a wall, not a bug).</div>
<div class="grid">${cards}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('GALLERY v2 OK —', nDone, 'faithful,', nBlock, 'blocked');
