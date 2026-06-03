const { chromium } = require('playwright');
(async () => {
  const slug = process.argv[2];
  const b = await chromium.launch({ args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  await p.goto('file://' + __dirname + '/companies/'+slug+'/index.html', { waitUntil:'networkidle', timeout:20000 }).catch(()=>{});
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'companies/'+slug+'/clone-preview.png', fullPage:false });
  // test a hover actually changes the button
  const btn = await p.$('.btn.primary');
  const before = btn ? await btn.evaluate(e=>getComputedStyle(e).transform) : 'none';
  if (btn) await btn.hover();
  await p.waitForTimeout(400);
  const after = btn ? await btn.evaluate(e=>getComputedStyle(e).transform) : 'none';
  console.log('btn transform before:', before, '| after hover:', after, '| CHANGED:', before!==after);
  await b.close();
  console.log('CLONE SHOT OK');
})().catch(e=>{console.error(e.message);process.exit(1)});
