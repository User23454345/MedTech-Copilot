/* =====================================================================
   Simulation: Defibrillation & Kardioversion
   Kondensatorentladung (E = ½CU²), biphasischer Impuls, Impedanz,
   Synchronisation auf die R-Zacke. Erfolgswahrscheinlichkeit = Lehrmodell.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  var CAP = 150e-6; // F – typische Größenordnung (Lehrwert)

  MT.registerSim({
    id: 'defibrillation',
    title: 'Defibrillation',
    subtitle: 'Energie, Impedanz, Synchronisation',
    icon: '⚡',
    devices: ['defibrillator'],
    mount: function (host) {
      var L = MT.labUI.layout(host);
      var cv = MT.labUI.canvas(L.view, '16 / 5');
      var cv2 = MT.labUI.canvas(L.view, '16 / 6');
      var p = MT.physio.createPatient({ rhythm: 'vf', hr: 0 });
      var src = MT.physio.createSignalSource(p);
      var s = { energy: 150, imp: 80, sync: false, charged: false, charging: 0, lastShock: null, phase: 'biphasic', log: [] };
      var C = L.controls, U = MT.labUI;
      U.select(C, { label: 'Ausgangsrhythmus (Lernfall)', value: 'vf', options: [['vf', 'Kammerflimmern (pulslos)'], ['vt', 'Pulslose ventrikuläre Tachykardie'], ['afib', 'Vorhofflimmern (stabil, Kardioversion)'], ['asystole', 'Asystolie'], ['sinus', 'Sinusrhythmus']], onChange: function (v) { p.rhythm = v; p.hr = { vf: 0, vt: 190, afib: 130, asystole: 0, sinus: 75 }[v]; s.charged = false; s.lastShock = null; info(); } });
      U.slider(C, { label: 'Energie', min: 2, max: 360, step: 1, value: s.energy, unit: 'J', onInput: function (v) { s.energy = v; s.charged = false; } });
      U.slider(C, { label: 'Thoraximpedanz', min: 25, max: 180, value: s.imp, unit: 'Ω', onInput: function (v) { s.imp = v; }, hint: 'Hängt von Pad-Kontakt, Pad-Größe, Thoraxgröße, Atemphase ab' });
      U.seg(C, { label: 'Impulsform', value: 'biphasic', options: [['biphasic', 'biphasisch'], ['mono', 'monophasisch']], onChange: function (v) { s.phase = v; } });
      var syncSeg = U.seg(C, { label: 'Synchronisation', value: 'off', options: [['off', 'aus (Defibrillation)'], ['on', 'SYNC (Kardioversion)']], onChange: function (v) { s.sync = v === 'on'; } });
      var row = MT.el('div', { class: 'row' }); C.appendChild(row);
      U.button(row, '⚡ Laden', 'warn', function () { if (!s.charging) { s.charging = t; s.charged = false; } });
      var shockBtn = U.button(row, '🔴 Schock', 'danger', function () { shock(); });
      var box = MT.el('div', { class: 'callout' }); C.appendChild(box);
      var logBox = MT.el('div', { style: 'font-size:12.5px;max-height:140px;overflow:auto' }); C.appendChild(logBox);

      function info() {
        var r = p.rhythm;
        box.innerHTML = r === 'vf' || r === 'vt' ? '<b>Defibrillierbarer Rhythmus.</b> Unsynchronisierter Schock (biphasisch typ. 150–200 J, herstellerabhängig), danach sofort Herzdruckmassage für 2 min.' :
          r === 'afib' ? '<b>Kardioversion:</b> Patient hat einen Puls. Schock MUSS synchronisiert auf die R-Zacke erfolgen (SYNC an), Sedierung/Analgesie erforderlich.' :
          r === 'asystole' ? '<b>Nicht defibrillierbar.</b> Ein Schock bringt nichts – Reanimation und Medikamente.' : '<b>Kein Schock indiziert.</b> Organisierter Rhythmus mit Puls.';
      }
      info();

      var upd = U.readouts(L.readouts, [
        { key: 'u', label: 'Ladespannung', unit: 'V' }, { key: 'ipk', label: 'Spitzenstrom', unit: 'A' }, { key: 'tau', label: 'τ = R·C', unit: 'ms' },
        { key: 'state', label: 'Status', unit: '' }, { key: 'res', label: 'Ergebnis', unit: '' }
      ]);

      L.theory.innerHTML = '<h3>Physik des Defibrillators</h3>' +
        '<p>Ein Kondensator speichert die Energie:</p><div class="formula">E = ½ · C · U² &nbsp;⇒&nbsp; U = √(2E / C)</div>' +
        '<p>Bei der Entladung über die Thoraximpedanz R fällt der Strom exponentiell ab:</p><div class="formula">I(t) = (U / R) · e<sup>−t / (R·C)</sup></div>' +
        '<p>Entscheidend für den Erfolg ist der <b>Strom durch das Myokard</b> (eine kritische Masse muss gleichzeitig depolarisiert werden), nicht die Energie allein. Moderne Geräte messen die Impedanz und passen Dauer bzw. Spannung an (<b>Impedanzkompensation</b>). Der <b>biphasische</b> Impuls kehrt nach einigen Millisekunden die Polarität um und erreicht mit weniger Energie ähnliche oder bessere Erfolgsraten als der ältere monophasische Impuls.</p>' +
        '<p><b>Synchronisation:</b> Bei der Kardioversion wird der Schock auf die R-Zacke getriggert. Ein Schock in die vulnerable Phase (aufsteigende T-Welle) kann Kammerflimmern auslösen. Bei Kammerflimmern gibt es keine R-Zacken – im SYNC-Modus würde der Schock nicht ausgelöst.</p>' +
        '<div class="callout warn">⚠️ Sicherheit: „Alle weg!“, kein Kontakt zu Bett/Patient, O₂-Quelle entfernen, Pads nicht über Schrittmacher/Pflaster, trockene Haut. Diese Simulation nutzt ein vereinfachtes Wahrscheinlichkeitsmodell.</div>';

      function voltage() { return Math.sqrt(2 * s.energy / CAP); }
      function curve(tms) {
        // gibt Strom in A zu Zeit t (ms)
        var U0 = voltage(), R = s.imp, tau = R * CAP * 1000;
        if (s.phase === 'mono') return (U0 / R) * Math.exp(-tms / tau) * (tms < 12 ? 1 : Math.exp(-(tms - 12) / 2));
        var d1 = Math.min(10, Math.max(4, 6 * R / 80)), d2 = d1 * 0.66; // Impedanzkompensation (vereinfacht)
        if (tms < d1) return (U0 / R) * Math.exp(-tms / tau);
        if (tms < d1 + d2) { var Ud = U0 * Math.exp(-d1 / tau); return -(Ud / R) * Math.exp(-(tms - d1) / tau); }
        return 0;
      }
      function peak() { return voltage() / s.imp; }

      function shock() {
        if (!s.charged) { MT.toast('Zuerst laden!', 'bad'); return; }
        if (s.sync) {
          var b = src.beats().filter(function (x) { return x.t > t; })[0];
          if (!b || p.rhythm === 'vf' || p.rhythm === 'asystole') { addLog('SYNC: keine R-Zacke erkannt – Schock wird NICHT abgegeben.'); MT.toast('SYNC: Keine R-Zacke – kein Schock', 'bad'); return; }
          s.pending = b.t + 0.02;
          addLog('SYNC: Schock wird auf die nächste R-Zacke ausgelöst …');
          return;
        }
        deliver(false);
      }
      function deliver(synced) {
        s.charged = false; s.lastShock = t;
        var r = p.rhythm, ip = peak() * (s.phase === 'mono' ? 0.75 : 1);
        var ok = false, msg;
        if (r === 'vf' || r === 'vt') {
          var I50 = 13, prob = 1 / (1 + Math.exp(-(ip - I50) / 2.5)) * 0.92;
          ok = Math.random() < prob;
          msg = ok ? 'Schock erfolgreich → organisierter Rhythmus (ROSC möglich). Sofort Thoraxkompressionen fortsetzen, dann Rhythmuskontrolle.' : 'Rhythmus persistiert (Erfolgswahrscheinlichkeit im Modell ' + Math.round(prob * 100) + ' %). Weiter CPR, nächster Schock nach 2 min.';
          if (ok) { p.rhythm = 'sinus'; p.hr = 95; }
        } else if (r === 'afib') {
          if (!synced) { msg = '⚠️ UNSYNCHRONISIERTER Schock bei Patient mit Puls: Gefahr, Kammerflimmern auszulösen!'; if (Math.random() < 0.5) { p.rhythm = 'vf'; p.hr = 0; msg += ' → Kammerflimmern ausgelöst!'; } }
          else { var pr2 = 1 / (1 + Math.exp(-(ip - 9) / 2.5)) * 0.9; ok = Math.random() < pr2; msg = ok ? 'Kardioversion erfolgreich → Sinusrhythmus.' : 'Vorhofflimmern persistiert (Modell-Erfolg ' + Math.round(pr2 * 100) + ' %).'; if (ok) { p.rhythm = 'sinus'; p.hr = 80; } }
        } else if (r === 'asystole') { msg = 'Kein Effekt – Asystolie ist nicht defibrillierbar.'; }
        else { msg = '⚠️ Schock bei organisiertem Rhythmus – nicht indiziert!'; }
        addLog(Math.round(s.energy) + ' J, ' + Math.round(s.imp) + ' Ω, Ipeak ' + MT.fmt(ip, 1) + ' A: ' + msg);
        upd({ res: { v: ok ? 'Erfolg' : '—', state: ok ? '' : 'warn' } });
        info();
      }
      function addLog(m) { s.log.unshift(m); logBox.innerHTML = s.log.slice(0, 6).map(function (l) { return '<div style="border-top:1px solid var(--line);padding:4px 0">' + MT.esc(l) + '</div>'; }).join(''); }

      var t = 0, buf = [], wx = 0, lastW = 0, numT = 0;
      var stop = MT.addTicker(function (dt) {
        if (!cv.isConnected) return;
        var S = MT.setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
        if (W !== lastW) { lastW = W; buf = new Array(W).fill(NaN); wx = 0; }
        var pps = W / 6, steps = Math.max(1, Math.round(dt * pps));
        if (s.charging && t - s.charging > 3 + s.energy / 200 * 2) { s.charging = 0; s.charged = true; MT.toast('Geladen: ' + Math.round(s.energy) + ' J – Schock bereit'); }
        for (var i = 0; i < steps; i++) {
          t += 1 / pps;
          var v = src.ecg(t);
          if (s.lastShock != null && t - s.lastShock < 0.15) v = 1.6 * Math.sign(Math.sin(t * 90)); // Schockartefakt
          buf[wx] = v; wx = (wx + 1) % W;
          for (var g = 1; g < 8; g++) buf[(wx + g) % W] = NaN;
          if (s.pending && t >= s.pending) { s.pending = null; deliver(true); }
        }
        ctx.fillStyle = '#060c13'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#3cff7a'; ctx.font = '600 12px system-ui'; ctx.textBaseline = 'top';
        ctx.fillText('EKG über Pads · ' + MT.physio.RHYTHMS[p.rhythm] + (s.sync ? ' · SYNC' : ''), 8, 6);
        ctx.strokeStyle = '#3cff7a'; ctx.lineWidth = 2; ctx.beginPath(); var pen = false;
        for (var x = 0; x < W; x++) { var vv = buf[x]; if (vv !== vv) { pen = false; continue; } var y = H * 0.62 - vv * H * 0.3; if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); }
        ctx.stroke();
        if (s.sync) { // Sync-Marker auf R-Zacken
          ctx.fillStyle = '#fff';
          src.beats().forEach(function (b) { var age = t - b.t; if (age >= 0 && age < 6) { var bx = (wx - age * pps + W * 10) % W; ctx.beginPath(); ctx.moveTo(bx, 24); ctx.lineTo(bx - 5, 16); ctx.lineTo(bx + 5, 16); ctx.fill(); } });
        }
        if (s.charging || s.charged) {
          var frac = s.charged ? 1 : MT.clamp((t - s.charging) / (3 + s.energy / 200 * 2), 0, 1);
          ctx.fillStyle = 'rgba(255,212,0,.25)'; ctx.fillRect(W - 180, 8, 170 * frac, 18); ctx.strokeStyle = '#ffd400'; ctx.strokeRect(W - 180, 8, 170, 18);
          ctx.fillStyle = '#ffd400'; ctx.fillText(s.charged ? 'GELADEN ' + Math.round(s.energy) + ' J' : 'Lädt …', W - 172, 11);
        }
        // Impulskurve
        var S2 = MT.setupCanvas(cv2), c2 = S2.ctx, W2 = S2.w, H2 = S2.h;
        c2.fillStyle = '#060c13'; c2.fillRect(0, 0, W2, H2);
        var x0 = 50, w = W2 - 70, y0 = 24, h = H2 - 50, ipk = peak(), imax = Math.max(60, Math.ceil(ipk / 10) * 10);
        MT.labUI.plotFrame(c2, x0, y0, w, h, { title: 'Stromverlauf des Schocks (A) – ' + (s.phase === 'biphasic' ? 'biphasisch, trunkiert exponentiell' : 'monophasisch, gedämpft'), color: '#ffd84a', max: '+' + imax + ' A', min: '−' + imax + ' A', zero: y0 + h / 2 });
        c2.strokeStyle = '#ffd84a'; c2.lineWidth = 2.5; c2.beginPath();
        for (var k = 0; k <= 400; k++) { var tms = k / 400 * 20, I = curve(tms), xx = x0 + w * tms / 20, yy = y0 + h / 2 - I / imax * h / 2; if (!k) c2.moveTo(xx, yy); else c2.lineTo(xx, yy); }
        c2.stroke();
        c2.fillStyle = '#9fb3c8'; c2.font = '11px system-ui'; c2.textAlign = 'center';
        for (var ms = 0; ms <= 20; ms += 5) c2.fillText(ms + ' ms', x0 + w * ms / 20, y0 + h + 6);
        c2.textAlign = 'left';
        numT -= dt;
        if (numT <= 0) { numT = 0.25; upd({ u: MT.fmt(voltage(), 0), ipk: { v: MT.fmt(ipk, 1), state: ipk < 10 ? 'warn' : '' }, tau: MT.fmt(s.imp * CAP * 1000, 1), state: { v: s.charged ? 'GELADEN' : s.charging ? 'lädt' : 'bereit', state: s.charged ? 'warn' : '' } }); }
        shockBtn.disabled = !s.charged;
      });
      MT._simCleanup = stop;
    }
  });
})();
