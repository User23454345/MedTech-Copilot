/* =====================================================================
   Simulation: EKG – Entstehung, Rhythmen, Artefakte
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  var INFO = {
    sinus: { hr: 72, text: 'Regelmäßige RR-Abstände, vor jedem QRS-Komplex eine P-Welle, PQ-Zeit 120–200 ms, schmaler QRS (< 120 ms).', shock: false },
    afib: { hr: 110, text: 'Absolut unregelmäßige RR-Abstände, keine erkennbaren P-Wellen, flimmernde Grundlinie. Risiko: Thromben im Vorhof (Schlaganfall).', shock: false, sync: true },
    aflutter: { hr: 100, text: 'Sägezahnartige Flatterwellen (~300/min), meist 2:1- oder 3:1-Überleitung auf die Kammern.', shock: false, sync: true },
    stemi: { hr: 88, text: 'Sinusrhythmus mit ST-Strecken-Hebung – Hinweis auf akuten Myokardinfarkt. Sofort 12-Kanal-EKG und Herzkatheter!', shock: false },
    avb3: { hr: 35, text: 'Vorhöfe (P-Wellen) und Kammern (breite Ersatzrhythmen) schlagen unabhängig voneinander. Langsame Kammerfrequenz → ggf. Schrittmacher.', shock: false },
    vt: { hr: 180, text: 'Breite, schnelle, regelmäßige Kammerkomplexe. Ohne Puls: Defibrillation; mit Puls: ggf. synchronisierte Kardioversion.', shock: true },
    vf: { hr: 0, text: 'Chaotische, unkoordinierte elektrische Aktivität ohne Auswurf. Kreislaufstillstand → sofort Reanimation und Defibrillation.', shock: true },
    asystole: { hr: 0, text: 'Keine elektrische Aktivität (Nulllinie). Nicht defibrillierbar – Reanimation, Adrenalin. Immer Ableitung/Verstärkung prüfen!', shock: false },
    paced: { hr: 70, text: 'Schmale Stimulationsspikes vor breiten QRS-Komplexen – ventrikuläre Schrittmacherstimulation.', shock: false }
  };

  MT.registerSim({
    id: 'ecg',
    title: 'EKG',
    subtitle: 'Herzerregung, Rhythmen, Artefakte',
    icon: '💓',
    devices: ['monitor', 'ecg-12lead', 'defibrillator'],
    mount: function (host) {
      var L = MT.labUI.layout(host, { light: true });
      var cv = MT.labUI.canvas(L.view, '16 / 7');
      var cv2 = MT.labUI.canvas(L.view, '16 / 5');
      var p = MT.physio.createPatient({ hr: 72, rhythm: 'sinus' });
      var src = MT.physio.createSignalSource(p);
      var C = L.controls, U = MT.labUI;
      var gain = 10, speed = 25, filter = 'monitor';
      U.select(C, { label: 'Rhythmus', value: 'sinus', options: Object.keys(MT.physio.RHYTHMS).filter(function (k) { return k !== 'pea'; }).map(function (k) { return [k, MT.physio.RHYTHMS[k]]; }), onChange: function (v) { p.rhythm = v; if (INFO[v].hr) { p.hr = INFO[v].hr; hrS.set(INFO[v].hr); } info(); } });
      var hrS = U.slider(C, { label: 'Frequenz', min: 25, max: 220, value: 72, unit: '/min', onInput: function (v) { p.hr = v; } });
      U.seg(C, { label: 'Papiervorschub', value: 25, options: [[25, '25 mm/s'], [50, '50 mm/s']], onChange: function (v) { speed = v; } });
      U.seg(C, { label: 'Verstärkung', value: 10, options: [[5, '5 mm/mV'], [10, '10 mm/mV'], [20, '20 mm/mV']], onChange: function (v) { gain = v; } });
      U.heading(C, 'Störungen');
      U.check(C, { label: 'Elektrode gelöst (Ableitung ab)', onChange: function (v) { p.ecgLeadOff = v; } });
      U.check(C, { label: 'Bewegungsartefakt', onChange: function (v) { p.motionArtifact = v; } });
      U.check(C, { label: '50-Hz-Netzbrumm (ohne Filter)', onChange: function (v) { hum = v; } });
      var hum = false;
      var box = MT.el('div', { class: 'callout' }); C.appendChild(box);

      var upd = U.readouts(L.readouts, [
        { key: 'hr', label: 'Herzfrequenz', unit: '/min' }, { key: 'rr', label: 'RR-Intervall', unit: 'ms' },
        { key: 'reg', label: 'Rhythmus', unit: '' }, { key: 'shock', label: 'Defibrillierbar', unit: '' }
      ]);

      function info() {
        var i = INFO[p.rhythm];
        box.innerHTML = '<b>' + MT.esc(MT.physio.RHYTHMS[p.rhythm]) + '</b><br>' + MT.esc(i.text);
      }
      info();

      L.theory.innerHTML = '<h3>Wie entsteht das EKG?</h3>' +
        '<p>Der Sinusknoten erzeugt die Erregung, die sich über die Vorhöfe (<b>P-Welle</b>), den AV-Knoten (<b>PQ-Strecke</b>), das His-Purkinje-System und die Kammern (<b>QRS-Komplex</b>) ausbreitet; die <b>T-Welle</b> zeigt die Erregungsrückbildung der Kammern. Die Spannungsänderungen (ca. 1 mV) werden über Hautelektroden abgeleitet, verstärkt (Differenzverstärker mit hoher Gleichtaktunterdrückung) und gefiltert.</p>' +
        '<div class="formula">Herzfrequenz = 60 000 / RR-Intervall [ms] &nbsp;·&nbsp; bei 25 mm/s: 1 mm = 40 ms, 5 mm = 200 ms</div>' +
        '<p><b>Einthoven-Ableitung II</b> (rechter Arm → linkes Bein) verläuft etwa parallel zur Herzachse und zeigt P-Wellen meist gut – deshalb ist sie Standard am Monitor. Der Monitor nutzt einen Bandpass (ca. 0,5–40 Hz) gegen Bewegungs- und Netzstörungen; das diagnostische 12-Kanal-EKG verwendet 0,05–150 Hz, damit ST-Strecken unverfälscht bleiben.</p>' +
        '<div class="callout warn">⚠️ Eine „Nulllinie“ kann Asystolie bedeuten – oder eine gelöste Elektrode. Ein „Flimmern“ kann Kammerflimmern sein – oder ein Bewegungsartefakt. Immer zuerst den Patienten prüfen!</div>' +
        '<p class="muted" style="font-size:12px">Synthetisches Signal aus überlagerten Gauß-Funktionen (vereinfachtes Modell).</p>';

      var buf = [], wx = 0, t = 0, lastW = 0, numT = 0;
      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        var pxPerMm = W / 250; // 250 mm Breite = 10 s bei 25 mm/s
        if (W !== lastW) { lastW = W; buf = new Array(Math.round(W)).fill(NaN); wx = 0; }
        var pxPerSec = speed * pxPerMm;
        var steps = Math.max(1, Math.round(dt * pxPerSec));
        for (var i = 0; i < steps; i++) {
          t += 1 / pxPerSec;
          var v = src.ecg(t);
          if (hum) v += 0.12 * Math.sin(2 * Math.PI * 50 * t);
          buf[wx] = v; wx = (wx + 1) % buf.length;
          for (var g = 1; g < 8; g++) buf[(wx + g) % buf.length] = NaN;
        }
        // EKG-Papier
        ctx.fillStyle = '#fff8f6'; ctx.fillRect(0, 0, W, H);
        for (var mm = 0; mm * pxPerMm < W; mm++) {
          ctx.strokeStyle = mm % 5 === 0 ? 'rgba(230,110,110,.45)' : 'rgba(240,160,160,.22)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(mm * pxPerMm + .5, 0); ctx.lineTo(mm * pxPerMm + .5, H); ctx.stroke();
        }
        for (var mmy = 0; mmy * pxPerMm < H; mmy++) {
          ctx.strokeStyle = mmy % 5 === 0 ? 'rgba(230,110,110,.45)' : 'rgba(240,160,160,.22)';
          ctx.beginPath(); ctx.moveTo(0, mmy * pxPerMm + .5); ctx.lineTo(W, mmy * pxPerMm + .5); ctx.stroke();
        }
        var base = H * 0.62;
        // Eichzacke 1 mV
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(2, base); ctx.lineTo(6, base); ctx.lineTo(6, base - gain * pxPerMm); ctx.lineTo(6 + 5 * pxPerMm, base - gain * pxPerMm); ctx.lineTo(6 + 5 * pxPerMm, base); ctx.lineTo(10 + 5 * pxPerMm, base); ctx.stroke();
        ctx.beginPath(); var pen = false;
        for (var x = 0; x < buf.length; x++) {
          var vv = buf[x]; if (vv !== vv || x < 14 + 5 * pxPerMm) { pen = false; continue; }
          var y = base - vv * gain * pxPerMm;
          if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#7a2a2a'; ctx.font = '600 12px system-ui'; ctx.textBaseline = 'top';
        ctx.fillText('Ableitung II · ' + speed + ' mm/s · ' + gain + ' mm/mV · Lernsignal (fiktiv)', 8, 6);
        if (p.ecgLeadOff) { ctx.fillStyle = '#c47a00'; ctx.fillText('⚠ ABLEITUNG PRÜFEN – technischer Alarm, keine Asystolie!', 8, 24); }

        // Erklärgrafik: ein Herzzyklus mit Beschriftung
        var S2 = MT.setupCanvas(cv2), c2 = S2.ctx, W2 = S2.w, H2 = S2.h;
        c2.fillStyle = '#fff'; c2.fillRect(0, 0, W2, H2);
        c2.fillStyle = '#4a5a6b'; c2.font = '600 12px system-ui'; c2.textBaseline = 'top';
        c2.fillText('Ein normaler Herzzyklus (Ableitung II) – Wellen und Zeiten', 10, 8);
        var x0 = W2 * 0.12, w0 = W2 * 0.55, b0 = H2 * 0.72, sc = H2 * 0.45;
        // Gauß-Template direkt abtasten
        function tpl(tt) { var d = tt - 0.35; var g = function (m, s, a) { var z = (d - m) / s; return a * Math.exp(-0.5 * z * z); }; return g(-0.17, 0.024, 0.12) + g(-0.028, 0.009, -0.1) + g(0, 0.01, 1.1) + g(0.028, 0.01, -0.28) + g(0.26, 0.055, 0.28); }
        c2.strokeStyle = '#142333'; c2.lineWidth = 2; c2.beginPath();
        for (var k = 0; k <= 300; k++) { var tt = k / 300 * 0.9, xx = x0 + w0 * k / 300, yy = b0 - tpl(tt) * sc; if (!k) c2.moveTo(xx, yy); else c2.lineTo(xx, yy); }
        c2.stroke();
        var X = function (tt) { return x0 + w0 * tt / 0.9; };
        [['P', 0.18, 0.12, '#2f7fd8'], ['Q', 0.322, -0.1, '#7b5cd6'], ['R', 0.35, 1.1, '#d62839'], ['S', 0.378, -0.28, '#7b5cd6'], ['T', 0.61, 0.28, '#16a085']].forEach(function (w) {
          c2.fillStyle = w[3]; c2.font = '700 14px system-ui'; c2.textAlign = 'center';
          c2.fillText(w[0], X(w[1]), b0 - w[2] * sc - (w[2] >= 0 ? 22 : -8));
        });
        c2.textAlign = 'left';
        function span(a, b, y, label) { c2.strokeStyle = '#7a8a9a'; c2.lineWidth = 1; c2.beginPath(); c2.moveTo(X(a), y); c2.lineTo(X(b), y); c2.moveTo(X(a), y - 4); c2.lineTo(X(a), y + 4); c2.moveTo(X(b), y - 4); c2.lineTo(X(b), y + 4); c2.stroke(); c2.fillStyle = '#4a5a6b'; c2.font = '11px system-ui'; c2.textAlign = 'center'; c2.fillText(label, (X(a) + X(b)) / 2, y + 5); c2.textAlign = 'left'; }
        span(0.13, 0.32, b0 + 10, 'PQ 120–200 ms');
        span(0.32, 0.4, b0 + 26, 'QRS < 120 ms');
        span(0.32, 0.69, b0 + 42 > H2 - 14 ? H2 - 16 : b0 + 42, 'QT ≈ 350–440 ms');
        c2.fillStyle = '#4a5a6b'; c2.font = '12.5px system-ui';
        var tx = x0 + w0 + 30, lines = ['P: Vorhoferregung', 'PQ: AV-Überleitung', 'QRS: Kammererregung', 'ST/T: Erregungsrückbildung', 'Atrium-Repolarisation im QRS verborgen'];
        lines.forEach(function (l, i) { c2.fillText(l, tx, H2 * 0.22 + i * 18); });

        numT -= dt;
        if (numT <= 0) {
          numT = 0.5;
          var b = src.beats().filter(function (x) { return x.t <= t; });
          var rr = b.length > 1 ? (b[b.length - 1].t - b[b.length - 2].t) * 1000 : NaN;
          var none = p.rhythm === 'vf' || p.rhythm === 'asystole' || p.ecgLeadOff;
          var reg = p.rhythm === 'afib' ? 'unregelmäßig' : none ? '–' : 'regelmäßig';
          upd({ hr: none ? '---' : MT.fmt(60000 / rr, 0), rr: none ? '–' : MT.fmt(rr, 0), reg: reg, shock: { v: INFO[p.rhythm].shock ? 'JA' : 'nein', state: INFO[p.rhythm].shock ? 'bad' : '' } });
        }
      });
      MT._simCleanup = stop;
    }
  });
})();
