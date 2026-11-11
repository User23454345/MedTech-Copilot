#!/usr/bin/env node
/* Validiert Geräte-, Bereichs- und Szenariodaten des MedTech Simulators.
   Nutzung: node tools/validate.js            (alle Dateien aus index.html)
            node tools/validate.js js/data/area-or.js   (nur Ausgabe zu dieser Datei hervorheben) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const noop = () => {};
const fakeEl = () => ({ style: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, appendChild: noop, addEventListener: noop, setAttribute: noop, querySelector: () => null, querySelectorAll: () => [] });
const ctx = {
  console, Math, JSON, Date, setTimeout, clearTimeout,
  localStorage: { getItem: () => null, setItem: noop },
  requestAnimationFrame: noop, devicePixelRatio: 1, innerWidth: 1400,
  document: { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], createElement: fakeEl, createTextNode: fakeEl, body: fakeEl(), hidden: false },
  location: { hash: '' }, addEventListener: noop
};
ctx.window = ctx;
vm.createContext(ctx);
const fileOfDevice = {}, fileOfArea = {}, fileOfScen = {};
let errors = [], warns = [];
for (const s of scripts) {
  const p = path.join(root, s);
  if (!fs.existsSync(p)) { warns.push(`Skript fehlt: ${s}`); continue; }
  const before = { d: new Set(Object.keys(ctx.MT ? ctx.MT.devices : {})), a: new Set(ctx.MT ? ctx.MT.areas.map(a => a.id) : []), s: new Set(Object.keys(ctx.MT ? ctx.MT.scenarios : {})) };
  const beforeDevCount = ctx.MT ? Object.keys(ctx.MT.devices).length : 0;
  // Doppelte Geräte-IDs erkennen
  if (ctx.MT && !ctx.MT.__wrapped) {
    const orig = ctx.MT.registerDevice; ctx.MT.registerDevice = function (d) { if (ctx.MT.devices[d.id]) errors.push(`Geräte-ID doppelt registriert: "${d.id}" (in ${s}, zuvor ${fileOfDevice[d.id]})`); return orig(d); }; ctx.MT.__wrapped = true;
  }
  try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: s }); }
  catch (e) { errors.push(`Fehler beim Laden von ${s}: ${e.message}`); continue; }
  if (!ctx.MT) continue;
  Object.keys(ctx.MT.devices).forEach(k => { if (!before.d.has(k) && !fileOfDevice[k]) fileOfDevice[k] = s; });
  ctx.MT.areas.forEach(a => { if (!before.a.has(a.id)) fileOfArea[a.id] = s; });
  Object.keys(ctx.MT.scenarios).forEach(k => { if (!before.s.has(k)) fileOfScen[k] = s; });
}
const MT = ctx.MT;
const PRIOS = ['high', 'medium', 'low'];
const TYPES = ['Gas', 'Strom', 'Daten', 'Fluid', 'Signal', 'Klinisch', 'Strahlung'];
const SIMS = ['ventilation', 'ecg', 'spo2', 'bloodpressure', 'infusion', 'defibrillation', 'imaging'];
const E = (f, m) => errors.push(`[${f}] ${m}`), W = (f, m) => warns.push(`[${f}] ${m}`);
for (const id of Object.keys(MT.devices)) {
  const d = MT.devices[id], f = fileOfDevice[id];
  for (const k of ['name', 'category', 'purpose', 'function']) if (!d[k] || typeof d[k] !== 'string') E(f, `Gerät ${id}: Feld "${k}" fehlt`);
  if (d.manufacturers.length < 2) E(f, `Gerät ${id}: mind. 2 Hersteller-Beispiele`);
  if (d.components.length < 3) E(f, `Gerät ${id}: mind. 3 Komponenten`);
  if (d.measurements.length < 2) E(f, `Gerät ${id}: mind. 2 Messwerte`);
  if (d.alarms.length < 2) E(f, `Gerät ${id}: mind. 2 Alarme`);
  if (d.connections.length < 2) E(f, `Gerät ${id}: mind. 2 Verbindungen`);
  if (d.safety.length < 2) E(f, `Gerät ${id}: mind. 2 Sicherheitsaspekte`);
  d.components.forEach(c => { if (!c.name || !c.desc) E(f, `Gerät ${id}: Komponente ohne name/desc`); });
  d.measurements.forEach(m => { if (!m.name || m.unit == null || m.normal == null) E(f, `Gerät ${id}: Messwert unvollständig (${m.name})`); });
  d.alarms.forEach(a => { if (!PRIOS.includes(a.prio)) E(f, `Gerät ${id}: Alarm "${a.name}" hat ungültige prio "${a.prio}"`); if (!a.cause || !a.action) E(f, `Gerät ${id}: Alarm "${a.name}" ohne cause/action`); });
  d.connections.forEach(c => { if (!TYPES.includes(c.type)) E(f, `Gerät ${id}: Verbindungstyp "${c.type}" ungültig`); if (!MT.devices[c.to]) E(f, `Gerät ${id}: Verbindung zu unbekanntem Gerät "${c.to}"`); if (c.to === id) E(f, `Gerät ${id}: Verbindung zu sich selbst`); });
  (d.parts || []).forEach(p => { if (!d.components.some(c => c.name === p.name)) E(f, `Gerät ${id}: part "${p.name}" ist keine Komponente`); });
  if (d.sim && !SIMS.includes(d.sim)) E(f, `Gerät ${id}: sim "${d.sim}" ungültig`);
  if (d.visual && !MT.sprites[d.visual]) E(f, `Gerät ${id}: visual "${d.visual}" unbekannt`);
  if (!MT.areas.some(a => (a.placements || []).some(p => p.device === id))) W(f, `Gerät ${id} ist in keinem Raum platziert`);
}
for (const a of MT.areas) {
  const f = fileOfArea[a.id];
  for (const k of ['id', 'name', 'icon', 'color', 'description']) if (!a[k]) E(f, `Bereich ${a.id}: Feld "${k}" fehlt`);
  if (!a.placements || a.placements.length < 5) E(f, `Bereich ${a.id}: mind. 5 Geräteplatzierungen`);
  (a.placements || []).forEach((p, i) => {
    if (!MT.devices[p.device]) E(f, `Bereich ${a.id}: Platzierung ${i} – Gerät "${p.device}" unbekannt`);
    if (!MT.sprites[p.visual]) E(f, `Bereich ${a.id}: Platzierung ${p.device} – visual "${p.visual}" unbekannt`);
    if (![p.x, p.y, p.w].every(v => typeof v === 'number')) E(f, `Bereich ${a.id}: Platzierung ${p.device} – x/y/w müssen Zahlen sein`);
    const sp = MT.sprites[p.visual] || MT.sprites.generic; const h = p.h || p.w * sp.vb[1] / sp.vb[0];
    if (p.x < -20 || p.y < -20 || p.x + p.w > 1620 || p.y + h > 900) W(f, `Bereich ${a.id}: ${p.device} ragt aus dem Raum (x ${p.x}–${Math.round(p.x + p.w)}, y ${p.y}–${Math.round(p.y + h)})`);
    if (p.live) { if (!['monitor', 'ventilator'].includes(p.live.type)) E(f, `Bereich ${a.id}: live.type ungültig`); if (!a.createState) E(f, `Bereich ${a.id}: live-Bildschirm benötigt createState()`); }
  });
  (a.decor || []).forEach(d => { if (!MT.sprites[d.visual]) E(f, `Bereich ${a.id}: decor visual "${d.visual}" unbekannt`); });
  (a.scenarios || []).forEach(sid => { if (!MT.scenarios[sid]) E(f, `Bereich ${a.id}: Szenario "${sid}" nicht registriert`); });
  if (a.createState) { try { const st = a.createState(); if (!st.patient) E(f, `Bereich ${a.id}: createState() ohne patient`); } catch (e) { E(f, `Bereich ${a.id}: createState() wirft ${e.message}`); } }
}
for (const sid of Object.keys(MT.scenarios)) {
  const s = MT.scenarios[sid], f = fileOfScen[sid], a = MT.areaById[s.area];
  if (!a) { E(f, `Szenario ${sid}: Bereich "${s.area}" unbekannt`); continue; }
  if (!(a.scenarios || []).includes(sid)) W(f, `Szenario ${sid} ist nicht in area.scenarios gelistet`);
  if (!s.title || !s.summary) E(f, `Szenario ${sid}: title/summary fehlt`);
  (s.steps || []).forEach((st, i) => {
    if (!['info', 'find', 'quiz'].includes(st.type)) E(f, `Szenario ${sid} Schritt ${i}: Typ "${st.type}" ungültig`);
    if (st.type === 'find') { if (!(a.placements || []).some(p => p.device === st.device)) E(f, `Szenario ${sid} Schritt ${i}: Gerät "${st.device}" ist im Raum nicht platziert`); if (!st.prompt) E(f, `Szenario ${sid} Schritt ${i}: prompt fehlt`); }
    if (st.type === 'quiz') {
      const nc = (st.options || []).filter(o => o.correct).length;
      if (!st.question) E(f, `Szenario ${sid} Schritt ${i}: question fehlt`);
      if (st.multi ? nc < 1 : nc !== 1) E(f, `Szenario ${sid} Schritt ${i}: ${st.multi ? 'mind. 1' : 'genau 1'} richtige Antwort nötig (hat ${nc})`);
    }
    if (st.enter && !a.createState) W(f, `Szenario ${sid} Schritt ${i}: enter() ohne createState im Bereich`);
  });
}
const only = process.argv[2];
const filt = l => !only || l.includes(only);
const ef = errors.filter(filt), wf = warns.filter(filt);
console.log(`Geräte: ${Object.keys(MT.devices).length} · Bereiche: ${MT.areas.length} · Szenarien: ${Object.keys(MT.scenarios).length}`);
wf.forEach(w => console.log('WARNUNG ' + w));
ef.forEach(e => console.log('FEHLER  ' + e));
console.log(ef.length ? `\n${ef.length} Fehler` : '\nOK – keine Fehler' + (only ? ' für ' + only : ''));
process.exit(ef.length ? 1 : 0);
