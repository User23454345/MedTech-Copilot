/* =====================================================================
   Simulation: Bildgebung
   - Röntgen: Schwächungsgesetz I = I0·e^(−Σμx), kV-/mAs-Einfluss, Rauschen
   - CT: Hounsfield-Skala, Fensterung (Window/Level)
   - MRT: T1/T2/PD-Kontrast über TR und TE
   Alle Bilder sind synthetische Phantome (keine Patientendaten).
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  function inEll(x, y, cx, cy, a, b) { var dx = (x - cx) / a, dy = (y - cy) / b; return dx * dx + dy * dy <= 1; }
  function chord(x, y, cx, cy, a, b) { var dx = (x - cx) / a, dy = (y - cy) / b; var r = 1 - dx * dx - dy * dy; return r > 0 ? Math.sqrt(r) : 0; }
  function gaussRand() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  // CT-Phantom (Thorax/Oberbauch, Hounsfield-Einheiten)
  function ctHU(x, y) { // x,y in [-1,1]
    if (!inEll(x, y, 0, 0.05, 0.92, 0.68)) return -1000; // Luft
    var hu = -90; // subkutanes Fett
    if (inEll(x, y, 0, 0.05, 0.84, 0.6)) hu = 45; // Muskel/Weichteil
    if (inEll(x, y, -0.42, -0.02, 0.3, 0.42) || inEll(x, y, 0.42, -0.02, 0.3, 0.42)) {
      hu = -850; // Lunge
      if (Math.abs(Math.sin(x * 40) * Math.cos(y * 33)) > 0.97) hu = -300; // Gefäße
    }
    if (inEll(x, y, 0.08, 0.08, 0.26, 0.24)) hu = 40; // Herz
    if (inEll(x, y, 0.1, 0.06, 0.1, 0.1)) hu = 220; // KM-gefülltes Gefäß/Herzhöhle
    if (inEll(x, y, -0.05, -0.12, 0.06, 0.06)) hu = 200; // Aorta mit Kontrastmittel
    if (inEll(x, y, 0, 0.5, 0.11, 0.1)) hu = 700; // Wirbelkörper
    if (inEll(x, y, 0, 0.5, 0.07, 0.065)) hu = 250; // Spongiosa
    if (inEll(x, y, 0, -0.55, 0.12, 0.04)) hu = 900; // Sternum
    // Rippen
    [[-0.78, 0.15], [0.78, 0.15], [-0.7, -0.3], [0.7, -0.3], [-0.6, 0.45], [0.6, 0.45]].forEach(function (r) { if (inEll(x, y, r[0], r[1], 0.05, 0.035)) hu = 1000; });
    if (inEll(x, y, -0.3, 0.42, 0.06, 0.05)) hu = 12; // Flüssigkeit (Pleuraerguss angedeutet)
    return hu;
  }

  // MRT-Gewebeparameter bei 1,5 T (gerundete Lehrwerte)
  var TISSUE = {
    wm: { name: 'Weiße Substanz', t1: 600, t2: 80, pd: 0.7 },
    gm: { name: 'Graue Substanz', t1: 950, t2: 100, pd: 0.8 },
    csf: { name: 'Liquor', t1: 4000, t2: 2000, pd: 1.0 },
    fat: { name: 'Fett', t1: 260, t2: 80, pd: 0.9 }
  };
  function mriTissue(x, y) {
    if (!inEll(x, y, 0, 0, 0.8, 0.92)) return null;
    if (!inEll(x, y, 0, 0, 0.74, 0.86)) return 'fat';
    if (!inEll(x, y, 0, 0, 0.69, 0.81)) return 'bone';
    if (!inEll(x, y, 0, 0, 0.65, 0.77)) return 'csf';
    var gyri = 0.05 * Math.sin(Math.atan2(y, x) * 18);
    if (!inEll(x, y, 0, 0, 0.56 + gyri, 0.68 + gyri)) return 'gm';
    if (inEll(x, y, -0.13, -0.08, 0.06, 0.24) || inEll(x, y, 0.13, -0.08, 0.06, 0.24)) return 'csf';
    if (inEll(x, y, -0.3, 0.05, 0.08, 0.14) || inEll(x, y, 0.3, 0.05, 0.08, 0.14)) return 'gm'; // Basalganglien
    return 'wm';
  }

  MT.registerSim({
    id: 'imaging',
    title: 'Bildgebung',
    subtitle: 'Röntgen, CT-Fensterung, MRT-Kontrast',
    icon: '🩻',
    devices: ['xray-system', 'ct-scanner', 'mri-scanner', 'c-arm', 'angio-system'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var wrapV = MT.el('div', { style: 'display:flex;justify-content:center;background:#000' });
      L.view.appendChild(wrapV);
      var cv = MT.el('canvas', { width: 256, height: 256, style: 'width:min(100%,520px);aspect-ratio:1;image-rendering:auto;display:block' });
      wrapV.appendChild(cv);
      var bar = MT.el('canvas', { style: 'width:100%;height:46px;display:block' });
      L.view.appendChild(bar);
      var hover = MT.el('div', { style: 'position:absolute;top:8px;left:10px;color:#9fd3ff;font:600 12px system-ui;text-shadow:0 1px 2px #000' });
      L.view.appendChild(hover);
      var s = { mode: 'xray', kv: 80, mas: 5, ww: 400, wl: 40, tr: 500, te: 15 };
      var C = L.controls, U = MT.labUI;
      var groups = {};
      U.seg(C, { label: 'Verfahren', value: 'xray', options: [['xray', 'Röntgen'], ['ct', 'CT'], ['mri', 'MRT']], onChange: function (v) { s.mode = v; showGroup(); render(); } });
      function group(id) { var g = MT.el('div', { class: 'controls' }); C.appendChild(g); groups[id] = g; return g; }
      var gx = group('xray');
      U.slider(gx, { label: 'Röhrenspannung', min: 50, max: 150, value: 80, unit: 'kV', onInput: function (v) { s.kv = v; render(); }, hint: 'Härte der Strahlung → Kontrast' });
      U.slider(gx, { label: 'Röhrenstrom × Zeit', min: 0.5, max: 20, step: 0.5, value: 5, dec: 1, unit: 'mAs', onInput: function (v) { s.mas = v; render(); }, hint: 'Anzahl der Photonen → Rauschen und Dosis' });
      var gc = group('ct');
      var wwS = U.slider(gc, { label: 'Fensterbreite (W)', min: 50, max: 2500, step: 10, value: 400, unit: 'HU', onInput: function (v) { s.ww = v; render(); } });
      var wlS = U.slider(gc, { label: 'Fensterlage (L)', min: -1000, max: 1000, step: 10, value: 40, unit: 'HU', onInput: function (v) { s.wl = v; render(); } });
      var prow = MT.el('div', { class: 'row' }); gc.appendChild(prow);
      [['Weichteil', 400, 40], ['Lunge', 1500, -600], ['Knochen', 2000, 400], ['Mediastinum', 350, 50]].forEach(function (pr) { U.button(prow, pr[0], 'small', function () { s.ww = pr[1]; s.wl = pr[2]; wwS.set(pr[1]); wlS.set(pr[2]); render(); }); });
      var gm = group('mri');
      var trS = U.slider(gm, { label: 'Repetitionszeit TR', min: 100, max: 5000, step: 50, value: 500, unit: 'ms', onInput: function (v) { s.tr = v; render(); } });
      var teS = U.slider(gm, { label: 'Echozeit TE', min: 5, max: 200, step: 1, value: 15, unit: 'ms', onInput: function (v) { s.te = v; render(); } });
      var mrow = MT.el('div', { class: 'row' }); gm.appendChild(mrow);
      [['T1-gewichtet', 500, 15], ['T2-gewichtet', 4000, 100], ['PD-gewichtet', 3000, 15]].forEach(function (pr) { U.button(mrow, pr[0], 'small', function () { s.tr = pr[1]; s.te = pr[2]; trS.set(pr[1]); teS.set(pr[2]); render(); }); });
      var explain = MT.el('div', { class: 'callout' }); C.appendChild(explain);

      function showGroup() { Object.keys(groups).forEach(function (k) { groups[k].style.display = k === s.mode ? '' : 'none'; }); }
      showGroup();
      var upd;

      var THEORY = {
        xray: '<h3>Projektionsradiographie</h3><p>Röntgenstrahlung entsteht in der Röhre durch Abbremsen von Elektronen an der Anode (Bremsstrahlung + charakteristische Strahlung). Beim Durchgang durch den Körper wird sie geschwächt:</p><div class="formula">I = I₀ · e<sup>−Σ μᵢ · xᵢ</sup></div><p>Der Schwächungskoeffizient μ hängt von Dichte, Ordnungszahl und Photonenenergie ab. Knochen (Calcium, hohe Ordnungszahl) schwächt durch den Photoeffekt stark – dieser nimmt mit steigender Energie stark ab. Deshalb: <b>höhere kV → geringerer Knochen-Weichteil-Kontrast</b>, aber mehr Durchdringung. Die <b>mAs</b> bestimmen die Photonenzahl: mehr mAs → weniger Quantenrauschen (SNR ∝ √N), aber proportional mehr Dosis.</p><div class="callout warn">☢️ Strahlenschutz (StrlSchG): Rechtfertigung, Optimierung (ALARA), Abstand – Abschirmung – Aufenthaltsdauer; diagnostische Referenzwerte beachten.</div>',
        ct: '<h3>Computertomographie</h3><p>Eine rotierende Röhre und ein gegenüberliegender Detektorkranz messen Schwächungsprofile aus vielen Winkeln; die Bildrekonstruktion (z. B. gefilterte Rückprojektion oder iterative Verfahren) berechnet daraus für jedes Voxel den Schwächungswert in <b>Hounsfield-Einheiten</b>:</p><div class="formula">HU = 1000 · (μ − μ<sub>Wasser</sub>) / (μ<sub>Wasser</sub> − μ<sub>Luft</sub>) &nbsp;→ Luft −1000, Wasser 0, Knochen bis > +1000</div><p>Das Auge unterscheidet nur ca. 40–100 Graustufen. Die <b>Fensterung</b> bildet deshalb nur einen HU-Bereich (Lage L ± Breite W/2) auf Schwarz–Weiß ab. Lungenfenster: breit und tief; Knochenfenster: breit und hoch; Weichteilfenster: eng um Weichteilwerte.</p><p>Fahre mit der Maus über das Bild, um HU-Werte zu messen.</p>',
        mri: '<h3>Magnetresonanztomographie</h3><p>Im starken Magnetfeld (z. B. 1,5 oder 3 Tesla) richten sich Wasserstoffkerne aus. Ein Hochfrequenzpuls lenkt sie aus; beim Zurückkehren senden sie ein Signal. Gewebe unterscheiden sich in Protonendichte (PD), <b>T1</b> (Längsrelaxation) und <b>T2</b> (Querrelaxation). Für eine Spin-Echo-Sequenz gilt näherungsweise:</p><div class="formula">S ∝ PD · (1 − e<sup>−TR/T1</sup>) · e<sup>−TE/T2</sup></div><p><b>Kurze TR + kurze TE → T1-Wichtung</b> (Fett hell, Liquor dunkel). <b>Lange TR + lange TE → T2-Wichtung</b> (Liquor hell). Lange TR + kurze TE → PD-Wichtung.</p><div class="callout warn">🧲 MR-Sicherheit: Das Magnetfeld ist immer an! Ferromagnetische Gegenstände werden zu Geschossen; Implantate und Schrittmacher nur nach Prüfung (MR-sicher/-bedingt); Quench-Gefahr, Lärmschutz, HF-Erwärmung.</div>'
      };

      var img = cv.getContext('2d').createImageData(256, 256);
      var huMap = new Float32Array(256 * 256);
      function render() {
        L.theory.innerHTML = THEORY[s.mode];
        var d = img.data, N = 256;
        var lo, hi;
        if (s.mode === 'xray') {
          var k = 70 / s.kv;
          var muS = 0.2 * Math.pow(k, 0.5), muB = 0.48 * Math.pow(k, 1.6), muL = 0.06 * Math.pow(k, 0.5);
          var photons = s.mas * 400; // relative Photonenzahl pro Pixel bei I0
          var vals = new Float32Array(N * N);
          for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
            var x = i / N * 2 - 1, y = j / N * 2 - 1;
            var body = 26 * chord(x, y, 0, 0.05, 0.86, 1.1);
            var lung = 16 * (chord(x, y, -0.4, -0.05, 0.3, 0.62) + chord(x, y, 0.4, -0.05, 0.3, 0.62));
            var heart = 12 * chord(x, y, 0.12, 0.22, 0.3, 0.26);
            lung = Math.max(0, lung - heart);
            var bone = 0;
            if (Math.abs(x) < 0.07 && y > -0.85) bone += 3.5; // Wirbelsäule
            for (var r = 0; r < 8; r++) { var ry = -0.62 + r * 0.17 + 0.25 * x * x; if (Math.abs(y - ry) < 0.025 && Math.abs(x) < 0.8 && Math.abs(x) > 0.05) bone += 1.1; }
            if (Math.abs(y - (-0.78 + 0.15 * Math.abs(x))) < 0.03 && Math.abs(x) < 0.6) bone += 1.4; // Schlüsselbeine
            if (Math.abs(x) > 0.86 && Math.abs(x) < 0.95 && y < 0) bone += 2; // Oberarme
            var att = muS * Math.max(0, body - lung - bone) + muL * lung + muB * bone;
            var I = Math.exp(-att);
            var n = photons * I;
            var meas = n > 0 ? (n + Math.sqrt(n) * gaussRand()) / photons : 0;
            vals[j * N + i] = -Math.log(Math.max(1e-6, meas));
          }
          lo = 0; hi = muS * 26 * 1.1 + muB * 2;
          for (var q = 0; q < N * N; q++) { var g = MT.clamp((vals[q] - lo) / (hi - lo), 0, 1); g = Math.pow(g, 0.8) * 255; d[q * 4] = d[q * 4 + 1] = d[q * 4 + 2] = g; d[q * 4 + 3] = 255; }
          var dose = s.mas * Math.pow(s.kv / 80, 2) * 0.02;
          var contrast = (Math.exp(-muS * 4) - Math.exp(-muB * 4)) / Math.exp(-muS * 4);
          ensureReadouts([{ key: 'dose', label: 'Rel. Dosis', unit: 'a.u.' }, { key: 'snr', label: 'SNR (rel.)', unit: '' }, { key: 'con', label: 'Knochenkontrast', unit: '%' }, { key: 'mub', label: 'μ Knochen/Weichteil', unit: '' }]);
          upd({ dose: MT.fmt(dose, 2), snr: { v: MT.fmt(Math.sqrt(s.mas * 400 * 0.05), 0), state: s.mas < 2 ? 'warn' : '' }, con: MT.fmt(contrast * 100, 0), mub: MT.fmt(muB / muS, 1) });
          explain.innerHTML = 'Thorax-Phantom (p.a.). Vergleiche 60 kV und 125 kV: Bei hoher Spannung werden Rippen „durchsichtiger“ – typisch für Thoraxaufnahmen in Hartstrahltechnik, um die Lunge hinter den Rippen besser zu beurteilen.';
          drawBar(0, 1, 'Detektorsignal (logarithmiert, weiß = hohe Schwächung)');
        } else if (s.mode === 'ct') {
          lo = s.wl - s.ww / 2; hi = s.wl + s.ww / 2;
          for (var j2 = 0; j2 < N; j2++) for (var i2 = 0; i2 < N; i2++) {
            var hu = ctHU(i2 / N * 2 - 1, j2 / N * 2 - 1) + gaussRand() * 12;
            huMap[j2 * N + i2] = hu;
            var gg = MT.clamp((hu - lo) / (hi - lo), 0, 1) * 255, p4 = (j2 * N + i2) * 4;
            d[p4] = d[p4 + 1] = d[p4 + 2] = gg; d[p4 + 3] = 255;
          }
          ensureReadouts([{ key: 'win', label: 'Fenster', unit: 'HU' }, { key: 'lo', label: 'Schwarz ab', unit: 'HU' }, { key: 'hi', label: 'Weiß ab', unit: 'HU' }, { key: 'gray', label: 'HU pro Graustufe', unit: '' }]);
          upd({ win: 'W ' + s.ww + ' / L ' + s.wl, lo: Math.round(lo), hi: Math.round(hi), gray: MT.fmt(s.ww / 256, 1) });
          explain.innerHTML = 'Thorax-CT-Phantom (axial) mit Kontrastmittel in Aorta und Herz. Probiere die Fenster-Voreinstellungen: Im Lungenfenster erkennst du Gefäße in der Lunge, im Weichteilfenster das Mediastinum, im Knochenfenster die Struktur der Wirbel.';
          drawBar(-1000, 1500, 'Hounsfield-Skala · sichtbares Fenster');
        } else {
          var sig = {};
          Object.keys(TISSUE).forEach(function (k2) { var t = TISSUE[k2]; sig[k2] = t.pd * (1 - Math.exp(-s.tr / t.t1)) * Math.exp(-s.te / t.t2); });
          var maxS = Math.max(sig.wm, sig.gm, sig.csf, sig.fat);
          for (var j3 = 0; j3 < N; j3++) for (var i3 = 0; i3 < N; i3++) {
            var tt = mriTissue(i3 / N * 2 - 1, j3 / N * 2 - 1);
            var v = tt && sig[tt] != null ? sig[tt] / maxS : 0;
            v = MT.clamp(v + gaussRand() * 0.02, 0, 1) * 255;
            var p5 = (j3 * N + i3) * 4; d[p5] = d[p5 + 1] = d[p5 + 2] = v; d[p5 + 3] = 255;
          }
          ensureReadouts(Object.keys(TISSUE).map(function (k3) { return { key: k3, label: TISSUE[k3].name, unit: '' }; }).concat([{ key: 'w', label: 'Wichtung', unit: '' }]));
          var w = s.tr < 1000 && s.te < 30 ? 'T1' : s.tr > 2000 && s.te > 60 ? 'T2' : s.tr > 2000 && s.te < 30 ? 'PD' : 'gemischt';
          var o = { w: w };
          Object.keys(TISSUE).forEach(function (k4) { o[k4] = MT.fmt(sig[k4] / maxS * 100, 0) + ' %'; });
          upd(o);
          explain.innerHTML = 'Schädel-Phantom (axial). T1: Fett hell, weiße Substanz heller als graue, Liquor dunkel. T2: Liquor hell. Der Knochen (Kalotte) liefert kaum Signal (wenige mobile Protonen).';
          drawBar(0, 1, 'Signalintensität');
        }
        cv.getContext('2d').putImageData(img, 0, 0);
      }
      var currentDefs = null;
      function ensureReadouts(defs) {
        var key = defs.map(function (x) { return x.key; }).join();
        if (currentDefs !== key) { currentDefs = key; upd = U.readouts(L.readouts, defs); }
      }
      function drawBar(min, max, label) {
        var S = MT.setupCanvas(bar), ctx = S.ctx, W = S.w, H = S.h;
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#9fb3c8'; ctx.font = '600 11px system-ui'; ctx.textBaseline = 'top'; ctx.fillText(label, 8, 4);
        var x0 = 8, w = W - 16, y = 20, h = 12;
        if (s.mode === 'ct') {
          var lo = s.wl - s.ww / 2, hi = s.wl + s.ww / 2;
          for (var x = 0; x < w; x++) { var hu = min + (max - min) * x / w; var g = Math.round(MT.clamp((hu - lo) / (hi - lo), 0, 1) * 255); ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; ctx.fillRect(x0 + x, y, 1, h); }
          [['Luft', -1000], ['Lunge', -850], ['Fett', -90], ['Wasser', 0], ['KM', 200], ['Knochen', 1000]].forEach(function (m) { var xx = x0 + w * (m[1] - min) / (max - min); ctx.fillStyle = '#ffd84a'; ctx.fillRect(xx, y + h, 1, 4); ctx.font = '10px system-ui'; ctx.fillText(m[0], Math.min(xx + 2, W - 50), y + h + 1); });
        } else {
          var gr = ctx.createLinearGradient(x0, 0, x0 + w, 0); gr.addColorStop(0, '#000'); gr.addColorStop(1, '#fff'); ctx.fillStyle = gr; ctx.fillRect(x0, y, w, h);
        }
      }
      cv.addEventListener('mousemove', function (e) {
        if (s.mode !== 'ct') { hover.textContent = ''; return; }
        var r = cv.getBoundingClientRect();
        var i = Math.floor((e.clientX - r.left) / r.width * 256), j = Math.floor((e.clientY - r.top) / r.height * 256);
        hover.textContent = 'HU: ' + Math.round(huMap[j * 256 + i] || 0);
      });
      cv.addEventListener('mouseleave', function () { hover.textContent = ''; });
      L.view.style.position = 'relative';
      render();
    }
  });
})();
