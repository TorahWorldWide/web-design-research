/*
 * gallery.js — build an index.html linking every clone + its real screenshot side by side.
 * Token-free. Run after the batch.
 */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'companies');
const slugs = fs.readdirSync(dir).filter(s => fs.existsSync(path.join(dir, s, 'index.html'))).sort();

const cards = slugs.map(s => {
  let status = 'unknown', tech = '', pal = [];
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dir, s, 'design-tokens.json'), 'utf8'));
    tech = (d.tech||[]).join(', ');
    pal = [d.palette.pageBg, d.palette.primaryText, d.palette.accent].filter(Boolean);
  } catch(e){}
  const hasReal = fs.existsSync(path.join(dir, s, 'screenshot-desktop.png'));
  const hasClone = fs.existsSync(path.join(dir, s, 'clone-preview.png'));
  return `<div class="card">
    <div class="head"><b>${s}</b><span>${tech}</span></div>
    <div class="swatch">${pal.map(c=>`<i style="background:${c}"></i>`).join('')}</div>
    <div class="shots">
      <a href="companies/${s}/${hasReal?'screenshot-desktop.png':'index.html'}" target="_blank"><figure><img src="companies/${s}/${hasReal?'screenshot-desktop.png':'clone-preview.png'}" loading="lazy"><figcaption>real site</figcaption></figure></a>
      <a href="companies/${s}/clone-preview.png" target="_blank"><figure><img src="companies/${s}/${hasClone?'clone-preview.png':'index.html'}" loading="lazy"><figcaption>my clone</figcaption></figure></a>
    </div>
    <div class="actions">
      <a class="btn" href="companies/${s}/index.html" target="_blank">▶ Open live clone (test it)</a>
      <a class="lnk" href="companies/${s}/README.md" target="_blank">design notes</a>
    </div>
  </div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Web Design Research — clone gallery</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f1115;color:#e8eaed;padding:24px}
h1{font-size:26px;margin-bottom:4px}
.sub{color:#9aa0a6;margin-bottom:24px;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
.card{background:#1a1d24;border:1px solid #2a2e37;border-radius:14px;overflow:hidden}
.head{display:flex;justify-content:space-between;align-items:baseline;padding:14px 16px 6px}
.head b{font-size:18px;text-transform:capitalize}
.head span{font-size:11px;color:#9aa0a6}
.swatch{display:flex;gap:0;padding:0 16px 10px}
.swatch i{width:26px;height:18px;border-radius:3px;margin-right:4px;border:1px solid #333}
.shots{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 10px}
.shots img{width:100%;height:120px;object-fit:cover;object-position:top;border-radius:6px;background:#222;display:block}
figure{position:relative}
figcaption{position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,.7);color:#fff;font-size:10px;padding:2px 6px;border-radius:4px}
.actions{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 16px}
.btn{background:#1151ff;color:#fff;text-decoration:none;padding:9px 14px;border-radius:8px;font-size:13px;font-weight:600}
.lnk{color:#9aa0a6;font-size:12px;text-decoration:none}
</style></head><body>
<h1>Web Design Research — Clone Gallery</h1>
<div class="sub">${slugs.length} brands · left = real site screenshot, right = my interactive clone · click "Open live clone" and test hover/click. STATUS for each: see design notes (Tomer hasn't tested yet).</div>
<div class="grid">${cards}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('GALLERY OK —', slugs.length, 'clones');
