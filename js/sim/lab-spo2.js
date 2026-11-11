/* =====================================================================
   Simulation: Sauerstoffsättigung & Pulsoximetrie
   Severinghaus-O2-Bindungskurve mit Bohr-/Temperatureffekt,
   Ratio-of-Ratios-Prinzip, Fehlerquellen (CO-Hb, Perfusion, Bewegung)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  MT.registerSim({
    id: 'spo2',
    title: 'Sauerstoffsättigung',
    subtitle: 'O₂-Bindungskurve, Pulsoximetrie',
    icon: '🩸',
    devices: ['monitor', 'spot-monitor', 'bga'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var cv = MT.labUI.canvas(L.view, '16 / 8');
      var cv2 = MT.labUI.canvas(L.view, '16 / 4');
      var s = { po2: 90, ph: 7.4, temp: 37, perf: 1, cohb: 0, motion: false, hb: 14 };
      var C = L.controls, U = MT.labUI;
      U.heading(C, 'Blut');
      var po2S = U.slider(C, { label: 'Arterieller pO₂', min: 10, max: 150, value: s.po2, unit: 'mmHg', onInput: function (v) { s.po2 = v; } });
      U.slider(C, { label: 'pH', min: 7.0, max: 7.7, step: 0.01, value: s.ph, dec: 2, onInput: function (v) { s.ph = v; }, hint: 'Azidose verschiebt die Kurve nach rechts (Bohr-Effekt)' });
      U.slider(C, { label: 'Temperatur', min: 32, max: 42, step: 0.1, value: s.temp, dec: 1, unit: '°C', onInput: function (v) { s.temp = v; } });
      U.slider(C, { label: 'Hämoglobin', min: 6, max: 18, step: 0.5, value: s.hb, dec: 1, unit: 'g/dl', onInput: function (v) { s.hb = v; }, hint: 'Beeinflusst den O₂-Gehalt, nicht die Sättigung' });
      U.heading(C, 'Messbedingungen Pulsoximeter');
      U.slider(C, { label: 'CO-Hämoglobin', min: 0, max: 30, value: 0, unit: '%', onInput: function (v) { s.cohb = v; }, hint: 'z. B. Rauchgasvergiftung' });
      U.slider(C, { label: 'Periphere Perfusion', min: 0.05, max: 1.5, step: 0.05, value: 1, fmt: function (v) { return Math.round(v * 100) + ' %'; }, onInput: function (v) { s.perf = v; } });
      U.check(C, { label: 'Bewegungsartefakt', onChange: function (v) { s.motion = v; } });
      U.heading(C, 'Schnellwahl');
      var row = MT.el('div', { class: 'row' }); C.appendChild(row);
      [['Raumluft gesund', 95], ['Hypoxie', 50], ['Schwere Hypoxie', 30]].forEach(function (q) { U.button(row, q[0], 'small', function () { s.po2 = q[1]; po2S.set(q[1]); calc(); }); });

      var upd = U.readouts(L.readouts, [
        { key: 'sao2', label: 'SaO₂ (BGA)', unit: '%' }, { key: 'spo2', label: 'SpO₂ (Anzeige)', unit: '%' }, { key: 'p50', label: 'P50', unit: 'mmHg' },
        { key: 'r', label: 'Ratio R', unit: '' }, { key: 'pi', label: 'Perfusionsindex', unit: '%' }, { key: 'cao2', label: 'O₂-Gehalt CaO₂', unit: 'ml/dl' }
      ]);

      L.theory.innerHTML = '<h3>Physiologie und Messprinzip</h3>' +
        '<p>Hämoglobin bindet O₂ kooperativ – daher die S-förmige <b>Sauerstoffbindungskurve</b>. Im flachen oberen Teil ändert ein sinkender pO₂ die Sättigung kaum (Sicherheitsreserve); im steilen Teil (pO₂ &lt; 60 mmHg) fällt die Sättigung rasch. Die Kurve wird hier mit der <b>Severinghaus-Gleichung</b> berechnet:</p>' +
        '<div class="formula">SO₂ = 100 / (23 400 / (pO₂³ + 150 · pO₂) + 1)</div>' +
        '<p>Azidose, Fieber, Hyperkapnie und 2,3-BPG verschieben die Kurve nach rechts (P50 ↑, leichtere O₂-Abgabe im Gewebe).</p>' +
        '<p><b>Pulsoximeter</b> senden rotes (660 nm) und infrarotes Licht (940 nm) durch das Gewebe. Oxygeniertes Hb absorbiert mehr Infrarot, desoxygeniertes mehr Rot. Nur der <b>pulsatile</b> Anteil (AC) stammt aus arteriellem Blut; daraus wird das Verhältnis</p>' +
        '<div class="formula">R = (AC<sub>rot</sub>/DC<sub>rot</sub>) / (AC<sub>IR</sub>/DC<sub>IR</sub>) &nbsp;→&nbsp; SpO₂ ≈ 110 − 25 · R (empirische Kalibrierkurve, Näherung)</div>' +
        '<p>berechnet. Der O₂-<b>Gehalt</b> hängt zusätzlich vom Hämoglobin ab: CaO₂ = 1,34 · Hb · SaO₂ + 0,003 · pO₂.</p>' +
        '<div class="callout warn">⚠️ Grenzen: CO-Hb wird von üblichen 2-Wellenlängen-Geräten wie O₂-Hb gewertet → falsch hohe SpO₂. Schlechte Perfusion, Bewegung, Nagellack und starkes Umgebungslicht stören. Die Pulsoximetrie sagt nichts über die Ventilation (CO₂) aus!</div>';

      var t = 0, cur = {};
      function calc() {
        var p50 = MT.physio.p50(s.ph, s.temp);
        var sao2 = MT.physio.so2(s.po2, p50); // Anteil O2Hb an funktionellem Hb
        var o2hbFrac = sao2 * (1 - s.cohb / 100); // fraktionelle Sättigung
        var spo2 = Math.min(100, o2hbFrac + s.cohb * 0.9); // CO-Hb wird ~ als O2Hb gezählt
        var lowSig = s.perf < 0.15 || s.motion;
        var r = (110 - spo2) / 25;
        cur = { p50: p50, sao2: o2hbFrac, spo2: spo2, lowSig: lowSig };
        upd({
          sao2: { v: MT.fmt(o2hbFrac, 0), state: o2hbFrac < 90 ? 'bad' : '' },
          spo2: { v: lowSig ? '--' : MT.fmt(spo2, 0), state: lowSig ? 'warn' : Math.abs(spo2 - o2hbFrac) > 4 ? 'bad' : spo2 < 90 ? 'bad' : '' },
          p50: MT.fmt(p50, 1), r: MT.fmt(r, 2), pi: { v: MT.fmt(s.perf * 2.5, 1), state: s.perf < 0.3 ? 'warn' : '' },
          cao2: MT.fmt(1.34 * s.hb * o2hbFrac / 100 + 0.003 * s.po2, 1)
        });
      }
      calc();
      C.addEventListener('input', calc); C.addEventListener('change', calc);

      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        t += dt;
        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        var x0 = 54, y0 = 22, w = W - 80, h = H - 60;
        ctx.strokeStyle = 'rgba(255,255,255,.08)';
        for (var i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 + h * i / 10); ctx.lineTo(x0 + w, y0 + h * i / 10); ctx.stroke(); }
        for (var k = 0; k <= 150; k += 10) { var xx = x0 + w * k / 150; ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke(); }
        ctx.fillStyle = '#9fb3c8'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
        for (k = 0; k <= 150; k += 30) ctx.fillText(k, x0 + w * k / 150, y0 + h + 14);
        ctx.fillText('pO₂ (mmHg)', x0 + w / 2, y0 + h + 30);
        ctx.textAlign = 'right'; for (i = 0; i <= 100; i += 20) ctx.fillText(i + ' %', x0 - 6, y0 + h - h * i / 100 + 4);
        ctx.textAlign = 'left';
        // Normalkurve
        MT.labUI.plotFn(ctx, x0, y0, w, h, 0, 100, 300, function (f) { return MT.physio.so2(f * 150, 26.8); }, 'rgba(255,255,255,.35)', 1.5);
        // aktuelle Kurve
        MT.labUI.plotFn(ctx, x0, y0, w, h, 0, 100, 300, function (f) { return MT.physio.so2(f * 150, cur.p50); }, '#ff5d73', 2.5);
        // Kritischer Bereich
        ctx.fillStyle = 'rgba(214,40,57,.08)'; ctx.fillRect(x0, y0, w * 60 / 150, h);
        ctx.fillStyle = 'rgba(255,140,150,.7)'; ctx.fillText('steiler Teil', x0 + 6, y0 + 14);
        // Marker
        var mx = x0 + w * s.po2 / 150, my = y0 + h - h * MT.physio.so2(s.po2, cur.p50) / 100;
        ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(mx, y0 + h); ctx.lineTo(mx, my); ctx.lineTo(x0, my); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
        // P50
        var px = x0 + w * cur.p50 / 150, py = y0 + h / 2;
        ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillText('P50 ' + MT.fmt(cur.p50, 1), px + 8, py + 4);
        ctx.fillStyle = '#9fb3c8'; ctx.fillText('— normale Kurve (pH 7,40 · 37 °C)', x0 + w - 230, y0 + h - 30);
        ctx.fillStyle = '#ff5d73'; ctx.fillText('— aktuelle Kurve', x0 + w - 230, y0 + h - 14);

        // Plethysmogramm (rot/IR)
        var S2 = MT.setupCanvas(cv2), c2 = S2.ctx, W2 = S2.w, H2 = S2.h;
        c2.fillStyle = '#060c13'; c2.fillRect(0, 0, W2, H2);
        c2.fillStyle = '#9fb3c8'; c2.font = '600 11px system-ui'; c2.fillText('Plethysmogramm: pulsatiler Anteil (AC) von Rot- und Infrarotlicht', 10, 16);
        var R = (110 - cur.spo2) / 25;
        ['#ff4d5e', '#c18bff'].forEach(function (col, j) {
          var ampl = (j === 0 ? R : 1) * 0.3 * s.perf;
          c2.strokeStyle = col; c2.lineWidth = 2; c2.beginPath();
          for (var x = 0; x < W2; x += 2) {
            var tt = t - (W2 - x) / W2 * 4, ph = (tt * 1.2) % 1;
            var v = Math.exp(-Math.pow((ph - 0.15) / 0.07, 2)) + 0.45 * Math.exp(-Math.pow((ph - 0.38) / 0.09, 2));
            if (s.motion) v += 1.5 * Math.sin(tt * 7.3) * Math.sin(tt * 1.7);
            var y = H2 * (j === 0 ? 0.5 : 0.82) - v * ampl * H2;
            if (!x) c2.moveTo(x, y); else c2.lineTo(x, y);
          }
          c2.stroke();
        });
        c2.fillStyle = '#ff4d5e'; c2.fillText('rot 660 nm', W2 - 90, H2 * 0.36); c2.fillStyle = '#c18bff'; c2.fillText('IR 940 nm', W2 - 90, H2 * 0.66);
      });
      MT._simCleanup = stop;
    }
  });
})();
