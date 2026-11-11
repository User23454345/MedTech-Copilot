/* =====================================================================
   SVG-Gerätevisualisierungen (eigene, generische Darstellungen –
   keine Abbildungen realer Produkte). Jede Darstellung hat eine
   lokale viewBox [w,h] und wird vom Raum-Renderer skaliert.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  var S = MT.sprites;

  MT.spriteDefs = [
    '<linearGradient id="g-plastic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset="1" stop-color="#d5dce4"/></linearGradient>',
    '<linearGradient id="g-plastic-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e1e7ee"/><stop offset=".45" stop-color="#fbfcfd"/><stop offset="1" stop-color="#cfd7e0"/></linearGradient>',
    '<linearGradient id="g-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d5866"/><stop offset="1" stop-color="#262d36"/></linearGradient>',
    '<linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d98a4"/><stop offset=".5" stop-color="#eef2f5"/><stop offset="1" stop-color="#86919d"/></linearGradient>',
    '<linearGradient id="g-metal-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2f5"/><stop offset="1" stop-color="#9aa5b1"/></linearGradient>',
    '<linearGradient id="g-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1b28"/><stop offset="1" stop-color="#03070b"/></linearGradient>',
    '<linearGradient id="g-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b8de0"/><stop offset="1" stop-color="#1b5aa6"/></linearGradient>',
    '<linearGradient id="g-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25b5a8"/><stop offset="1" stop-color="#127a72"/></linearGradient>',
    '<linearGradient id="g-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f05a5a"/><stop offset="1" stop-color="#b52a2a"/></linearGradient>',
    '<linearGradient id="g-yellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd85e"/><stop offset="1" stop-color="#e0a800"/></linearGradient>',
    '<linearGradient id="g-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe0ef"/></linearGradient>',
    '<linearGradient id="g-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c9a8"/><stop offset="1" stop-color="#d9a17c"/></linearGradient>',
    '<linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(220,240,255,.55)"/><stop offset="1" stop-color="rgba(150,190,220,.25)"/></linearGradient>',
    '<radialGradient id="g-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffef0"/><stop offset=".6" stop-color="#fff6c8"/><stop offset="1" stop-color="#d8cf9a"/></radialGradient>',
    '<radialGradient id="g-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(255,250,220,.55)"/><stop offset="1" stop-color="rgba(255,250,220,0)"/></radialGradient>',
    '<filter id="f-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0b1a2b" flood-opacity=".28"/></filter>',
    '<filter id="f-soft" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0b1a2b" flood-opacity=".25"/></filter>'
  ].join('');

  /* ---------- Hilfen ---------- */
  function wheel(x, y, r) {
    r = r || 9;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2a3038"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.4) + '" fill="#8a949e"/>';
  }
  function screenWaves(x, y, w, h, n) {
    // statische, stilisierte Kurven für nicht-live Bildschirme
    var cols = ['#3cff7a', '#3fe0ff', '#ff4d5e', '#ffd84a'];
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="url(#g-screen)"/>';
    n = n || 3;
    var ww = w * 0.68, rh = h / n;
    for (var i = 0; i < n; i++) {
      var yy = y + rh * (i + 0.6), d = 'M' + (x + 4) + ' ' + yy;
      for (var k = 0; k < 6; k++) {
        var bx = x + 4 + k * ww / 6;
        if (i === 0) d += ' L' + (bx + ww / 12) + ' ' + yy + ' l2 -' + (rh * 0.45) + ' l2 ' + (rh * 0.6) + ' l2 -' + (rh * 0.15);
        else d += ' Q' + (bx + ww / 24) + ' ' + (yy - rh * 0.45) + ' ' + (bx + ww / 12) + ' ' + yy + ' T' + (bx + ww / 6) + ' ' + yy;
      }
      out += '<path d="' + d + '" fill="none" stroke="' + cols[i % 4] + '" stroke-width="1.4"/>';
      out += '<rect x="' + (x + w * 0.74) + '" y="' + (y + rh * i + rh * 0.2) + '" width="' + (w * 0.22) + '" height="' + (rh * 0.55) + '" rx="2" fill="' + cols[i % 4] + '" opacity=".85"/>';
    }
    return out;
  }
  function textScreen(x, y, w, h, color, lines) {
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="url(#g-screen)"/>';
    (lines || []).forEach(function (l, i) {
      out += '<text x="' + (x + 4) + '" y="' + (y + 4 + (i + 1) * (h - 6) / (lines.length + 0.3)) + '" font-size="' + Math.max(5, (h - 6) / (lines.length + 0.6)) + '" fill="' + (color || '#7fe7ff') + '" font-family="monospace">' + MT.esc(l) + '</text>';
    });
    return out;
  }
  MT.spriteHelpers = { wheel: wheel, screenWaves: screenWaves, textScreen: textScreen };

  function def(name, vb, draw) { S[name] = { vb: vb, draw: draw }; }

  /* ---------- Patientenmonitor (an Schwenkarm) ---------- */
  def('monitor', [240, 200], function (o) {
    return '<g filter="url(#f-shadow)">' +
      (o.arm !== false ? '<rect x="110" y="150" width="20" height="50" fill="url(#g-metal)"/>' : '') +
      '<rect x="4" y="4" width="232" height="156" rx="12" fill="url(#g-dark)"/>' +
      '<rect x="12" y="12" width="216" height="132" rx="4" fill="#000"/>' +
      (o.live ? '' : screenWaves(14, 14, 212, 128, 4)) +
      '<circle cx="120" cy="152" r="3" fill="#47d16b"/><rect x="190" y="148" width="30" height="6" rx="3" fill="#e0182d" opacity=".8"/></g>';
  });

  /* ---------- Zentrale / PDMS-Arbeitsplatz ---------- */
  def('workstation', [260, 230], function () {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="10" y="150" width="240" height="14" rx="3" fill="#b9c3cc"/>' +
      '<rect x="20" y="164" width="12" height="66" fill="#9aa5b1"/><rect x="228" y="164" width="12" height="66" fill="#9aa5b1"/>' +
      '<rect x="18" y="20" width="108" height="78" rx="6" fill="url(#g-dark)"/>' + screenWaves(24, 26, 96, 66, 3) +
      '<rect x="134" y="20" width="108" height="78" rx="6" fill="url(#g-dark)"/>' + textScreen(140, 26, 96, 66, '#9fd3ff', ['Bett 1  HF 82 SpO2 97', 'Bett 2  HF 64 SpO2 95', 'Bett 3  HF 78 SpO2 96', 'Bett 4  frei', 'PDMS · Kurve']) +
      '<rect x="64" y="98" width="16" height="40" fill="#7d8894"/><rect x="180" y="98" width="16" height="40" fill="#7d8894"/>' +
      '<rect x="40" y="136" width="180" height="14" rx="3" fill="#2e3742"/><rect x="190" y="138" width="22" height="10" rx="5" fill="#59636e"/></g>';
  });

  /* ---------- Intensivbeatmungsgerät ---------- */
  def('ventilator', [170, 430], function (o) {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="78" y="200" width="14" height="190" fill="url(#g-metal)"/>' +
      '<path d="M25 395 h120 l12 12 h-144 z" fill="#3b4450"/>' + wheel(30, 414) + wheel(140, 414) + wheel(85, 418) +
      // Display
      '<rect x="8" y="6" width="154" height="118" rx="10" fill="url(#g-dark)"/>' +
      '<rect x="15" y="13" width="140" height="98" rx="3" fill="url(#g-screen)"/>' +
      (o.live ? '' : '<path d="M20 50 h10 l6 -24 h18 l4 24 h20 l6 -24 h18 l4 24 h20" stroke="#ffd84a" fill="none" stroke-width="1.6"/><path d="M20 82 h10 q6 -18 12 0 q10 12 24 0 h10 q6 -18 12 0 q10 12 24 0" stroke="#3fe0ff" fill="none" stroke-width="1.6"/><rect x="120" y="18" width="30" height="88" fill="#0f2233"/>') +
      '<circle cx="85" cy="118" r="4" fill="#1fb5d6"/>' +
      // Grundgerät
      '<rect x="22" y="200" width="126" height="120" rx="12" fill="url(#g-plastic)" stroke="#c3ccd6"/>' +
      '<rect x="30" y="212" width="110" height="10" rx="5" fill="#e6ebf0"/>' +
      '<circle cx="50" cy="290" r="11" fill="#dfe6ed" stroke="#9aa6b2" stroke-width="2"/><circle cx="50" cy="290" r="4" fill="#3b8de0"/>' +
      '<circle cx="120" cy="290" r="11" fill="#dfe6ed" stroke="#9aa6b2" stroke-width="2"/><circle cx="120" cy="290" r="4" fill="#7d8894"/>' +
      '<text x="38" y="258" font-size="9" fill="#5a6672" font-family="system-ui">INSP</text><text x="110" y="258" font-size="9" fill="#5a6672" font-family="system-ui">EXP</text>' +
      '<rect x="62" y="124" width="46" height="76" fill="url(#g-metal)"/>' +
      // Befeuchter
      '<rect x="26" y="330" width="56" height="52" rx="6" fill="#dfe6ed" stroke="#aab5c0"/><rect x="34" y="340" width="40" height="34" rx="4" fill="rgba(120,190,240,.5)"/><text x="30" y="327" font-size="8" fill="#5a6672" font-family="system-ui">Befeuchter</text>' +
      '</g>';
  });

  /* ---------- Volumetrische Infusionspumpe (einzeln) ---------- */
  def('infusion-pump', [110, 120], function (o) {
    return '<g filter="url(#f-soft)"><rect x="4" y="4" width="102" height="112" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      textScreen(14, 14, 82, 34, '#9fffb0', [(o.rate || '125') + ' ml/h', 'VTBI 500 ml']) +
      '<rect x="14" y="56" width="82" height="36" rx="5" fill="#e4eaf0" stroke="#c3ccd6"/><path d="M55 56 v36" stroke="#3b8de0" stroke-width="3"/>' +
      '<circle cx="24" cy="104" r="5" fill="#47d16b"/><circle cx="40" cy="104" r="5" fill="#e0182d"/><rect x="60" y="99" width="36" height="10" rx="5" fill="#3b8de0"/></g>';
  });

  /* ---------- Spritzenpumpe ---------- */
  def('syringe-pump', [150, 62], function (o) {
    return '<g filter="url(#f-soft)"><rect x="2" y="2" width="146" height="58" rx="8" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="10" y="10" width="92" height="20" rx="10" fill="url(#g-glass)" stroke="#9fb3c8"/><rect x="12" y="13" width="' + (o.fill || 60) + '" height="14" rx="7" fill="' + (o.color || 'rgba(255,240,180,.85)') + '"/>' +
      '<rect x="100" y="12" width="6" height="16" fill="#7d8894"/>' +
      textScreen(110, 10, 32, 20, '#9fffb0', [o.rate || '4,2']) +
      '<rect x="10" y="38" width="60" height="14" rx="3" fill="#dfe6ed"/><text x="14" y="49" font-size="9" fill="#4a5563" font-family="system-ui">' + MT.esc(o.label || 'Medikament') + '</text>' +
      '<circle cx="118" cy="45" r="5" fill="#47d16b"/><circle cx="134" cy="45" r="5" fill="#e6ebf0" stroke="#9aa6b2"/></g>';
  });

  /* ---------- Infusionsständer mit Pumpenturm ---------- */
  def('pump-stack', [180, 520], function (o) {
    var pumps = o.pumps || [
      { label: 'Noradrenalin', rate: '4,2', color: 'rgba(255,230,160,.9)', fill: 55 },
      { label: 'Propofol 2 %', rate: '15', color: 'rgba(255,255,255,.95)', fill: 70 },
      { label: 'Sufentanil', rate: '6,0', color: 'rgba(200,240,255,.9)', fill: 40 },
      { label: 'Insulin', rate: '2,0', color: 'rgba(220,255,220,.9)', fill: 30 }
    ];
    var out = '<g>' +
      '<rect x="86" y="10" width="8" height="470" fill="url(#g-metal)"/>' +
      '<path d="M40 14 h100" stroke="#9aa5b1" stroke-width="5" stroke-linecap="round"/>' +
      // Infusionsbeutel
      '<path d="M48 20 h28 v46 q-14 12 -28 0 z" fill="rgba(230,245,255,.85)" stroke="#9fb3c8"/><rect x="58" y="66" width="8" height="10" fill="#cfd8e1"/><text x="51" y="44" font-size="7" fill="#3b4b5c" font-family="system-ui">NaCl</text>' +
      '<path d="M104 20 h28 v40 q-14 12 -28 0 z" fill="rgba(255,250,225,.9)" stroke="#c9b98a"/><rect x="114" y="60" width="8" height="10" fill="#cfd8e1"/>' +
      '<path d="M62 76 C 62 140, 30 150, 30 200" stroke="rgba(160,190,220,.9)" fill="none" stroke-width="2"/>' +
      '<path d="M118 70 C 118 140, 150 150, 150 200" stroke="rgba(160,190,220,.9)" fill="none" stroke-width="2"/>' +
      // Pumpenrack
      '<rect x="12" y="150" width="156" height="' + (pumps.length * 66 + 140) + '" rx="8" fill="#c8d1da" filter="url(#f-shadow)"/>';
    pumps.forEach(function (p, i) {
      out += '<g transform="translate(15,' + (156 + i * 66) + ')">' + S['syringe-pump'].draw(p) + '</g>';
    });
    out += '<g transform="translate(35,' + (160 + pumps.length * 66) + ')">' + S['infusion-pump'].draw({ rate: o.ivRate || '80' }) + '</g>';
    out += '<path d="M50 ' + (pumps.length * 66 + 296) + ' l-40 190 M130 ' + (pumps.length * 66 + 296) + ' l40 190" stroke="#8d98a4" stroke-width="5"/>' + wheel(12, 500 + 0, 8) + wheel(168, 500, 8) + '</g>';
    return out;
  });

  /* ---------- Absaugung (Wand-Vakuumregler + Sekretbehälter) ---------- */
  def('suction', [90, 200], function () {
    return '<g filter="url(#f-soft)">' +
      '<rect x="30" y="2" width="30" height="14" rx="3" fill="#e0a800"/>' +
      '<rect x="20" y="16" width="50" height="60" rx="8" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<circle cx="45" cy="42" r="17" fill="#fff" stroke="#7d8894" stroke-width="2"/><path d="M45 42 L55 32" stroke="#e0182d" stroke-width="2"/><text x="33" y="68" font-size="8" fill="#4a5563" font-family="system-ui">-kPa</text>' +
      '<rect x="40" y="76" width="10" height="16" fill="#9aa5b1"/>' +
      '<path d="M18 92 h54 v90 q0 14 -14 14 h-26 q-14 0 -14 -14 z" fill="url(#g-glass)" stroke="#8fa6bc" stroke-width="2"/>' +
      '<path d="M20 150 h50 v32 q0 12 -12 12 h-26 q-12 0 -12 -12 z" fill="rgba(230,215,170,.75)"/>' +
      '<path d="M72 110 C 95 120, 88 160, 86 198" stroke="#b9d6ea" fill="none" stroke-width="4"/></g>';
  });

  /* ---------- Defibrillator auf Notfallwagen ---------- */
  def('defibrillator', [170, 330], function () {
    return '<g filter="url(#f-shadow)">' +
      // Notfallwagen
      '<rect x="10" y="120" width="150" height="180" rx="8" fill="url(#g-red)"/>' +
      [0, 1, 2, 3].map(function (i) { return '<rect x="18" y="' + (130 + i * 42) + '" width="134" height="36" rx="4" fill="#d43c3c" stroke="#a52626"/><rect x="70" y="' + (144 + i * 42) + '" width="30" height="6" rx="3" fill="#f3d5d5"/>'; }).join('') +
      wheel(26, 312) + wheel(144, 312) +
      // Defi
      '<rect x="18" y="26" width="134" height="96" rx="10" fill="#4a4f57"/><rect x="24" y="32" width="122" height="60" rx="4" fill="#ffd400"/>' +
      '<rect x="30" y="38" width="76" height="48" rx="3" fill="url(#g-screen)"/><path d="M34 62 h8 l3 -14 l3 22 l3 -8 h14 l3 -14 l3 22 l3 -8 h16" stroke="#3cff7a" fill="none" stroke-width="1.4"/>' +
      '<circle cx="124" cy="50" r="10" fill="#2a2f36" stroke="#111" stroke-width="2"/><path d="M124 50 l6 -5" stroke="#fff" stroke-width="2"/>' +
      '<rect x="112" y="68" width="10" height="10" rx="2" fill="#f2b705"/><rect x="128" y="68" width="10" height="10" rx="5" fill="#e0182d"/>' +
      '<rect x="22" y="96" width="38" height="22" rx="6" fill="#2a2f36"/><rect x="110" y="96" width="38" height="22" rx="6" fill="#2a2f36"/>' +
      '<text x="64" y="112" font-size="9" fill="#ffd400" font-family="system-ui" font-weight="700">DEFI</text>' +
      '</g>';
  });

  /* ---------- Intensivbett mit Patient (Seitenansicht, Kopf links) ---------- */
  def('bed', [720, 300], function (o) {
    var occupied = o.patient !== false;
    return '<g filter="url(#f-shadow)">' +
      '<rect x="40" y="170" width="640" height="20" rx="6" fill="#9aa5b1"/>' +
      '<rect x="80" y="190" width="18" height="80" fill="#7d8894"/><rect x="620" y="190" width="18" height="80" fill="#7d8894"/>' +
      '<rect x="60" y="250" width="600" height="14" rx="5" fill="#5e6874"/>' + wheel(80, 280, 12) + wheel(640, 280, 12) + wheel(360, 280, 12) +
      // Kopf- und Fußteil
      '<rect x="20" y="60" width="30" height="130" rx="10" fill="url(#g-plastic-h)" stroke="#b9c3cc"/>' +
      '<rect x="670" y="90" width="30" height="100" rx="10" fill="url(#g-plastic-h)" stroke="#b9c3cc"/>' +
      // Matratze (Kopfteil angehoben 30°)
      '<path d="M50 150 L60 92 L210 132 L210 160 L670 160 L670 182 L50 182 Z" fill="#e8eef4" stroke="#b9c3cc"/>' +
      (occupied ?
        // Patient (stilisiert) – Kopf, Decke
        '<ellipse cx="96" cy="96" rx="26" ry="22" fill="url(#g-skin)"/><path d="M76 86 q20 -20 42 -2" fill="#5b4636"/>' +
        '<path d="M70 112 q60 10 140 28 L640 140 q30 0 30 20 L210 160 Z" fill="url(#g-sheet)" stroke="#a9c1d6"/>' +
        '<path d="M120 122 q40 2 90 16" fill="none" stroke="#a9c1d6"/>' +
        // Tubus
        '<path d="M110 100 h28" stroke="#e8f2fb" stroke-width="5" stroke-linecap="round"/><rect x="134" y="95" width="10" height="10" rx="2" fill="#3b8de0"/>' : '') +
      // Seitengitter
      '<rect x="230" y="120" width="220" height="40" rx="8" fill="rgba(200,215,230,.35)" stroke="#a7b4c1" stroke-width="3"/>' +
      '<rect x="470" y="124" width="180" height="36" rx="8" fill="rgba(200,215,230,.35)" stroke="#a7b4c1" stroke-width="3"/>' +
      '<rect x="300" y="132" width="70" height="18" rx="4" fill="#2f3842"/><rect x="304" y="135" width="30" height="12" rx="2" fill="#5fd3ff"/>' +
      '</g>';
  });

  /* ---------- Normales Pflegebett ---------- */
  def('ward-bed', [520, 240], function (o) {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="30" y="140" width="470" height="16" rx="5" fill="#a8b2bc"/>' + wheel(60, 222, 11) + wheel(470, 222, 11) +
      '<rect x="60" y="156" width="14" height="60" fill="#8a949e"/><rect x="456" y="156" width="14" height="60" fill="#8a949e"/>' +
      '<rect x="14" y="60" width="26" height="100" rx="8" fill="#c9a77c"/><rect x="490" y="86" width="26" height="74" rx="8" fill="#c9a77c"/>' +
      '<rect x="40" y="118" width="450" height="26" rx="6" fill="#eef3f7" stroke="#b9c3cc"/>' +
      (o.patient !== false ? '<ellipse cx="80" cy="104" rx="22" ry="19" fill="url(#g-skin)"/><path d="M62 96 q18 -18 36 -2" fill="#8b6b4a"/><path d="M60 122 q40 -22 120 -8 L470 112 q16 0 16 10 L60 124 z" fill="url(#g-sheet)" stroke="#a9c1d6"/>' : '<rect x="50" y="104" width="70" height="18" rx="8" fill="#fff" stroke="#c3ccd6"/>') +
      '</g>';
  });

  /* ---------- Trage (Notaufnahme) ---------- */
  def('stretcher', [520, 240], function (o) {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="30" y="130" width="460" height="14" rx="5" fill="#2f3842"/>' +
      '<path d="M90 144 L200 210 M200 144 L90 210 M330 144 L440 210 M440 144 L330 210" stroke="#7d8894" stroke-width="7"/>' +
      wheel(80, 222, 11) + wheel(210, 222, 11) + wheel(320, 222, 11) + wheel(450, 222, 11) +
      '<path d="M40 128 L50 70 L160 104 L160 118 L480 118 L480 132 L40 132 Z" fill="#2c6fb3" stroke="#1d4f82"/>' +
      (o.patient !== false ? '<ellipse cx="86" cy="80" rx="22" ry="19" fill="url(#g-skin)"/><path d="M68 72 q18 -18 36 -2" fill="#2e2a26"/><path d="M66 98 q50 4 94 18 L460 112 q16 0 16 8 L160 118 Z" fill="url(#g-sheet)" stroke="#a9c1d6"/>' : '') +
      '<rect x="210" y="96" width="160" height="26" rx="6" fill="none" stroke="#9aa6b2" stroke-width="3"/></g>';
  });

  /* ---------- Deckenversorgungseinheit / Medienampel ---------- */
  def('pendant', [130, 560], function () {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="40" y="0" width="50" height="40" fill="url(#g-metal)"/><rect x="0" y="36" width="130" height="22" rx="6" fill="url(#g-plastic)"/>' +
      '<rect x="56" y="58" width="18" height="90" fill="url(#g-metal)"/>' +
      '<rect x="18" y="148" width="94" height="360" rx="10" fill="url(#g-plastic-h)" stroke="#b9c3cc"/>' +
      // Gasanschlüsse: O2 weiß, Druckluft schwarz/weiß, Vakuum gelb (ISO 32)
      '<circle cx="42" cy="186" r="11" fill="#fff" stroke="#7d8894" stroke-width="2"/><text x="35" y="209" font-size="8" fill="#334" font-family="system-ui">O₂</text>' +
      '<circle cx="88" cy="186" r="11" fill="#fff" stroke="#111" stroke-width="5"/><text x="78" y="209" font-size="8" fill="#334" font-family="system-ui">AIR</text>' +
      '<circle cx="42" cy="232" r="11" fill="#ffd400" stroke="#7d8894" stroke-width="2"/><text x="34" y="255" font-size="8" fill="#334" font-family="system-ui">VAC</text>' +
      '<circle cx="88" cy="232" r="11" fill="#fff" stroke="#7d8894" stroke-width="2"/><text x="80" y="255" font-size="8" fill="#334" font-family="system-ui">O₂</text>' +
      // Steckdosen: grün = Netzersatz (SV), weiß = allgemein
      [0, 1, 2, 3].map(function (i) { return '<rect x="' + (28 + (i % 2) * 42) + '" y="' + (280 + Math.floor(i / 2) * 44) + '" width="34" height="34" rx="6" fill="' + (i < 2 ? '#2fb36a' : '#f4f6f8') + '" stroke="#7d8894"/><circle cx="' + (39 + (i % 2) * 42) + '" cy="' + (297 + Math.floor(i / 2) * 44) + '" r="2.5" fill="#333"/><circle cx="' + (51 + (i % 2) * 42) + '" cy="' + (297 + Math.floor(i / 2) * 44) + '" r="2.5" fill="#333"/>'; }).join('') +
      '<rect x="30" y="380" width="70" height="16" rx="3" fill="#2f6fb0"/><text x="36" y="392" font-size="8" fill="#fff" font-family="system-ui">LAN / RJ45</text>' +
      '<rect x="30" y="404" width="70" height="16" rx="3" fill="#dfe6ed"/><text x="38" y="416" font-size="8" fill="#334" font-family="system-ui">PA-Erdung</text>' +
      '<rect x="24" y="440" width="82" height="58" rx="6" fill="#e6ebf0"/><path d="M34 452 h62 M34 468 h62 M34 484 h62" stroke="#c3ccd6" stroke-width="5" stroke-linecap="round"/>' +
      '</g>';
  });

  /* ---------- Ernährungspumpe ---------- */
  def('feeding-pump', [90, 210], function () {
    return '<g filter="url(#f-soft)"><path d="M20 2 h40 v60 q-20 14 -40 0 z" fill="rgba(255,245,215,.95)" stroke="#c9b98a"/><text x="24" y="32" font-size="8" fill="#6b5a2a" font-family="system-ui">Sonden-</text><text x="24" y="42" font-size="8" fill="#6b5a2a" font-family="system-ui">kost</text>' +
      '<path d="M40 66 C 40 90, 60 90, 60 110" stroke="#c9a94f" fill="none" stroke-width="3"/>' +
      '<rect x="8" y="104" width="76" height="96" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' + textScreen(16, 112, 60, 24, '#ffd27a', ['60 ml/h']) +
      '<circle cx="46" cy="160" r="16" fill="#efe7cf" stroke="#9aa6b2" stroke-width="2"/><circle cx="46" cy="160" r="5" fill="#9a8a5a"/><rect x="20" y="184" width="52" height="8" rx="4" fill="#9a7b2a"/></g>';
  });

  /* ---------- Druckmesssystem (Wandler am Halter) ---------- */
  def('transducer', [90, 170], function () {
    return '<g filter="url(#f-soft)"><path d="M14 2 h30 v52 q-15 10 -30 0 z" fill="rgba(230,245,255,.9)" stroke="#9fb3c8"/>' +
      '<rect x="4" y="60" width="60" height="70" rx="6" fill="#e9e1e1" stroke="#bf6b6b" stroke-width="2"/><text x="10" y="76" font-size="8" fill="#a33" font-family="system-ui">300 mmHg</text>' +
      '<rect x="56" y="140" width="30" height="14" rx="4" fill="#fff" stroke="#e05050" stroke-width="2"/><rect x="44" y="144" width="12" height="6" fill="#e05050"/>' +
      '<path d="M71 140 v-60" stroke="#c3ccd6" stroke-width="3"/><path d="M86 147 C 100 147, 100 165, 90 168" stroke="#e05050" fill="none" stroke-width="2"/>' +
      '<text x="4" y="168" font-size="8" fill="#334" font-family="system-ui">Wandler</text></g>';
  });

  /* ---------- Blutgasanalysator ---------- */
  def('bga', [180, 170], function () {
    return '<g filter="url(#f-shadow)"><rect x="6" y="20" width="168" height="140" rx="12" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      textScreen(18, 32, 92, 70, '#9fd3ff', ['pH    7,38', 'pCO2  41', 'pO2   92', 'Lac   1,4', 'K+    4,1']) +
      '<rect x="120" y="32" width="44" height="70" rx="6" fill="#e1e7ee"/><path d="M142 44 v28" stroke="#7d8894" stroke-width="5" stroke-linecap="round"/><circle cx="142" cy="84" r="6" fill="#3b8de0"/>' +
      '<rect x="18" y="114" width="146" height="34" rx="6" fill="#dfe6ed"/><rect x="26" y="122" width="54" height="18" rx="4" fill="#7d8894"/><text x="90" y="135" font-size="9" fill="#4a5563" font-family="system-ui">Kassette</text></g>';
  });

  /* ---------- Fenster ---------- */
  def('window', [360, 300], function () {
    return '<g><rect x="0" y="0" width="360" height="300" rx="6" fill="#dfe6ed"/>' +
      '<rect x="12" y="12" width="336" height="276" fill="#bfe0f7"/><path d="M12 210 q80 -40 160 -10 t176 -30 v118 h-336 z" fill="#9ccaa0"/><circle cx="290" cy="70" r="26" fill="#fff7cf" opacity=".85"/>' +
      '<path d="M180 12 v276 M12 150 h336" stroke="#dfe6ed" stroke-width="10"/>' +
      '<rect x="0" y="0" width="360" height="300" fill="url(#g-glass)" opacity=".4"/>' +
      '<path d="M8 8 v284" stroke="rgba(255,255,255,.6)" stroke-width="3"/></g>';
  });

  /* ---------- Desinfektionsspender ---------- */
  def('dispenser', [50, 110], function () {
    return '<g filter="url(#f-soft)"><rect x="5" y="5" width="40" height="80" rx="6" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="12" y="22" width="26" height="40" rx="4" fill="rgba(140,200,255,.6)"/><path d="M14 85 h22 l-4 12 h-14 z" fill="#9aa5b1"/><text x="9" y="16" font-size="7" fill="#2f6fb0" font-family="system-ui">HDM</text></g>';
  });

  /* ---------- 12-Kanal-EKG-Gerät ---------- */
  def('ecg-cart', [170, 300], function () {
    return '<g filter="url(#f-shadow)"><rect x="12" y="10" width="146" height="100" rx="8" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="22" y="18" width="126" height="56" rx="3" fill="#fff8f8" stroke="#f0b3b3"/>' +
      [0, 1, 2].map(function (i) { var y = 32 + i * 16; return '<path d="M26 ' + y + ' h12 l3 -8 l3 12 l3 -4 h20 l3 -8 l3 12 l3 -4 h20 l3 -8 l3 12 l3 -4 h20" stroke="#222" fill="none" stroke-width="1"/>'; }).join('') +
      '<rect x="22" y="80" width="126" height="22" rx="4" fill="#dfe6ed"/>' +
      '<rect x="60" y="110" width="50" height="10" fill="#9aa5b1"/><rect x="74" y="120" width="22" height="140" fill="url(#g-metal)"/>' +
      '<path d="M30 260 h110" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(32, 276) + wheel(138, 276) +
      '<path d="M150 60 C 175 90, 165 140, 150 170" stroke="#2a3038" fill="none" stroke-width="3"/>' +
      '<g>' + ['#e33', '#ee3', '#3a3', '#222', '#fff', '#a5f'].map(function (c, i) { return '<circle cx="' + (150 + (i % 3) * 7) + '" cy="' + (176 + Math.floor(i / 3) * 7) + '" r="3" fill="' + c + '" stroke="#555" stroke-width=".5"/>'; }).join('') + '</g></g>';
  });

  /* ---------- Vitaldaten-Messgerät (Spot-Check, fahrbar) ---------- */
  def('spot-monitor', [130, 330], function () {
    return '<g filter="url(#f-shadow)"><rect x="12" y="10" width="106" height="84" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      textScreen(20, 18, 90, 52, '#9fffb0', ['NIBP 128/76', 'SpO2 97 %', 'HF 74', 'T 36,9']) +
      '<circle cx="34" cy="82" r="5" fill="#3b8de0"/><circle cx="54" cy="82" r="5" fill="#47d16b"/>' +
      '<rect x="88" y="98" width="30" height="28" rx="4" fill="#dfe6ed"/><path d="M118 112 C 140 120, 130 170, 116 190" stroke="#2a3038" fill="none" stroke-width="3"/><rect x="100" y="186" width="26" height="40" rx="6" fill="#2c6fb3"/>' +
      '<rect x="58" y="94" width="14" height="200" fill="url(#g-metal)"/><path d="M20 300 h90" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(22, 316) + wheel(108, 316) + '</g>';
  });

  /* ---------- Narkosegerät ---------- */
  def('anesthesia', [260, 460], function (o) {
    return '<g filter="url(#f-shadow)">' +
      '<rect x="20" y="140" width="220" height="270" rx="12" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="30" y="10" width="200" height="130" rx="10" fill="url(#g-dark)"/>' + (o.live ? '' : screenWaves(38, 18, 184, 112, 3)) +
      // Verdampfer
      '<rect x="34" y="156" width="40" height="64" rx="6" fill="#ffd400" stroke="#b39500"/><text x="38" y="196" font-size="8" fill="#333" font-family="system-ui">SEVO</text>' +
      '<rect x="80" y="156" width="40" height="64" rx="6" fill="#4a7fd4" stroke="#2c5aa0"/><text x="84" y="196" font-size="8" fill="#fff" font-family="system-ui">DES</text>' +
      // Flowmeter / Kreissystem
      '<rect x="130" y="156" width="98" height="64" rx="6" fill="#e6ebf0" stroke="#c3ccd6"/>' +
      '<rect x="140" y="164" width="10" height="48" rx="4" fill="#fff" stroke="#9aa6b2"/><circle cx="145" cy="190" r="3" fill="#fff" stroke="#3a3"/>' +
      '<rect x="158" y="164" width="10" height="48" rx="4" fill="#fff" stroke="#9aa6b2"/><circle cx="163" cy="200" r="3" fill="#333"/>' +
      '<rect x="176" y="164" width="10" height="48" rx="4" fill="#fff" stroke="#9aa6b2"/><circle cx="181" cy="206" r="3" fill="#36c"/>' +
      '<circle cx="210" cy="188" r="14" fill="#fff" stroke="#7d8894" stroke-width="2"/>' +
      // Atemkalk + Beutel
      '<rect x="40" y="236" width="56" height="80" rx="8" fill="rgba(240,240,255,.9)" stroke="#9aa6b2"/><rect x="44" y="260" width="48" height="52" rx="6" fill="#d9c8f5"/><text x="44" y="252" font-size="8" fill="#555" font-family="system-ui">CO₂-Abs.</text>' +
      '<path d="M120 240 C 150 236, 150 300, 120 300 C 100 300, 100 240, 120 240 z" fill="#2a3038"/><text x="160" y="276" font-size="8" fill="#555" font-family="system-ui">Handbeutel</text>' +
      '<rect x="30" y="330" width="200" height="60" rx="6" fill="#e6ebf0"/><path d="M40 346 h180 M40 372 h180" stroke="#cfd7e0" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M30 410 h200" stroke="#5e6874" stroke-width="12" stroke-linecap="round"/>' + wheel(40, 432, 11) + wheel(220, 432, 11) +
      '</g>';
  });

  /* ---------- OP-Tisch mit Patient ---------- */
  def('or-table', [620, 260], function (o) {
    return '<g filter="url(#f-shadow)">' +
      '<path d="M250 140 h120 l20 90 h-160 z" fill="url(#g-metal)"/><rect x="200" y="226" width="220" height="22" rx="6" fill="#5e6874"/>' +
      '<rect x="20" y="110" width="580" height="30" rx="8" fill="#2f3842"/>' +
      '<rect x="24" y="96" width="572" height="18" rx="7" fill="#3c4855"/>' +
      (o.patient !== false ? '<ellipse cx="66" cy="78" rx="24" ry="20" fill="url(#g-skin)"/><path d="M44 68 q20 -20 46 -2" fill="#2f6fb0"/>' +
        '<path d="M90 88 q60 -26 200 -16 L560 80 q20 0 20 14 L90 96 z" fill="#3d8f8a"/><rect x="260" y="70" width="90" height="10" rx="3" fill="#f3c9a8"/>' +
        '<path d="M120 20 v66 M118 20 h120" stroke="#3d8f8a" stroke-width="5"/>' : '') +
      '</g>';
  });

  /* ---------- OP-Leuchte (Decke) ---------- */
  def('or-light', [360, 220], function () {
    return '<g><rect x="172" y="0" width="16" height="70" fill="url(#g-metal)"/><path d="M180 70 L80 110 M180 70 L280 110" stroke="#9aa5b1" stroke-width="10" stroke-linecap="round"/>' +
      '<ellipse cx="80" cy="140" rx="70" ry="34" fill="#e6ebf0" stroke="#aab5c0" filter="url(#f-shadow)"/><ellipse cx="80" cy="146" rx="56" ry="22" fill="url(#g-light)"/>' +
      '<ellipse cx="280" cy="140" rx="70" ry="34" fill="#e6ebf0" stroke="#aab5c0" filter="url(#f-shadow)"/><ellipse cx="280" cy="146" rx="56" ry="22" fill="url(#g-light)"/>' +
      '<ellipse cx="180" cy="210" rx="170" ry="16" fill="url(#g-glow)"/></g>';
  });

  /* ---------- HF-Chirurgiegerät ---------- */
  def('esu', [180, 120], function () {
    return '<g filter="url(#f-soft)"><rect x="4" y="4" width="172" height="112" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="16" y="16" width="60" height="34" rx="4" fill="#ffd400"/><text x="22" y="40" font-size="20" fill="#222" font-family="monospace" font-weight="700">40</text><text x="18" y="62" font-size="8" fill="#555" font-family="system-ui">CUT W</text>' +
      '<rect x="100" y="16" width="60" height="34" rx="4" fill="#3b8de0"/><text x="106" y="40" font-size="20" fill="#fff" font-family="monospace" font-weight="700">30</text><text x="102" y="62" font-size="8" fill="#555" font-family="system-ui">COAG W</text>' +
      '<circle cx="34" cy="90" r="10" fill="#2a3038"/><circle cx="70" cy="90" r="10" fill="#2a3038"/><rect x="100" y="80" width="60" height="20" rx="4" fill="#2a3038"/><text x="104" y="94" font-size="8" fill="#fff" font-family="system-ui">NE ✓</text></g>';
  });

  /* ---------- Geräteturm (Endoskopie/Laparoskopie) ---------- */
  def('tower', [200, 470], function () {
    return '<g filter="url(#f-shadow)"><rect x="20" y="10" width="160" height="110" rx="8" fill="url(#g-dark)"/><rect x="28" y="18" width="144" height="94" rx="3" fill="#3a1416"/>' +
      '<circle cx="100" cy="65" r="38" fill="#8a2a2e"/><circle cx="88" cy="58" r="14" fill="#c4565a"/><path d="M60 80 q40 -20 80 0" stroke="#e8a0a0" fill="none" stroke-width="3"/>' +
      '<rect x="92" y="120" width="16" height="30" fill="url(#g-metal)"/>' +
      '<rect x="30" y="150" width="140" height="270" rx="6" fill="#dfe6ed"/>' +
      ['Kamera', 'Lichtquelle', 'Insufflator CO₂', 'Saug-Spül'].map(function (l, i) { return '<rect x="38" y="' + (162 + i * 62) + '" width="124" height="52" rx="5" fill="url(#g-plastic)" stroke="#b9c3cc"/><text x="46" y="' + (182 + i * 62) + '" font-size="9" fill="#334" font-family="system-ui">' + l + '</text><rect x="46" y="' + (190 + i * 62) + '" width="40" height="14" rx="2" fill="url(#g-screen)"/><circle cx="140" cy="' + (190 + i * 62) + '" r="8" fill="#9aa5b1"/>'; }).join('') +
      '<path d="M40 430 h120" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(44, 448) + wheel(156, 448) + '</g>';
  });

  /* ---------- C-Bogen (mobiles Röntgen) ---------- */
  def('c-arm', [360, 420], function () {
    return '<g filter="url(#f-shadow)"><rect x="230" y="250" width="110" height="140" rx="12" fill="url(#g-plastic)" stroke="#b9c3cc"/>' + wheel(250, 400, 12) + wheel(320, 400, 12) +
      '<rect x="190" y="210" width="80" height="34" rx="8" fill="#dfe6ed" stroke="#b9c3cc"/>' +
      '<path d="M200 60 C 40 60, 40 360, 200 360" stroke="#e8edf2" stroke-width="34" fill="none"/><path d="M200 60 C 40 60, 40 360, 200 360" stroke="#c3ccd6" stroke-width="2" fill="none"/>' +
      '<rect x="160" y="30" width="90" height="56" rx="10" fill="#dfe6ed" stroke="#9aa6b2"/><text x="166" y="62" font-size="9" fill="#334" font-family="system-ui">Bildverst./FPD</text>' +
      '<rect x="170" y="336" width="70" height="50" rx="8" fill="#5e6874"/><text x="176" y="366" font-size="9" fill="#fff" font-family="system-ui">Röhre</text>' +
      '<path d="M205 336 L192 92 M205 336 L218 92" stroke="rgba(255,230,120,.35)" stroke-width="2" stroke-dasharray="4 4"/></g>';
  });

  /* ---------- Computertomograph ---------- */
  def('ct', [560, 360], function () {
    return '<g filter="url(#f-shadow)"><rect x="40" y="20" width="250" height="300" rx="40" fill="url(#g-plastic-h)" stroke="#b9c3cc"/>' +
      '<circle cx="165" cy="170" r="88" fill="#cfd8e1"/><circle cx="165" cy="170" r="70" fill="#1b2633"/><circle cx="165" cy="170" r="70" fill="none" stroke="#3b8de0" stroke-width="4" stroke-dasharray="6 10"/>' +
      '<rect x="60" y="40" width="70" height="20" rx="4" fill="#dfe6ed"/><circle cx="270" cy="60" r="6" fill="#47d16b"/>' +
      '<rect x="120" y="226" width="430" height="24" rx="10" fill="#e6ebf0" stroke="#b9c3cc"/><rect x="320" y="250" width="160" height="80" rx="8" fill="#cfd8e1"/>' +
      '<ellipse cx="490" cy="216" rx="20" ry="14" fill="url(#g-skin)"/><path d="M300 222 q90 -24 176 -6 L476 228 L300 228z" fill="url(#g-sheet)"/></g>';
  });

  /* ---------- MRT ---------- */
  def('mri', [600, 380], function () {
    return '<g filter="url(#f-shadow)"><rect x="40" y="10" width="300" height="340" rx="60" fill="url(#g-plastic-h)" stroke="#b9c3cc"/>' +
      '<circle cx="190" cy="180" r="92" fill="#e6ebf0"/><circle cx="190" cy="180" r="66" fill="#d7e5f2"/><circle cx="190" cy="180" r="66" fill="none" stroke="#3b8de0" stroke-width="3"/>' +
      '<text x="120" y="60" font-size="12" fill="#2f6fb0" font-family="system-ui" font-weight="700">3 T</text>' +
      '<rect x="180" y="236" width="400" height="22" rx="10" fill="#e6ebf0" stroke="#b9c3cc"/><rect x="380" y="258" width="150" height="90" rx="8" fill="#cfd8e1"/>' +
      '<path d="M370 228 q90 -20 196 -4 L566 238 L370 238z" fill="url(#g-sheet)"/><ellipse cx="560" cy="226" rx="18" ry="12" fill="url(#g-skin)"/>' +
      '<rect x="520" y="40" width="70" height="44" rx="6" fill="#e0182d" opacity=".12" stroke="#e0182d"/><text x="527" y="66" font-size="10" fill="#c00" font-family="system-ui" font-weight="700">MR!</text></g>';
  });

  /* ---------- Röntgen-Arbeitsplatz (Rasterwandstativ + Deckenstativ) ---------- */
  def('xray', [420, 520], function () {
    return '<g filter="url(#f-shadow)"><rect x="0" y="0" width="420" height="14" fill="#9aa5b1"/>' +
      '<rect x="90" y="14" width="16" height="170" fill="url(#g-metal)"/><rect x="40" y="180" width="120" height="70" rx="10" fill="#dfe6ed" stroke="#9aa6b2"/><rect x="56" y="250" width="88" height="30" rx="4" fill="#5e6874"/>' +
      '<path d="M100 280 L300 220 M100 280 L300 420" stroke="rgba(255,230,120,.35)" stroke-width="2" stroke-dasharray="5 5"/>' +
      '<rect x="330" y="40" width="30" height="470" fill="url(#g-metal)"/><rect x="290" y="190" width="110" height="260" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="304" y="210" width="82" height="220" fill="#e6ebf0" stroke="#c3ccd6" stroke-dasharray="4 3"/><text x="300" y="470" font-size="10" fill="#334" font-family="system-ui">Detektor</text></g>';
  });

  /* ---------- Ultraschallgerät ---------- */
  def('ultrasound', [170, 380], function () {
    return '<g filter="url(#f-shadow)"><rect x="20" y="10" width="130" height="96" rx="8" fill="url(#g-dark)"/><rect x="28" y="18" width="114" height="80" rx="3" fill="#000"/>' +
      '<path d="M85 24 L40 92 Q85 104 130 92 Z" fill="#2b2b2b"/><ellipse cx="85" cy="66" rx="18" ry="11" fill="#0c0c0c"/><path d="M60 80 q25 -10 50 0" stroke="#777" fill="none" stroke-width="3"/>' +
      '<rect x="78" y="106" width="14" height="30" fill="url(#g-metal)"/><rect x="14" y="136" width="142" height="54" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<circle cx="40" cy="162" r="10" fill="#c3ccd6"/><rect x="64" y="148" width="74" height="28" rx="4" fill="#e6ebf0"/>' +
      '<rect x="10" y="150" width="10" height="26" rx="3" fill="#3b4450"/><path d="M15 176 C 0 220, 30 240, 20 280" stroke="#3b4450" fill="none" stroke-width="3"/>' +
      '<rect x="60" y="190" width="50" height="140" fill="#c8d1da"/><path d="M30 340 h110" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(34, 358) + wheel(136, 358) + '</g>';
  });

  /* ---------- Dialysegerät ---------- */
  def('dialysis', [200, 470], function (o) {
    return '<g filter="url(#f-shadow)"><rect x="24" y="10" width="152" height="400" rx="12" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="36" y="22" width="128" height="80" rx="4" fill="url(#g-screen)"/>' +
      (o.live ? '' : '<text x="44" y="42" font-size="9" fill="#9fd3ff" font-family="monospace">Qb  250 ml/min</text><text x="44" y="56" font-size="9" fill="#9fd3ff" font-family="monospace">Qd  500 ml/min</text><text x="44" y="70" font-size="9" fill="#9fd3ff" font-family="monospace">UF  1800 ml</text><text x="44" y="84" font-size="9" fill="#ffd27a" font-family="monospace">PA -120  PV 140</text><text x="44" y="98" font-size="9" fill="#9fffb0" font-family="monospace">TMP 110 mmHg</text>') +
      // Blutpumpe
      '<circle cx="66" cy="140" r="22" fill="#e6ebf0" stroke="#7d8894" stroke-width="2"/><path d="M48 140 a18 18 0 0 1 36 0" stroke="#c33" stroke-width="4" fill="none"/><circle cx="66" cy="140" r="5" fill="#7d8894"/>' +
      '<circle cx="134" cy="140" r="16" fill="#e6ebf0" stroke="#7d8894" stroke-width="2"/><text x="122" y="168" font-size="7" fill="#555" font-family="system-ui">Heparin</text>' +
      // Dialysator
      '<rect x="140" y="180" width="22" height="120" rx="10" fill="rgba(240,248,255,.9)" stroke="#7d8894"/><path d="M145 190 v100 M151 190 v100 M157 190 v100" stroke="#e3a0a0" stroke-width="1.5"/>' +
      '<text x="96" y="246" font-size="8" fill="#555" font-family="system-ui">Dialysator</text>' +
      // Blutschläuche
      '<path d="M66 162 C 66 200, 140 170, 151 182" stroke="#c22" fill="none" stroke-width="3"/><path d="M151 300 C 150 330, 80 320, 72 340" stroke="#c22" fill="none" stroke-width="3"/>' +
      '<rect x="56" y="340" width="30" height="40" rx="8" fill="rgba(255,220,220,.9)" stroke="#c22"/><text x="40" y="396" font-size="7" fill="#555" font-family="system-ui">venöse Kammer</text>' +
      '<path d="M40 418 h120" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(44, 436) + wheel(156, 436) +
      '<rect x="36" y="180" width="40" height="70" rx="6" fill="#dfe6ed"/><text x="38" y="214" font-size="7" fill="#555" font-family="system-ui">Konz.</text></g>';
  });

  /* ---------- Behandlungsstuhl / Dialyseliege ---------- */
  def('dialysis-chair', [320, 260], function () {
    return '<g filter="url(#f-shadow)"><path d="M40 60 q10 -30 40 -30 l20 0 q20 0 20 30 l0 90 l170 0 q20 0 20 20 l0 20 l-280 0 z" fill="#3a7fc1"/>' +
      '<ellipse cx="88" cy="22" rx="20" ry="18" fill="url(#g-skin)"/><path d="M72 14 q16 -16 32 0" fill="#555"/><path d="M70 50 q30 -6 50 30 l0 70 l160 0 q14 0 14 12 l-224 0 z" fill="url(#g-sheet)" opacity=".9"/>' +
      '<rect x="120" y="198" width="20" height="40" fill="#5e6874"/><rect x="60" y="236" width="200" height="14" rx="6" fill="#5e6874"/></g>';
  });

  /* ---------- Inkubator ---------- */
  def('incubator', [320, 360], function () {
    return '<g filter="url(#f-shadow)"><rect x="40" y="200" width="240" height="70" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      textScreen(150, 212, 110, 44, '#9fffb0', ['Luft 34,5 °C', 'Haut 36,8 °C', 'rF 70 %']) +
      '<path d="M40 200 q0 -150 120 -150 q120 0 120 150 z" fill="url(#g-glass)" stroke="#8fb0cc" stroke-width="3"/>' +
      '<circle cx="90" cy="150" r="18" fill="none" stroke="#7d8894" stroke-width="4"/><circle cx="230" cy="150" r="18" fill="none" stroke="#7d8894" stroke-width="4"/>' +
      '<rect x="70" y="184" width="180" height="14" rx="6" fill="#e6f0f8"/><ellipse cx="128" cy="176" rx="14" ry="12" fill="url(#g-skin)"/><path d="M138 182 q30 -14 60 -4 l0 10 l-60 0 z" fill="#f7d6e6"/>' +
      '<rect x="150" y="270" width="20" height="60" fill="url(#g-metal)"/><path d="M70 330 h180" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(74, 348) + wheel(246, 348) + '</g>';
  });

  /* ---------- Wärmebett / Reanimationseinheit ---------- */
  def('warmer', [300, 420], function () {
    return '<g filter="url(#f-shadow)"><rect x="140" y="20" width="18" height="320" fill="url(#g-metal)"/>' +
      '<rect x="60" y="10" width="180" height="40" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="74" y="44" width="152" height="10" fill="#ff8a3d" opacity=".9"/>' +
      '<path d="M80 54 L50 230 M220 54 L250 230" stroke="rgba(255,140,60,.25)" stroke-width="16"/>' +
      '<rect x="40" y="230" width="220" height="40" rx="8" fill="#e6ebf0" stroke="#b9c3cc"/><rect x="40" y="214" width="220" height="18" rx="4" fill="rgba(220,235,250,.6)" stroke="#9fb3c8"/>' +
      '<ellipse cx="100" cy="222" rx="12" ry="10" fill="url(#g-skin)"/><path d="M110 226 q30 -10 60 -2 l0 6 l-60 0z" fill="#fff"/>' +
      textScreen(168, 120, 90, 50, '#ffd27a', ['Haut 36,6', 'Heizl. 35 %', 'APGAR-Uhr']) +
      '<path d="M60 340 h180" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(64, 360) + wheel(236, 360) + '</g>';
  });

  /* ---------- Phototherapie-Lampe ---------- */
  def('phototherapy', [160, 360], function () {
    return '<g filter="url(#f-shadow)"><rect x="10" y="10" width="140" height="36" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="20" y="40" width="120" height="10" rx="4" fill="#4d7cff"/>' +
      '<path d="M30 50 L10 200 M130 50 L150 200" stroke="rgba(80,120,255,.25)" stroke-width="20"/>' +
      '<rect x="72" y="46" width="16" height="260" fill="url(#g-metal)"/><path d="M30 310 h100" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(32, 328) + wheel(128, 328) + '</g>';
  });

  /* ---------- Neonatales Beatmungs-/CPAP-Gerät ---------- */
  def('neo-vent', [150, 330], function () {
    return '<g filter="url(#f-shadow)"><rect x="12" y="10" width="126" height="90" rx="8" fill="url(#g-dark)"/><rect x="18" y="16" width="114" height="74" rx="3" fill="url(#g-screen)"/>' +
      '<path d="M22 50 h8 l4 -18 h16 l4 18 h16 l4 -18 h16 l4 18 h14" stroke="#ffd84a" fill="none" stroke-width="1.4"/><text x="22" y="82" font-size="9" fill="#9fd3ff" font-family="monospace">CPAP 6 FiO2 .30</text>' +
      '<rect x="20" y="104" width="110" height="120" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/><circle cx="50" cy="150" r="10" fill="#dfe6ed" stroke="#7d8894"/><circle cx="100" cy="150" r="10" fill="#dfe6ed" stroke="#7d8894"/>' +
      '<rect x="36" y="180" width="80" height="36" rx="6" fill="rgba(140,200,255,.5)" stroke="#8fb0cc"/>' +
      '<rect x="68" y="224" width="14" height="70" fill="url(#g-metal)"/><path d="M26 300 h98" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(28, 318) + wheel(122, 318) + '</g>';
  });

  /* ---------- Labor: Analysator ---------- */
  def('analyzer', [420, 300], function (o) {
    return '<g filter="url(#f-shadow)"><rect x="10" y="40" width="400" height="230" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="20" y="10" width="160" height="40" rx="6" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="30" y="18" width="70" height="24" rx="3" fill="url(#g-glass)"/>' +
      '<rect x="30" y="70" width="230" height="120" rx="8" fill="url(#g-glass)" stroke="#8fb0cc"/>' +
      Array.apply(null, Array(10)).map(function (_, i) { return '<rect x="' + (44 + i * 21) + '" y="140" width="10" height="36" rx="4" fill="' + ['#d33', '#7a3', '#c9c', '#36c', '#d33'][i % 5] + '"/><rect x="' + (44 + i * 21) + '" y="150" width="10" height="26" rx="4" fill="rgba(255,240,200,.9)"/>'; }).join('') +
      textScreen(280, 70, 116, 80, '#9fd3ff', [o.title || 'Klin. Chemie', 'Na+  139', 'K+   4,2', 'Krea 0,9', 'CRP  12']) +
      '<rect x="280" y="160" width="116" height="30" rx="4" fill="#dfe6ed"/><circle cx="300" cy="175" r="7" fill="#47d16b"/>' +
      '<rect x="20" y="210" width="380" height="50" rx="6" fill="#e6ebf0"/><path d="M30 235 h360" stroke="#c3ccd6" stroke-width="12" stroke-linecap="round"/></g>';
  });

  /* ---------- Labor: Zentrifuge ---------- */
  def('centrifuge', [180, 150], function () {
    return '<g filter="url(#f-shadow)"><rect x="10" y="40" width="160" height="100" rx="12" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<ellipse cx="90" cy="42" rx="74" ry="20" fill="#dfe6ed" stroke="#b9c3cc"/><ellipse cx="90" cy="40" rx="50" ry="12" fill="url(#g-glass)" stroke="#8fb0cc"/>' +
      textScreen(26, 76, 70, 30, '#9fffb0', ['3000 g', '10 min']) + '<circle cx="132" cy="92" r="12" fill="#3b8de0"/></g>';
  });

  /* ---------- Mikroskop ---------- */
  def('microscope', [140, 200], function () {
    return '<g filter="url(#f-shadow)"><rect x="20" y="170" width="100" height="22" rx="6" fill="#2f3842"/><path d="M90 170 C 110 120, 110 80, 80 40" stroke="#3c4855" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<rect x="30" y="120" width="70" height="10" rx="3" fill="#5e6874"/><rect x="50" y="94" width="14" height="28" fill="#9aa5b1"/>' +
      '<rect x="44" y="20" width="26" height="74" rx="6" fill="#dfe6ed" stroke="#9aa6b2" transform="rotate(-20 57 57)"/><circle cx="60" cy="150" r="10" fill="#fffbe0"/></g>';
  });

  /* ---------- Kühlschrank (Blutdepot/Reagenzien) ---------- */
  def('fridge', [160, 360], function () {
    return '<g filter="url(#f-shadow)"><rect x="10" y="10" width="140" height="340" rx="8" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="22" y="40" width="116" height="280" rx="4" fill="url(#g-glass)" stroke="#8fb0cc"/>' +
      [0, 1, 2, 3].map(function (i) { return '<path d="M24 ' + (100 + i * 60) + ' h112" stroke="#b9c3cc" stroke-width="3"/>' + [0, 1, 2, 3].map(function (k) { return '<rect x="' + (30 + k * 26) + '" y="' + (70 + i * 60) + '" width="18" height="28" rx="3" fill="#b82c2c" opacity=".85"/>'; }).join(''); }).join('') +
      textScreen(22, 16, 70, 18, '#9fffb0', ['+4,1 °C']) + '</g>';
  });

  /* ---------- Rohrpost ---------- */
  def('tube-station', [110, 260], function () {
    return '<g filter="url(#f-soft)"><rect x="40" y="0" width="30" height="80" fill="url(#g-metal)"/><rect x="10" y="80" width="90" height="140" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="24" y="96" width="62" height="40" rx="18" fill="#2c6fb3"/><rect x="24" y="150" width="62" height="20" rx="3" fill="url(#g-screen)"/><text x="28" y="164" font-size="8" fill="#9fd3ff" font-family="monospace">Ziel: LAB</text>' +
      '<rect x="40" y="220" width="30" height="40" fill="url(#g-metal)"/></g>';
  });

  /* ---------- Angiographie-Anlage (Herzkatheterlabor) ---------- */
  def('angio', [640, 520], function () {
    return '<g filter="url(#f-shadow)"><rect x="0" y="0" width="640" height="18" fill="#9aa5b1"/><rect x="380" y="18" width="40" height="80" fill="url(#g-metal)"/>' +
      '<path d="M400 98 C 220 120, 220 420, 400 420" stroke="#e8edf2" stroke-width="40" fill="none"/><path d="M400 98 C 220 120, 220 420, 400 420" stroke="#c3ccd6" stroke-width="2" fill="none"/>' +
      '<rect x="340" y="90" width="120" height="60" rx="10" fill="#dfe6ed" stroke="#9aa6b2"/><text x="354" y="124" font-size="10" fill="#334" font-family="system-ui">Flachdetektor</text>' +
      '<rect x="350" y="390" width="100" height="56" rx="10" fill="#5e6874"/><text x="370" y="422" font-size="10" fill="#fff" font-family="system-ui">Röhre</text>' +
      '<rect x="80" y="300" width="560" height="22" rx="8" fill="#2f3842"/><rect x="80" y="290" width="560" height="12" rx="6" fill="#3c4855"/>' +
      '<rect x="160" y="322" width="80" height="120" fill="#7d8894"/><rect x="120" y="440" width="160" height="20" rx="6" fill="#5e6874"/>' +
      '<ellipse cx="600" cy="276" rx="22" ry="17" fill="url(#g-skin)"/><path d="M200 286 q200 -26 380 -6 L580 292 L200 292z" fill="#3d8f8a"/>' +
      '<rect x="20" y="40" width="100" height="160" rx="6" fill="rgba(200,220,240,.35)" stroke="#9fb3c8"/><text x="28" y="60" font-size="9" fill="#334" font-family="system-ui">Strahlenschutz</text></g>';
  });

  /* ---------- Großbild-Monitorampel (Herzkatheter / OP) ---------- */
  def('display-wall', [360, 230], function () {
    return '<g filter="url(#f-shadow)"><rect x="170" y="0" width="20" height="30" fill="url(#g-metal)"/><rect x="0" y="26" width="360" height="200" rx="10" fill="url(#g-dark)"/>' +
      '<rect x="10" y="36" width="168" height="88" fill="#111"/><path d="M40 60 C 70 70, 60 100, 90 110 M90 110 C 110 90, 140 100, 150 80 M70 80 C 80 90, 100 70, 120 90" stroke="#ddd" stroke-width="3" fill="none"/>' +
      '<rect x="182" y="36" width="168" height="88" fill="#111"/><path d="M200 70 C 230 80, 220 100, 260 110 M240 60 C 270 70, 290 100, 320 96" stroke="#bbb" stroke-width="3" fill="none"/>' +
      screenWaves(10, 128, 168, 90, 3) + textScreen(182, 128, 168, 90, '#9fd3ff', ['AO  128/76 (92)', 'LV  130/12', 'HF 72  SpO2 98', 'ACT 280 s', 'Dosis 412 mGy']) + '</g>';
  });

  /* ---------- Hochdruck-Kontrastmittelinjektor ---------- */
  def('injector', [130, 320], function () {
    return '<g filter="url(#f-shadow)"><rect x="20" y="10" width="90" height="70" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      '<rect x="30" y="18" width="30" height="54" rx="8" fill="url(#g-glass)" stroke="#8fb0cc"/><rect x="32" y="40" width="26" height="30" rx="6" fill="rgba(255,250,200,.95)"/>' +
      '<rect x="70" y="18" width="30" height="54" rx="8" fill="url(#g-glass)" stroke="#8fb0cc"/><rect x="72" y="30" width="26" height="40" rx="6" fill="rgba(220,240,255,.95)"/>' +
      '<rect x="58" y="80" width="14" height="190" fill="url(#g-metal)"/><rect x="10" y="120" width="60" height="44" rx="6" fill="url(#g-dark)"/>' + textScreen(16, 126, 48, 32, '#9fffb0', ['8 ml/s', '40 ml']) +
      '<path d="M20 280 h90" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(22, 298) + wheel(108, 298) + '</g>';
  });

  /* ---------- Intraaortale Ballonpumpe / Kreislaufunterstützung ---------- */
  def('iabp', [170, 360], function () {
    return '<g filter="url(#f-shadow)"><rect x="16" y="10" width="138" height="90" rx="8" fill="url(#g-dark)"/>' +
      '<rect x="22" y="16" width="126" height="78" rx="3" fill="url(#g-screen)"/><path d="M26 40 h10 l3 -12 l3 18 l3 -6 h22 l3 -12 l3 18 l3 -6 h22" stroke="#3cff7a" fill="none" stroke-width="1.4"/>' +
      '<path d="M26 80 q10 -26 20 -6 q10 -20 20 0 q10 -26 20 -6 q10 -20 20 0" stroke="#ff4d5e" fill="none" stroke-width="1.4"/>' +
      '<rect x="20" y="104" width="130" height="190" rx="10" fill="url(#g-plastic)" stroke="#b9c3cc"/><rect x="34" y="120" width="40" height="80" rx="6" fill="#dfe6ed"/><text x="36" y="216" font-size="8" fill="#555" font-family="system-ui">Helium</text>' +
      '<circle cx="112" cy="150" r="20" fill="#e6ebf0" stroke="#7d8894" stroke-width="2"/><text x="96" y="186" font-size="8" fill="#555" font-family="system-ui">1:1 Trigger</text>' +
      '<path d="M30 300 h110" stroke="#5e6874" stroke-width="10" stroke-linecap="round"/>' + wheel(34, 320) + wheel(136, 320) + '</g>';
  });

  /* ---------- Generisches Gerät ---------- */
  def('generic', [160, 160], function (o) {
    return '<g filter="url(#f-shadow)"><rect x="10" y="10" width="140" height="140" rx="14" fill="url(#g-plastic)" stroke="#b9c3cc"/>' +
      textScreen(24, 24, 112, 50, '#9fd3ff', [o.short || 'Gerät']) +
      '<circle cx="44" cy="110" r="14" fill="#dfe6ed" stroke="#9aa6b2"/><rect x="74" y="98" width="62" height="24" rx="6" fill="#3b8de0"/></g>';
  });

  /* ---------- Schrank/Theke ---------- */
  def('counter', [500, 200], function () {
    return '<g><rect x="0" y="40" width="500" height="160" fill="#e6ebf0" stroke="#c3ccd6"/><rect x="0" y="28" width="500" height="16" rx="3" fill="#b9c3cc"/>' +
      [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (10 + i * 98) + '" y="54" width="88" height="136" rx="4" fill="#f4f6f8" stroke="#cfd7e0"/><rect x="' + (44 + i * 98) + '" y="66" width="20" height="5" rx="2" fill="#9aa5b1"/>'; }).join('') + '</g>';
  });

  /* ---------- Bedienpult (Radiologie/Kontrollraum) ---------- */
  def('console', [300, 220], function () {
    return '<g filter="url(#f-shadow)"><rect x="0" y="140" width="300" height="20" rx="4" fill="#b9c3cc"/><rect x="10" y="160" width="280" height="60" fill="#dfe6ed"/>' +
      '<rect x="10" y="20" width="130" height="100" rx="6" fill="url(#g-dark)"/><rect x="16" y="26" width="118" height="88" fill="#000"/><circle cx="75" cy="70" r="36" fill="#555"/><circle cx="75" cy="70" r="30" fill="#8a8a8a"/><ellipse cx="62" cy="66" rx="10" ry="16" fill="#222"/><ellipse cx="88" cy="66" rx="10" ry="16" fill="#222"/><circle cx="75" cy="88" r="6" fill="#ddd"/>' +
      '<rect x="160" y="20" width="130" height="100" rx="6" fill="url(#g-dark)"/>' + textScreen(166, 26, 118, 88, '#9fd3ff', ['Protokoll: Thorax', 'kV 120  mAs 80', 'CTDIvol 6,1 mGy', 'DLP 210 mGy·cm']) +
      '<rect x="40" y="124" width="220" height="14" rx="3" fill="#2e3742"/></g>';
  });
})();
