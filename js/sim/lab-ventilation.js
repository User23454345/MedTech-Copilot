/* =====================================================================
   Simulation: Atemphysiologie & maschinelle Beatmung
   Bewegungsgleichung P = V/C + R·V' + PEEP, alveoläre Ventilation,
   alveoläre Gasgleichung, Shunt-Modell, Severinghaus-Kurve.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  var PRESETS = {
    healthy: { label: 'Lungengesund', c: 60, r: 8, shunt: 0.04, vco2: 200 },
    ards: { label: 'ARDS (steife Lunge)', c: 28, r: 12, shunt: 0.3, vco2: 230 },
    obstructive: { label: 'Obstruktion (Asthma/COPD)', c: 55, r: 28, shunt: 0.08, vco2: 220 }
  };

  MT.registerSim({
    id: 'ventilation',
    title: 'Atemphysiologie & Beatmung',
    subtitle: 'Druck, Flow, Volumen, Gasaustausch',
    icon: '🫁',
    devices: ['ventilator', 'anesthesia-machine', 'neo-ventilator'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var cv = MT.labUI.canvas(L.view, '16 / 10');
      var s = { mode: 'VC', vt: 480, pinsp: 15, peep: 8, rr: 16, ie: 0.5, c: 60, r: 8, fio2: 0.4, pause: 0.2, shunt: 0.04, vco2: 200, vd: 150 };
      var C = L.controls, U = MT.labUI;

      U.heading(C, 'Lungenmodell');
      U.seg(C, { label: 'Voreinstellung', value: 'healthy', options: Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k].label.split(' ')[0]]; }), onChange: function (k) { var p = PRESETS[k]; s.c = p.c; s.r = p.r; s.shunt = p.shunt; s.vco2 = p.vco2; sc.set(p.c); sr.set(p.r); ss.set(p.shunt * 100); } });
      var sc = U.slider(C, { label: 'Compliance C', min: 10, max: 100, value: s.c, unit: 'ml/cmH₂O', onInput: function (v) { s.c = v; } });
      var sr = U.slider(C, { label: 'Resistance R', min: 3, max: 40, value: s.r, unit: 'cmH₂O/(l/s)', onInput: function (v) { s.r = v; } });
      var ss = U.slider(C, { label: 'Shunt (Lungenschaden)', min: 2, max: 50, value: 4, unit: '%', onInput: function (v) { s.shunt = v / 100; } });
      U.heading(C, 'Beatmungseinstellungen');
      U.seg(C, { label: 'Modus', value: 'VC', options: [['VC', 'Volumenkontrolliert'], ['PC', 'Druckkontrolliert']], onChange: function (v) { s.mode = v; vtS.input.disabled = v === 'PC'; piS.input.disabled = v === 'VC'; } });
      var vtS = U.slider(C, { label: 'Tidalvolumen VT', min: 200, max: 900, step: 10, value: s.vt, unit: 'ml', onInput: function (v) { s.vt = v; } });
      var piS = U.slider(C, { label: 'Inspirationsdruck über PEEP', min: 5, max: 35, value: s.pinsp, unit: 'cmH₂O', onInput: function (v) { s.pinsp = v; } });
      piS.input.disabled = true;
      U.slider(C, { label: 'PEEP', min: 0, max: 20, value: s.peep, unit: 'cmH₂O', onInput: function (v) { s.peep = v; } });
      U.slider(C, { label: 'Atemfrequenz', min: 6, max: 40, value: s.rr, unit: '/min', onInput: function (v) { s.rr = v; } });
      U.slider(C, { label: 'I:E-Verhältnis', min: 0.25, max: 1, step: 0.05, value: s.ie, fmt: function (v) { return '1:' + MT.fmt(1 / v, 1); }, onInput: function (v) { s.ie = v; } });
      U.slider(C, { label: 'FiO₂', min: 21, max: 100, value: 40, unit: '%', onInput: function (v) { s.fio2 = v / 100; } });

      var upd = U.readouts(L.readouts, [
        { key: 'ppeak', label: 'Ppeak', unit: 'cmH₂O' }, { key: 'pplat', label: 'Pplat', unit: 'cmH₂O' }, { key: 'dp', label: 'Driving P.', unit: 'cmH₂O' },
        { key: 'vt', label: 'VT', unit: 'ml' }, { key: 'mv', label: 'Minutenvol.', unit: 'l/min' }, { key: 'tau', label: 'τ = R·C', unit: 's' },
        { key: 'paco2', label: 'PaCO₂', unit: 'mmHg' }, { key: 'pao2', label: 'PaO₂', unit: 'mmHg' }, { key: 'spo2', label: 'SaO₂', unit: '%' },
        { key: 'pf', label: 'PaO₂/FiO₂', unit: 'mmHg' }, { key: 'ph', label: 'pH', unit: '' }, { key: 'autopeep', label: 'Ausatmung', unit: '' }
      ]);

      L.theory.innerHTML = '<h3>So funktioniert das Modell</h3>' +
        '<p>Das respiratorische System wird als ein elastischer Ballon (Compliance C) hinter einem Rohr (Resistance R) beschrieben. Der Atemwegsdruck ergibt sich aus der <b>Bewegungsgleichung</b>:</p>' +
        '<div class="formula">P<sub>aw</sub>(t) = V(t) / C + R · V̇(t) + PEEP</div>' +
        '<p><b>Volumenkontrolliert:</b> konstanter Flow – der Druck steigt, Spitzendruck = Plateaudruck + R·Flow. <b>Druckkontrolliert:</b> konstanter Druck – der Flow fällt exponentiell mit der Zeitkonstante τ = R·C ab, das Volumen hängt von C und der Inspirationszeit ab. Die Ausatmung ist passiv; nach 3·τ sind ca. 95 % des Volumens ausgeatmet – ist die Exspirationszeit kürzer, droht <b>Air Trapping (Auto-PEEP)</b>.</p>' +
        '<p><b>Gasaustausch:</b> PaCO₂ = 0,863 · V̇CO₂ / V̇<sub>A</sub> mit alveolärer Ventilation V̇<sub>A</sub> = (VT − Totraum) · AF. Alveolärer O₂: P<sub>A</sub>O₂ = FiO₂ · (760 − 47) − PaCO₂ / 0,8. Ein <b>Shunt</b> (nicht belüftete, aber durchblutete Lunge) mischt venöses Blut bei; PEEP rekrutiert im Modell einen Teil davon. Die Sättigung folgt der Severinghaus-Gleichung.</p>' +
        '<div class="callout">🔬 Probiere: Wähle „ARDS“ und erhöhe die FiO₂ – die Oxygenierung verbessert sich nur begrenzt (Shunt!). Erhöhe dann den PEEP. Wähle „Obstruktion“ und erhöhe die Atemfrequenz: Die Exspiration wird unvollständig.</div>' +
        '<p class="muted" style="font-size:12px">Vereinfachtes Lehrmodell (Ein-Kompartiment, lineare Mechanik). Keine Grundlage für Therapieentscheidungen.</p>';

      var t = 0;
      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        t += dt;
        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        var m = MT.physio.ventMetrics(s);
        var Tc = 60 / s.rr, span = Math.max(2 * Tc, 6);
        var plotW = W * 0.66, rowH = (H - 20) / 3, pad = 10;
        var pmax = Math.max(40, Math.ceil((m.ppeak + 5) / 10) * 10);
        var fmax = Math.max(60, Math.ceil(Math.abs(Math.max(m.vt / 1000 / m.tau, (m.vt / 1000) / (m.ti * (1 - (s.mode === 'VC' ? s.pause : 0)))) * 60 / 20) * 20 + 20));
        var vmax = Math.max(600, Math.ceil((m.vt + 100) / 200) * 200);
        var rows = [
          { key: 'p', title: 'Druck Paw (cmH₂O)', color: '#ffd84a', lo: 0, hi: pmax },
          { key: 'flow', title: 'Flow (l/min)', color: '#3fe0ff', lo: -fmax, hi: fmax },
          { key: 'vol', title: 'Volumen (ml)', color: '#3cff7a', lo: 0, hi: vmax }
        ];
        var cursor = (t % span) / span;
        rows.forEach(function (r, i) {
          var y0 = pad + i * rowH, h = rowH - 8;
          MT.labUI.plotFrame(ctx, pad, y0, plotW - pad, h, { title: r.title, color: r.color, max: r.hi, min: r.lo, zero: r.lo < 0 ? y0 + h / 2 : null });
          // gezeichneter Bereich bis Cursor hell, danach abgedunkelt (Sweep-Effekt)
          [[0, cursor, 1], [cursor + 0.02, 1, 0.35]].forEach(function (seg) {
            ctx.save(); ctx.globalAlpha = seg[2]; ctx.strokeStyle = r.color; ctx.lineWidth = 2; ctx.beginPath();
            var n = 300, first = true;
            for (var k = Math.floor(seg[0] * n); k <= Math.floor(seg[1] * n); k++) {
              var tt = k / n * span, v = MT.physio.ventCycle(s, tt)[r.key];
              var x = pad + (plotW - pad) * k / n, y = y0 + h - (MT.clamp(v, r.lo, r.hi) - r.lo) / (r.hi - r.lo) * h;
              if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
            }
            ctx.stroke(); ctx.restore();
          });
          if (r.key === 'p') {
            var py = function (v) { return y0 + h - (v - r.lo) / (r.hi - r.lo) * h; };
            ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,216,74,.45)';
            [m.ppeak, m.pplat, s.peep].forEach(function (v) { ctx.beginPath(); ctx.moveTo(pad, py(v)); ctx.lineTo(plotW, py(v)); ctx.stroke(); });
            ctx.restore();
            ctx.fillStyle = 'rgba(255,216,74,.85)'; ctx.font = '600 10px system-ui'; ctx.textAlign = 'left';
            ctx.fillText('Ppeak', plotW - 44, py(m.ppeak) - 2); ctx.fillText('Pplat', plotW - 44, py(m.pplat) + 11); ctx.fillText('PEEP', plotW - 44, py(s.peep) - 2);
          }
        });
        // Druck-Volumen-Schleife
        var lx = plotW + 20, lw = W - lx - 14, ly = pad + 18, lh = H * 0.55;
        ctx.fillStyle = '#9fb3c8'; ctx.font = '600 11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('Druck-Volumen-Schleife', lx, pad);
        ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.strokeRect(lx, ly, lw, lh);
        ctx.strokeStyle = '#ff9be0'; ctx.lineWidth = 2; ctx.beginPath();
        for (var k = 0; k <= 200; k++) {
          var v = MT.physio.ventCycle(s, k / 200 * Tc);
          var x = lx + (v.p / pmax) * lw, y = ly + lh - (v.vol / vmax) * lh;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Compliance-Gerade
        ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath();
        ctx.moveTo(lx + s.peep / pmax * lw, ly + lh); ctx.lineTo(lx + (s.peep + vmax / s.c) / pmax * lw, ly); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#9fb3c8'; ctx.font = '10px system-ui'; ctx.fillText('P →', lx + lw - 22, ly + lh + 3); ctx.fillText('V ↑', lx + 2, ly + 2);
        // Lunge (animiert)
        var cur = MT.physio.ventCycle(s, t);
        var fill = MT.clamp(cur.vol / Math.max(m.vt, 1), 0, 1);
        var bx = lx + lw / 2, by = ly + lh + 70, br = 22 + 16 * fill;
        ctx.fillStyle = 'rgba(255,140,170,.18)'; ctx.strokeStyle = '#ff8cb0'; ctx.lineWidth = 2;
        [-1, 1].forEach(function (sgn) { ctx.beginPath(); ctx.ellipse(bx + sgn * (br * 0.75 + 4), by, br * 0.7, br, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
        ctx.strokeStyle = '#ccd'; ctx.beginPath(); ctx.moveTo(bx, by - br - 20); ctx.lineTo(bx, by - br * 0.4); ctx.stroke();
        ctx.fillStyle = '#9fb3c8'; ctx.textAlign = 'center'; ctx.fillText(cur.phase === 'insp' ? 'Inspiration' : 'Exspiration', bx, by + br + 8);
        ctx.textAlign = 'left';
      });

      function calc() {
        var m = MT.physio.ventMetrics(s);
        var g = MT.physio.gasExchange({ fio2: s.fio2, vt: m.vt, rr: s.rr, vd: s.vd, vco2: s.vco2, shunt: s.shunt, peep: s.peep });
        upd({
          ppeak: { v: MT.fmt(m.ppeak, 0), state: m.ppeak > 35 ? 'bad' : m.ppeak > 30 ? 'warn' : '' },
          pplat: { v: MT.fmt(m.pplat, 0), state: m.pplat > 30 ? 'bad' : '' },
          dp: { v: MT.fmt(m.driving, 0), state: m.driving > 15 ? 'warn' : '' },
          vt: MT.fmt(m.vt, 0), mv: MT.fmt(m.mv, 1), tau: MT.fmt(m.tau, 2),
          paco2: { v: MT.fmt(g.paco2, 0), state: g.paco2 > 50 || g.paco2 < 30 ? 'warn' : '' },
          pao2: { v: MT.fmt(g.pao2, 0), state: g.pao2 < 60 ? 'bad' : '' },
          spo2: { v: MT.fmt(g.sao2, 0), state: g.sao2 < 88 ? 'bad' : g.sao2 < 92 ? 'warn' : '' },
          pf: { v: MT.fmt(g.horowitz, 0), state: g.horowitz < 200 ? 'bad' : g.horowitz < 300 ? 'warn' : '' },
          ph: { v: MT.fmt(g.pH, 2), state: g.pH < 7.3 || g.pH > 7.5 ? 'warn' : '' },
          autopeep: { v: m.autoPeepRisk ? 'Air Trapping!' : 'vollständig', state: m.autoPeepRisk ? 'bad' : '' }
        });
      }
      calc();
      L.controls.addEventListener('input', calc);
      L.controls.addEventListener('click', function () { setTimeout(calc, 0); });
      MT._simCleanup = stop;
    }
  });
})();
