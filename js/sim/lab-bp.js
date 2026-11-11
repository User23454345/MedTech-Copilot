/* =====================================================================
   Simulation: Blutdruck – invasiv (Druckwandler, Hydrostatik, Dämpfung,
   Fast-Flush-Test) und nicht-invasiv (oszillometrisches Prinzip)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  MT.registerSim({
    id: 'bloodpressure',
    title: 'Blutdruck',
    subtitle: 'Invasiv & oszillometrisch',
    icon: '🩺',
    devices: ['art-line', 'monitor', 'spot-monitor'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var cv = MT.labUI.canvas(L.view, '16 / 6');
      var cv2 = MT.labUI.canvas(L.view, '16 / 6');
      var p = MT.physio.createPatient({ hr: 75, sys: 125, dia: 75 });
      var src = MT.physio.createSignalSource(p);
      var cuff = 'ok', flushT = -10, nibp = null;
      var C = L.controls, U = MT.labUI;
      U.heading(C, 'Patient (wahre Werte)');
      U.slider(C, { label: 'Systolisch', min: 70, max: 220, value: p.sys, unit: 'mmHg', onInput: function (v) { p.sys = Math.max(v, p.dia + 15); } });
      U.slider(C, { label: 'Diastolisch', min: 35, max: 120, value: p.dia, unit: 'mmHg', onInput: function (v) { p.dia = Math.min(v, p.sys - 15); } });
      U.slider(C, { label: 'Herzfrequenz', min: 40, max: 160, value: p.hr, unit: '/min', onInput: function (v) { p.hr = v; } });
      U.heading(C, 'Invasive Messung');
      U.slider(C, { label: 'Wandler relativ zum Herzen', min: -30, max: 30, value: 0, fmt: function (v) { return v === 0 ? 'auf Herzhöhe' : (v > 0 ? v + ' cm höher' : (-v) + ' cm tiefer'); }, onInput: function (v) { p.transducerOffsetCm = v; } });
      U.seg(C, { label: 'Dämpfung des Systems', value: 'normal', options: [['under', 'unterdämpft'], ['normal', 'optimal'], ['over', 'überdämpft']], onChange: function (v) { p.artDamping = v; } });
      U.button(C, '💧 Fast-Flush-Test', 'small', function () { flushT = t; });
      U.heading(C, 'Nicht-invasive Messung (NIBP)');
      U.seg(C, { label: 'Manschettengröße', value: 'ok', options: [['small', 'zu klein'], ['ok', 'passend'], ['large', 'zu groß']], onChange: function (v) { cuff = v; } });
      U.button(C, '▶ NIBP-Messung starten', 'primary small', function () { nibp = { t0: t }; });

      var upd = U.readouts(L.readouts, [
        { key: 'true', label: 'Wahrer Druck', unit: 'mmHg' }, { key: 'map', label: 'Wahrer MAP', unit: 'mmHg' },
        { key: 'art', label: 'ART-Anzeige', unit: 'mmHg' }, { key: 'artmap', label: 'ART-MAP', unit: 'mmHg' },
        { key: 'nibp', label: 'NIBP-Ergebnis', unit: 'mmHg' }, { key: 'err', label: 'Hydrostat. Fehler', unit: 'mmHg' }
      ]);

      L.theory.innerHTML = '<h3>Messprinzipien</h3>' +
        '<p><b>Invasiv:</b> Eine flüssigkeitsgefüllte Leitung überträgt den arteriellen Druck auf eine Membran mit Dehnungsmessstreifen (Wheatstone-Brücke). Weil die Flüssigkeitssäule selbst einen Druck erzeugt, gilt:</p>' +
        '<div class="formula">Δp = ρ · g · h ≈ 1,06 g/cm³ · 981 cm/s² · 1 cm ≈ 0,74 mmHg pro cm Höhenunterschied</div>' +
        '<p>Liegt der Wandler <b>unter</b> dem Herzniveau, wird ein zu hoher Druck angezeigt, liegt er <b>höher</b>, ein zu niedriger. Deshalb: Nullabgleich auf der phlebostatischen Achse. Das Leitungssystem ist ein schwingungsfähiges System (Eigenfrequenz, Dämpfung): <b>Unterdämpft</b> überschießt die Systole, <b>überdämpft</b> (Luftblase, Gerinnsel, Knick) ist die Kurve verschliffen – Systole zu niedrig, Diastole zu hoch, der MAP bleibt annähernd richtig. Der <b>Fast-Flush-Test</b> zeigt die Dämpfung: optimal sind 1–2 Nachschwingungen.</p>' +
        '<div class="formula">MAP ≈ Diastole + ⅓ · (Systole − Diastole)</div>' +
        '<p><b>Oszillometrisch (NIBP):</b> Die Manschette wird über den systolischen Druck aufgepumpt und schrittweise abgelassen. Die Pulsationen der Arterie erzeugen kleine Druckschwankungen in der Manschette. Ihr <b>Maximum</b> liegt beim mittleren arteriellen Druck; Systole und Diastole werden über herstellerspezifische Algorithmen (z. B. feste Amplitudenverhältnisse) geschätzt.</p>' +
        '<div class="callout warn">⚠️ Zu kleine Manschetten messen zu hohe Werte, zu große zu niedrige. Die Manschettenbreite sollte etwa 40 % des Oberarmumfangs betragen.</div>';

      var t = 0, numT = 0, artMin = 999, artMax = 0, artSum = 0, artN = 0;
      var buf = [], tbuf = [], wx = 0, lastW = 0;
      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        if (W !== lastW) { lastW = W; buf = new Array(W).fill(NaN); tbuf = new Array(W).fill(NaN); wx = 0; }
        var pps = W / 6, steps = Math.max(1, Math.round(dt * pps));
        for (var i = 0; i < steps; i++) {
          t += 1 / pps;
          var meas = src.art(t);
          var truth = src.art(t, true);
          // Fast-Flush: 0,6 s Spüldruck, danach systemabhängige Antwort
          var ft = t - flushT;
          if (ft >= 0 && ft < 0.6) meas = 300;
          else if (ft >= 0.6 && ft < 2.2) {
            var tau = ft - 0.6, amp = 300 - meas;
            var resp = p.artDamping === 'under' ? Math.exp(-tau * 5) * Math.cos(2 * Math.PI * 14 * tau) : p.artDamping === 'over' ? Math.exp(-tau * 4) : Math.exp(-tau * 22) * Math.cos(2 * Math.PI * 14 * tau);
            meas = meas + amp * resp;
          }
          buf[wx] = meas; tbuf[wx] = truth; wx = (wx + 1) % W;
          for (var g = 1; g < 8; g++) { buf[(wx + g) % W] = NaN; tbuf[(wx + g) % W] = NaN; }
          if (!(ft >= 0 && ft < 2.2)) { artMin = Math.min(artMin, meas); artMax = Math.max(artMax, meas); artSum += meas; artN++; }
        }
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        var lo = 0, hi = 220, top = 8, h = H - 16;
        MT.labUI.plotFrame(ctx, 0, top, W, h, { title: 'Arterielle Druckkurve (rot = Anzeige, grau = wahrer Druck)', color: '#ff4d5e', max: '220 mmHg', min: '0' });
        [[tbuf, 'rgba(200,210,220,.4)', 1.5], [buf, '#ff4d5e', 2]].forEach(function (b) {
          ctx.strokeStyle = b[1]; ctx.lineWidth = b[2]; ctx.beginPath(); var pen = false;
          for (var x = 0; x < W; x++) { var v = b[0][x]; if (v !== v) { pen = false; continue; } var y = top + h - (MT.clamp(v, lo, hi) - lo) / (hi - lo) * h; if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); }
          ctx.stroke();
        });

        // NIBP
        var S2 = MT.setupCanvas(cv2), c2 = S2.ctx, W2 = S2.w, H2 = S2.h;
        c2.fillStyle = '#060c13'; c2.fillRect(0, 0, W2, H2);
        c2.fillStyle = '#9fb3c8'; c2.font = '600 11px system-ui'; c2.textBaseline = 'top';
        c2.fillText('Oszillometrie: Manschettendruck (weiß) und Oszillationsamplituden (cyan)', 8, 6);
        var bias = cuff === 'small' ? 14 : cuff === 'large' ? -9 : 0;
        var map = MT.physio.map(p.sys, p.dia) + bias;
        var width = (p.sys - p.dia) * 0.75;
        var envelope = function (pc) { return Math.exp(-Math.pow((pc - map) / width, 2)); };
        var x0 = 40, w = W2 - 60, y0 = 26, hh = H2 - 50;
        var pmax = Math.max(p.sys + 40, 160), dur = 14;
        c2.strokeStyle = 'rgba(255,255,255,.1)';
        for (var q = 0; q <= 4; q++) { c2.beginPath(); c2.moveTo(x0, y0 + hh * q / 4); c2.lineTo(x0 + w, y0 + hh * q / 4); c2.stroke(); }
        if (nibp) {
          var el = t - nibp.t0, inflate = 2.5;
          var pc = function (tt) { return tt < inflate ? pmax * tt / inflate : Math.max(0, pmax - (pmax - 30) * (tt - inflate) / (dur - inflate)); };
          var tEnd = Math.min(el, dur);
          c2.strokeStyle = '#fff'; c2.lineWidth = 2; c2.beginPath();
          for (var k = 0; k <= 400; k++) {
            var tt = tEnd * k / 400, pr = pc(tt);
            var osc = tt > inflate ? 4 * envelope(pr) * Math.sin(2 * Math.PI * p.hr / 60 * tt) : 0;
            var xx = x0 + w * tt / dur, yy = y0 + hh - (pr + osc) / pmax * hh;
            if (!k) c2.moveTo(xx, yy); else c2.lineTo(xx, yy);
          }
          c2.stroke();
          // Amplitudenbalken je Herzschlag
          var beat = 60 / p.hr, amax = 0, best = null;
          for (var tb = inflate; tb < tEnd; tb += beat) {
            var prs = pc(tb), a = envelope(prs);
            c2.fillStyle = '#3fe0ff'; var bx = x0 + w * tb / dur;
            c2.fillRect(bx - 2, y0 + hh - a * hh * 0.5, 4, a * hh * 0.5);
            if (a > amax) { amax = a; best = prs; }
          }
          if (el > dur && !nibp.done) {
            // Ergebnis mit typischen Amplitudenverhältnissen (sys 0,55 · max, dia 0,85 · max)
            var sysEst = map + width * Math.sqrt(-Math.log(0.55)), diaEst = map - width * Math.sqrt(-Math.log(0.85)) * 1.6;
            nibp.done = true; nibp.res = [sysEst, diaEst, map];
          }
          if (nibp.res) {
            [['SYS', nibp.res[0]], ['MAP', nibp.res[2]], ['DIA', nibp.res[1]]].forEach(function (r, i) {
              var yy2 = y0 + hh - r[1] / pmax * hh;
              c2.setLineDash([4, 4]); c2.strokeStyle = ['#ff8a8a', '#ffd84a', '#8ab4ff'][i]; c2.beginPath(); c2.moveTo(x0, yy2); c2.lineTo(x0 + w, yy2); c2.stroke(); c2.setLineDash([]);
              c2.fillStyle = c2.strokeStyle; c2.fillText(r[0] + ' ' + Math.round(r[1]), x0 + w - 70, yy2 - 14);
            });
          }
        } else {
          c2.fillStyle = '#9fb3c8'; c2.font = '14px system-ui'; c2.textAlign = 'center';
          c2.fillText('„NIBP-Messung starten“ drücken', W2 / 2, H2 / 2); c2.textAlign = 'left';
        }

        numT -= dt;
        if (numT <= 0 && artN > 0) {
          numT = 1.5;
          var tm = MT.physio.map(p.sys, p.dia);
          upd({
            true: Math.round(p.sys) + '/' + Math.round(p.dia), map: Math.round(tm),
            art: { v: Math.round(artMax) + '/' + Math.round(artMin), state: Math.abs(artMax - p.sys) > 8 || Math.abs(artMin - p.dia) > 8 ? 'warn' : '' },
            artmap: { v: Math.round(artSum / artN), state: Math.abs(artSum / artN - tm) > 6 ? 'bad' : '' },
            nibp: nibp && nibp.res ? { v: Math.round(nibp.res[0]) + '/' + Math.round(nibp.res[1]), state: Math.abs(nibp.res[2] - tm) > 6 ? 'bad' : '' } : (nibp ? 'misst …' : '–'),
            err: { v: MT.fmt(-p.transducerOffsetCm * 0.74, 0), state: Math.abs(p.transducerOffsetCm) > 5 ? 'bad' : '' }
          });
          artMin = 999; artMax = 0; artSum = 0; artN = 0;
        }
      });
      MT._simCleanup = stop;
    }
  });
})();
