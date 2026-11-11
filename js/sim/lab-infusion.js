/* =====================================================================
   Simulation: Infusionstherapie mit Spritzenpumpe
   Dosis-/Ratenberechnung, Anlaufverzögerung, Okklusion und Bolus
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  // Beispiel-Standardkonzentrationen (fiktive Lernwerte – Hausstandards variieren!)
  var DRUGS = {
    nor: { name: 'Noradrenalin 5 mg / 50 ml', conc: 100, cu: 'µg/ml', dose: 0.1, du: 'µg/kg/min', min: 0.01, max: 1, step: 0.01, perKgMin: true },
    prop: { name: 'Propofol 2 % (20 mg/ml)', conc: 20, cu: 'mg/ml', dose: 2, du: 'mg/kg/h', min: 0.5, max: 5, step: 0.1, perKgH: true },
    ins: { name: 'Insulin 50 IE / 50 ml', conc: 1, cu: 'IE/ml', dose: 2, du: 'IE/h', min: 0.5, max: 15, step: 0.5 },
    hep: { name: 'Heparin 25 000 IE / 50 ml', conc: 500, cu: 'IE/ml', dose: 1000, du: 'IE/h', min: 200, max: 2500, step: 50 }
  };

  MT.registerSim({
    id: 'infusion',
    title: 'Infusion',
    subtitle: 'Dosis, Förderrate, Okklusion',
    icon: '💉',
    devices: ['syringe-pump', 'infusion-pump'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var cv = MT.labUI.canvas(L.view, '16 / 9');
      var s = { drug: 'nor', weight: 80, dose: 0.1, syr: 50, slack: 0.3, occl: false, occT: 0, accVol: 0, p: 0, alarm: false, pLimit: 600, bolus: null };
      var C = L.controls, U = MT.labUI;
      var doseS;
      U.heading(C, 'Verordnung');
      U.select(C, { label: 'Medikament', value: 'nor', options: Object.keys(DRUGS).map(function (k) { return [k, DRUGS[k].name]; }), onChange: function (v) { s.drug = v; var d = DRUGS[v]; s.dose = d.dose; doseS.input.min = d.min; doseS.input.max = d.max; doseS.input.step = d.step; doseS.set(d.dose); reset(); } });
      U.slider(C, { label: 'Körpergewicht', min: 3, max: 150, value: 80, unit: 'kg', onInput: function (v) { s.weight = v; reset(); } });
      doseS = U.slider(C, { label: 'Dosis', min: 0.01, max: 1, step: 0.01, value: 0.1, fmt: function (v) { return MT.fmt(v, v < 1 ? 2 : v < 10 ? 1 : 0) + ' ' + DRUGS[s.drug].du; }, onInput: function (v) { s.dose = v; reset(); } });
      U.heading(C, 'Pumpe & System');
      U.slider(C, { label: 'Mechanisches Spiel / Systemcompliance', min: 0, max: 1, step: 0.05, value: 0.3, unit: 'ml', dec: 2, onInput: function (v) { s.slack = v; reset(); }, hint: 'Volumen, das beim Start erst „aufgefüllt“ werden muss' });
      U.slider(C, { label: 'Okklusionsalarmgrenze', min: 100, max: 1000, step: 50, value: 600, unit: 'mmHg', onInput: function (v) { s.pLimit = v; } });
      var row = MT.el('div', { class: 'row' }); C.appendChild(row);
      U.button(row, '⛔ Dreiwegehahn schließen', 'warn small', function () { if (!s.occl) { s.occl = true; s.alarm = false; s.bolus = null; } });
      U.button(row, '✋ Okklusion lösen', 'small', function () { if (s.occl) { s.occl = false; s.bolus = { vol: s.accVol, t: t }; s.accVol = 0; s.p = 0; s.alarm = false; } });
      U.button(row, '↻ Neustart', 'small ghost', function () { reset(); });

      var upd = U.readouts(L.readouts, [
        { key: 'rate', label: 'Förderrate', unit: 'ml/h' }, { key: 'conc', label: 'Konzentration', unit: '' }, { key: 'dur', label: 'Spritze reicht', unit: 'h' },
        { key: 'lag', label: 'Anlaufzeit', unit: 'min' }, { key: 'p', label: 'Leitungsdruck', unit: 'mmHg' }, { key: 'bolus', label: 'Bolus', unit: '' }
      ]);

      L.theory.innerHTML = '<h3>Rechnen und Verstehen</h3>' +
        '<p>Bei körpergewichtsbezogener Dosierung gilt (Beispiel Katecholamine):</p>' +
        '<div class="formula">Rate [ml/h] = Dosis [µg/kg/min] · Gewicht [kg] · 60 / Konzentration [µg/ml]</div>' +
        '<p>Eine Spritzenpumpe schiebt den Kolben mit konstanter Geschwindigkeit vor. Bei sehr kleinen Raten muss zunächst das <b>mechanische Spiel</b> und die Nachgiebigkeit (Compliance) von Spritze und Leitung überwunden werden – das Medikament kommt verzögert an:</p>' +
        '<div class="formula">Anlaufzeit ≈ Spielvolumen / Rate &nbsp;(z. B. 0,3 ml bei 2 ml/h → 9 min!)</div>' +
        '<p>Bei einer <b>Okklusion</b> fördert die Pumpe weiter; das Volumen staut sich in der nachgiebigen Leitung, der Druck steigt bis zur Alarmgrenze. Wird der Verschluss gelöst, ohne vorher zu entlasten, erhält der Patient das gestaute Volumen als <b>Bolus</b> – bei Katecholaminen gefährlich.</p>' +
        '<div class="callout warn">⚠️ Vor dem Öffnen einer okkludierten Leitung Druck entlasten (Herstellerfunktion bzw. Leitung zur Seite entlüften). Spritzenpumpe auf Patientenhöhe, Rückschlagventile bei Mehrfachinfusionen, Spritze korrekt im Antrieb fixieren (Siphon-Effekt!).</div>' +
        '<p class="muted" style="font-size:12px">Konzentrationen sind Lern-Beispiele; in der Praxis gelten die Standards der jeweiligen Klinik.</p>';

      var t = 0, hist = [];
      function rate() {
        var d = DRUGS[s.drug];
        if (d.perKgMin) return s.dose * s.weight * 60 / d.conc;
        if (d.perKgH) return s.dose * s.weight / d.conc;
        return s.dose / d.conc;
      }
      function reset() { t = 0; hist = []; s.occl = false; s.accVol = 0; s.p = 0; s.alarm = false; s.bolus = null; s.pushed = 0; }
      reset();

      var lineCompliance = 0.002; // ml/mmHg (vereinfachte Leitungscompliance)
      var simSpeed = 60; // 1 s Echtzeit = 1 min Simulationszeit
      var numT = 0;
      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        var r = rate(), d = DRUGS[s.drug];
        var dtm = dt * simSpeed / 60; // Simulationsminuten
        t += dtm;
        var pushed = r * dtm / 60; // ml in diesem Schritt
        var delivered = 0;
        if (s.occl) {
          if (!s.alarm) { s.accVol += pushed; s.p = s.accVol / lineCompliance; if (s.p >= s.pLimit) { s.alarm = true; MT.toast('🔔 Okklusionsalarm nach ' + MT.fmt(t - s.occT, 1) + ' min Verschluss', 'bad'); } }
        } else {
          s.occT = t;
          s.pushed += pushed;
          delivered = s.pushed > s.slack ? r : r * Math.max(0, (s.pushed / Math.max(s.slack, 1e-6)) - 0.95) * 20;
          if (s.slack === 0) delivered = r;
          delivered = Math.min(delivered, r);
        }
        var bolusRate = 0;
        if (s.bolus && t - s.bolus.t < 0.5) bolusRate = s.bolus.vol / 0.5 * 60; // in 30 s abgegeben
        hist.push({ t: t, set: s.occl && s.alarm ? 0 : r, del: delivered + bolusRate, p: s.p });
        while (hist.length && hist[0].t < t - 30) hist.shift();

        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        // Pumpe zeichnen
        var px = 20, py = 20, pw = W - 40, ph = H * 0.3;
        ctx.fillStyle = '#e6ebf0'; roundRect(ctx, px, py, pw, ph, 12); ctx.fill();
        var sx = px + 20, sy = py + ph * 0.25, sw = pw * 0.62, sh = ph * 0.32;
        var fillFrac = MT.clamp(1 - (r * t / 60) / s.syr, 0, 1);
        ctx.fillStyle = 'rgba(200,225,250,.6)'; ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = s.drug === 'prop' ? '#fff' : 'rgba(255,236,170,.95)'; ctx.fillRect(sx + sw * (1 - fillFrac), sy + 3, sw * fillFrac, sh - 6);
        ctx.strokeStyle = '#7d8894'; ctx.lineWidth = 2; ctx.strokeRect(sx, sy, sw, sh);
        ctx.fillStyle = '#5e6874'; ctx.fillRect(sx + sw * (1 - fillFrac) - 10, sy - 6, 10, sh + 12); // Kolben
        ctx.fillRect(px + 8, sy + sh / 2 - 3, sx + sw * (1 - fillFrac) - px - 18, 6); // Antrieb
        ctx.fillStyle = '#04080d'; roundRect(ctx, px + pw * 0.72, py + 14, pw * 0.25, ph * 0.5, 6); ctx.fill();
        ctx.fillStyle = s.alarm ? (Math.floor(t * 4) % 2 ? '#ff4d5e' : '#7a0d18') : '#9fffb0';
        ctx.font = '700 ' + Math.round(ph * 0.17) + 'px monospace'; ctx.textBaseline = 'middle';
        ctx.fillText(s.alarm ? 'OKKLUSION' : MT.fmt(r, r < 10 ? 1 : 0) + ' ml/h', px + pw * 0.735, py + 14 + ph * 0.18);
        ctx.font = '600 ' + Math.round(ph * 0.1) + 'px system-ui'; ctx.fillStyle = '#9fb3c8';
        ctx.fillText(d.name, px + pw * 0.735, py + 14 + ph * 0.38);
        ctx.fillStyle = '#334'; ctx.font = '600 12px system-ui';
        ctx.fillText('Spritze 50 ml · Rest ' + MT.fmt(s.syr * fillFrac, 1) + ' ml · Simulationszeit ' + MT.fmt(t, 1) + ' min (60-fach)', sx, py + ph - 14);
        // Leitung
        var ly = py + ph + 26;
        ctx.strokeStyle = s.occl ? '#ff4d5e' : '#8fc3ee'; ctx.lineWidth = 4 + Math.min(6, s.p / 150);
        ctx.beginPath(); ctx.moveTo(px + pw * 0.66, py + ph * 0.41); ctx.bezierCurveTo(px + pw * 0.8, ly, px + pw * 0.4, ly, px + 30, ly + 10); ctx.stroke();
        ctx.fillStyle = '#e0e6ec'; ctx.beginPath(); ctx.arc(px + pw * 0.45, ly + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = s.occl ? '#d62839' : '#2f7fd8'; ctx.lineWidth = 4; ctx.beginPath();
        if (s.occl) { ctx.moveTo(px + pw * 0.45 - 7, ly + 4); ctx.lineTo(px + pw * 0.45 + 7, ly + 4); } else { ctx.moveTo(px + pw * 0.45, ly - 3); ctx.lineTo(px + pw * 0.45, ly + 11); }
        ctx.stroke();
        ctx.fillStyle = '#9fb3c8'; ctx.font = '11px system-ui'; ctx.fillText('Dreiwegehahn ' + (s.occl ? 'ZU' : 'offen') + ' → Patient', px + pw * 0.45 + 14, ly + 6);
        // Diagramm
        var gx = 20, gy = H * 0.48, gw = W - 40, gh = H * 0.48;
        var hiR = Math.max(r * 2.2, 1), now = t;
        MT.labUI.plotFrame(ctx, gx, gy, gw, gh, { title: 'Förderrate am Patienten (cyan) vs. eingestellt (gelb) · Leitungsdruck (rot) · letzte 30 min', color: '#9fb3c8', max: MT.fmt(hiR, 1) + ' ml/h', min: '0' });
        function line(key, col, scale) {
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
          hist.forEach(function (h, i) { var x = gx + gw * (1 - (now - h.t) / 30), y = gy + gh - MT.clamp(h[key] / scale, 0, 1) * gh; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
          ctx.stroke();
        }
        line('set', '#ffd84a', hiR); line('del', '#3fe0ff', hiR); line('p', 'rgba(255,77,94,.8)', s.pLimit * 1.1);
        var ly2 = gy + gh - (s.pLimit / (s.pLimit * 1.1)) * gh;
        ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,77,94,.5)'; ctx.beginPath(); ctx.moveTo(gx, ly2); ctx.lineTo(gx + gw, ly2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,77,94,.8)'; ctx.textAlign = 'right'; ctx.fillText('Okklusions-Alarmgrenze', gx + gw - 4, ly2 + 14); ctx.textAlign = 'left';

        numT -= dt;
        if (numT <= 0) {
          numT = 0.3;
          var bolusDrug = s.bolus ? s.bolus.vol * d.conc : (s.occl ? s.accVol * d.conc : 0);
          var unit = d.cu.split('/')[0];
          upd({
            rate: MT.fmt(r, r < 10 ? 2 : 1), conc: MT.fmt(d.conc, 0) + ' ' + d.cu, dur: MT.fmt(s.syr / r, 1),
            lag: { v: s.slack ? MT.fmt(s.slack / r * 60, 1) : '0', state: s.slack / r * 60 > 5 ? 'warn' : '' },
            p: { v: MT.fmt(s.p, 0), state: s.alarm ? 'bad' : s.p > 0 ? 'warn' : '' },
            bolus: { v: s.bolus ? MT.fmt(s.bolus.vol, 2) + ' ml = ' + MT.fmt(bolusDrug, 1) + ' ' + unit : (s.occl ? 'gestaut ' + MT.fmt(s.accVol, 2) + ' ml' : '–'), state: s.bolus && s.bolus.vol > 0.05 ? 'bad' : '' }
          });
        }
      });
      MT._simCleanup = stop;
    }
  });

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  MT.roundRect = roundRect;
})();
