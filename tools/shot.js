#!/usr/bin/env node
/* Screenshot einer Ansicht.  node tools/shot.js "#/area/icu" out.png [--labels] [--full] [--w=1500] [--wait=1500] [--click=selector]
   Gibt außerdem Konsolenfehler der Seite aus. */
'use strict';
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [hash = '#/', out = 'shot.png', ...flags] = process.argv.slice(2);
  const opt = k => { const f = flags.find(x => x.startsWith('--' + k)); return f ? (f.split('=')[1] || true) : null; };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +(opt('w') || 1500), height: +(opt('h') || 950) }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + hash);
  await page.waitForTimeout(+(opt('wait') || 1500));
  if (opt('labels')) { await page.click('#btn-labels').catch(() => {}); await page.waitForTimeout(300); }
  const clicks = flags.filter(f => f.startsWith('--click=')).map(f => f.slice(8));
  for (const c of clicks) { await page.click(c).catch(e => errs.push('click ' + c + ': ' + e.message)); await page.waitForTimeout(500); }
  if (opt('room')) { const el = await page.$('.room-stage'); if (el) await el.screenshot({ path: out }); else await page.screenshot({ path: out }); }
  else await page.screenshot({ path: out, fullPage: !!opt('full') });
  console.log(errs.length ? 'Konsolenfehler:\n' + errs.join('\n') : 'Keine Konsolenfehler');
  await browser.close();
})();
