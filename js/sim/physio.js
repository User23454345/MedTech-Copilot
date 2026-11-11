/* =====================================================================
   Physiologisches Modell (vereinfacht, aber nachvollziehbar)
   - Gasaustausch: alveoläre Gasgleichung, alveoläre Ventilation
   - O2-Bindungskurve: Severinghaus-Gleichung mit P50-Verschiebung
   - Signalgeneratoren: EKG (Gauß-Summen-Modell), Pleth, arterieller Druck,
     Kapnogramm
   Alle Werte dienen ausschließlich Lernzwecken.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  function gauss(x, mu, sigma) { var d = (x - mu) / sigma; return Math.exp(-0.5 * d * d); }

  var physio = (MT.physio = {});

  /* ---------- Sauerstoffbindungskurve ---------- */
  // Severinghaus (1979): SO2 = 100 / (23400/(PO2^3 + 150·PO2) + 1)
  // Rechtsverschiebung (Azidose, Fieber, 2,3-BPG) über P50: PO2_virtual = PO2 · 26,8 / P50
  physio.so2 = function (po2, p50) {
    var p = Math.max(0.1, po2) * (26.8 / (p50 || 26.8));
    return 100 / (23400 / (p * p * p + 150 * p) + 1);
  };
  // Näherung des P50 aus pH, Temperatur (Bohr-Effekt, Temperatureffekt)
  physio.p50 = function (pH, tempC) {
    var lg = Math.log10(26.8) - 0.48 * ((pH || 7.4) - 7.4) + 0.024 * ((tempC || 37) - 37);
    return Math.pow(10, lg);
  };

  /* ---------- Gasaustausch ---------- */
  // Eingaben: fio2 (0.21–1), vt (ml), rr (/min), vd (Totraum ml), vco2 (ml/min),
  // shunt (0–0.5, Anteil), peep (cmH2O – verbessert Rekrutierung → reduziert Shunt)
  physio.gasExchange = function (p) {
    var patm = p.patm || 760, ph2o = 47;
    var va = Math.max(0.2, ((p.vt || 500) - (p.vd || 150)) * (p.rr || 12) / 1000); // L/min
    var vco2 = p.vco2 || 200;
    var paco2 = MT.clamp(0.863 * vco2 / va, 12, 140);
    var fio2 = MT.clamp(p.fio2 || 0.21, 0.21, 1);
    var pao2Alv = fio2 * (patm - ph2o) - paco2 / 0.8; // alveolärer PO2
    // Shunt-Modell: PEEP rekrutiert bis zu ~60 % des krankheitsbedingten Shunts (stark vereinfacht)
    var recruit = MT.clamp(((p.peep || 5) - 5) / 15, -0.3, 1) * 0.6;
    var shunt = MT.clamp((p.shunt || 0.05) * (1 - recruit), 0.02, 0.6);
    // Mischung: kapilläres Blut (voll aequilibriert) + Shuntblut (gemischt-venös, SvO2 ~ 70 %)
    var p50 = physio.p50(p.pH, p.temp);
    var scap = physio.so2(pao2Alv, p50);
    var svo2 = p.svo2 || 70;
    var sa = (1 - shunt) * scap + shunt * svo2;
    // Rückrechnung PaO2 aus Sättigung (numerische Inversion)
    var lo = 1, hi = 700;
    for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (physio.so2(mid, p50) < sa) lo = mid; else hi = mid; }
    var pao2 = sa > 99.5 ? Math.max((lo + hi) / 2, pao2Alv * (1 - shunt * 2.2)) : (lo + hi) / 2;
    // pH (Henderson-Hasselbalch, HCO3 24 mmol/l)
    var hco3 = p.hco3 || 24;
    var pH = 6.1 + Math.log10(hco3 / (0.0307 * paco2));
    return {
      va: va, mv: (p.vt || 500) * (p.rr || 12) / 1000,
      paco2: paco2, etco2: Math.max(0, paco2 - (p.vd ? 3 + p.vd / 50 : 4)),
      pAO2: pao2Alv, pao2: pao2, sao2: sa, shunt: shunt, pH: pH, p50: p50,
      horowitz: pao2 / fio2
    };
  };

  /* ---------- Atemmechanik (Bewegungsgleichung) ---------- */
  // Paw(t) = V(t)/C + R·V'(t) + PEEP
  // Volumenkontrolliert (konstanter Flow) oder druckkontrolliert (exponentielles Füllen, τ = R·C)
  physio.ventCycle = function (s, t) {
    // s: {mode:'VC'|'PC', vt (ml), pinsp (cmH2O über PEEP), peep, rr, ie (I:E als Zahl, z. B. 0.5 = 1:2),
    //     c (ml/cmH2O), r (cmH2O/L/s), pause (Anteil der Ti als endinspir. Pause, nur VC)}
    var Tc = 60 / s.rr;
    var Ti = Tc * s.ie / (1 + s.ie);
    var Te = Tc - Ti;
    var C = s.c / 1000;            // L/cmH2O
    var R = s.r;                   // cmH2O/(L/s)
    var tau = R * C;               // s
    var tc = ((t % Tc) + Tc) % Tc;
    var P, F, V, vtEff;
    if (s.mode === 'PC') {
      var dP = s.pinsp;
      vtEff = dP * C * (1 - Math.exp(-Ti / tau)) * 1000;
      if (tc < Ti) {
        V = dP * C * (1 - Math.exp(-tc / tau));
        F = (dP / R) * Math.exp(-tc / tau);
        P = s.peep + dP;
        // realistischer Anstieg (Rampe 80 ms)
        if (tc < 0.08) P = s.peep + dP * (tc / 0.08);
      } else {
        var te = tc - Ti;
        var V0 = vtEff / 1000;
        V = V0 * Math.exp(-te / tau);
        F = -(V0 / tau) * Math.exp(-te / tau);
        P = s.peep;
      }
    } else {
      var pauseT = Ti * (s.pause || 0.2);
      var flowT = Ti - pauseT;
      var flow = (s.vt / 1000) / flowT; // L/s
      vtEff = s.vt;
      if (tc < flowT) {
        V = flow * tc; F = flow; P = s.peep + V / C + R * F;
      } else if (tc < Ti) {
        V = s.vt / 1000; F = 0; P = s.peep + V / C;
      } else {
        var te2 = tc - Ti;
        var V1 = s.vt / 1000;
        V = V1 * Math.exp(-te2 / tau);
        F = -(V1 / tau) * Math.exp(-te2 / tau);
        P = s.peep;
      }
    }
    return { p: P, flow: F * 60, vol: V * 1000, phase: tc < Ti ? 'insp' : 'exp', ti: Ti, te: Te, vtEff: vtEff, tau: tau };
  };

  // Kennzahlen eines Beatmungsmusters
  physio.ventMetrics = function (s) {
    var C = s.c / 1000, R = s.r, Tc = 60 / s.rr, Ti = Tc * s.ie / (1 + s.ie), Te = Tc - Ti, tau = R * C;
    var vt, ppeak, pplat;
    if (s.mode === 'PC') {
      vt = s.pinsp * C * (1 - Math.exp(-Ti / tau)) * 1000;
      ppeak = s.peep + s.pinsp; pplat = s.peep + vt / 1000 / C;
    } else {
      vt = s.vt;
      var flowT = Ti * (1 - (s.pause || 0.2));
      var flow = (vt / 1000) / flowT;
      pplat = s.peep + vt / 1000 / C; ppeak = pplat + R * flow;
    }
    // Auto-PEEP-Risiko: Exspirationszeit < 3·τ
    var trapped = Math.exp(-Te / tau);
    return {
      vt: vt, mv: vt * s.rr / 1000, ppeak: ppeak, pplat: pplat, driving: pplat - s.peep,
      tau: tau, ti: Ti, te: Te, autoPeepRisk: Te < 3 * tau, trappedFraction: trapped,
      ieText: '1:' + MT.fmt(1 / s.ie, 1)
    };
  };

  /* ---------- EKG-Generator ---------- */
  // Rhythmen: sinus, afib, aflutter, vt, vf, asystole, stemi, avb3, pea
  physio.RHYTHMS = {
    sinus: 'Sinusrhythmus', afib: 'Vorhofflimmern', aflutter: 'Vorhofflattern',
    vt: 'Ventrikuläre Tachykardie', vf: 'Kammerflimmern', asystole: 'Asystolie',
    stemi: 'Sinusrhythmus mit ST-Hebung', avb3: 'AV-Block III°', pea: 'PEA (pulslose elektrische Aktivität)',
    paced: 'Schrittmacher-Rhythmus'
  };
  physio.SHOCKABLE = { vf: true, vt: true };

  physio.createSignalSource = function (state) {
    // state: Referenz auf Patientenzustand (hr, rhythm, sys, dia, rr, etco2, ...)
    var beats = [];      // {t, type:'n'|'v'|'p', pulse:bool}
    var pWaves = [];     // separate P-Wellen (AV-Block)
    var nextBeat = 0.3, nextP = 0.1;
    var vfPhase = Math.random() * 10;
    var lastT = 0;
    var src = { lastBeatT: -10, onBeat: null };

    function schedule(t) {
      var hr = Math.max(1, state.hr);
      var rr = 60 / hr;
      while (nextBeat < t + 2) {
        var r = state.rhythm;
        var type = 'n', pulse = true, interval = rr;
        if (r === 'afib') { interval = rr * (0.65 + Math.random() * 0.7); }
        else if (r === 'vt') { type = 'v'; interval = 60 / Math.max(hr, 140); pulse = !!state.vtPulse; }
        else if (r === 'avb3') { type = 'v'; interval = 60 / Math.min(hr, 40); }
        else if (r === 'paced') { type = 'p'; }
        else if (r === 'pea') { pulse = false; }
        else if (r === 'sinus' || r === 'stemi') { interval = rr * (1 + (Math.random() - 0.5) * 0.04); }
        if (r === 'vf' || r === 'asystole') { nextBeat = t + 2; break; }
        beats.push({ t: nextBeat, type: type, pulse: pulse && state.rhythm !== 'pea' });
        nextBeat += interval;
      }
      while (nextP < t + 2) { pWaves.push(nextP); nextP += 60 / 78; }
      while (beats.length && beats[0].t < t - 3) beats.shift();
      while (pWaves.length && pWaves[0] < t - 3) pWaves.shift();
    }

    // EKG-Komplex relativ zur R-Zacke (Sekunden), Amplituden in mV
    function complex(dt, b, rrSec) {
      var tScale = Math.sqrt(Math.min(1.5, Math.max(0.35, rrSec))); // QT-Anpassung (Bazett-ähnlich)
      var v = 0;
      if (b.type === 'v') {
        // breiter, deformierter Kammerkomplex
        v += 1.4 * gauss(dt, 0.0, 0.035) - 0.6 * gauss(dt, 0.08, 0.04) - 0.35 * gauss(dt, 0.28 * tScale, 0.07);
        return v;
      }
      if (b.type === 'p') {
        v += -0.9 * gauss(dt, -0.012, 0.0015); // Schrittmacher-Spike
        v += 1.1 * gauss(dt, 0.03, 0.03) - 0.4 * gauss(dt, 0.1, 0.035) - 0.3 * gauss(dt, 0.3 * tScale, 0.06);
        return v;
      }
      var r = state.rhythm;
      if (r !== 'afib' && r !== 'aflutter' && r !== 'avb3') v += 0.12 * gauss(dt, -0.17, 0.024); // P
      v += -0.1 * gauss(dt, -0.028, 0.009);   // Q
      v += 1.1 * gauss(dt, 0, 0.010);        // R
      v += -0.28 * gauss(dt, 0.028, 0.010);   // S
      v += 0.28 * gauss(dt, 0.26 * tScale, 0.055); // T
      if (r === 'stemi') v += 0.32 * gauss(dt, 0.11 * tScale, 0.06) + 0.12 * gauss(dt, 0.2 * tScale, 0.05);
      return v;
    }

    src.ecg = function (t) {
      if (t < lastT - 1) { beats = []; pWaves = []; nextBeat = t + 0.3; nextP = t + 0.1; }
      lastT = t;
      schedule(t);
      if (state.ecgLeadOff) return 0;
      var r = state.rhythm, v = 0;
      if (r === 'vf') {
        vfPhase += 0;
        var amp = state.vfAmp != null ? state.vfAmp : 0.45;
        v = amp * (Math.sin(2 * Math.PI * 4.7 * t + vfPhase) * 0.6 + Math.sin(2 * Math.PI * 6.1 * t + 1.3) * 0.35 + Math.sin(2 * Math.PI * 2.9 * t) * 0.25) * (0.7 + 0.3 * Math.sin(0.9 * t));
      } else if (r === 'asystole') {
        v = 0.02 * Math.sin(2 * Math.PI * 0.3 * t);
      } else {
        for (var i = 0; i < beats.length; i++) {
          var dt = t - beats[i].t;
          if (dt > -0.3 && dt < 0.7) {
            var rrSec = i > 0 ? beats[i].t - beats[i - 1].t : 60 / Math.max(1, state.hr);
            v += complex(dt, beats[i], rrSec);
          }
        }
        if (r === 'afib') v += 0.04 * Math.sin(2 * Math.PI * 6.3 * t) + 0.025 * Math.sin(2 * Math.PI * 8.9 * t + 1);
        if (r === 'aflutter') { var ph = (t * 5) % 1; v += -0.15 * (ph < 0.8 ? ph / 0.8 : (1 - ph) / 0.2) + 0.07; }
        if (r === 'avb3') { for (var k = 0; k < pWaves.length; k++) v += 0.14 * gauss(t - pWaves[k], 0, 0.025); }
      }
      // Rauschen und Bewegungsartefakt
      v += (Math.random() - 0.5) * 0.02 + (state.motionArtifact ? 0.4 * Math.sin(2 * Math.PI * 1.7 * t) * Math.sin(2 * Math.PI * 0.4 * t) + (Math.random() - 0.5) * 0.25 : 0);
      return v;
    };

    // Puls-Kurvenform (normiert 0..1), Zeit dt nach R-Zacke, mit Pulslaufzeit
    function pulseShape(dt, damping) {
      if (dt < 0) return 0;
      var v = gauss(dt, 0.12, 0.05) * 1.0 + gauss(dt, 0.31, 0.07) * 0.45;
      if (damping === 'under') v += 0.35 * Math.exp(-dt * 14) * Math.sin(2 * Math.PI * 14 * Math.max(0, dt - 0.06)) * (dt > 0.06 ? 1 : 0);
      return v;
    }
    function pulseSum(t, delay, damping) {
      var v = 0;
      for (var i = 0; i < beats.length; i++) {
        if (!beats[i].pulse) continue;
        var dt = t - beats[i].t - delay;
        if (dt > -0.05 && dt < 1.2) v += pulseShape(dt, damping);
      }
      // Diastolischer Abfall (Windkessel) – normiert
      return Math.min(1.25, v);
    }

    src.pleth = function (t) {
      if (state.spo2Probe === 'off') return 0.02 * Math.sin(t * 3);
      var hasPulse = state.rhythm !== 'vf' && state.rhythm !== 'asystole' && state.rhythm !== 'pea' && !(state.rhythm === 'vt' && !state.vtPulse);
      if (!hasPulse) return 0.02 * Math.sin(t * 2);
      var perf = state.perfusion != null ? state.perfusion : 1;
      var v = pulseSum(t, 0.22, 'normal') * perf;
      if (state.motionArtifact) v += 0.5 * Math.sin(2 * Math.PI * 1.3 * t) * Math.sin(2 * Math.PI * 0.35 * t);
      return v;
    };

    var dampState = 0;
    src.art = function (t) {
      var hasPulse = state.rhythm !== 'vf' && state.rhythm !== 'asystole' && state.rhythm !== 'pea' && !(state.rhythm === 'vt' && !state.vtPulse);
      var offset = (state.transducerOffsetCm || 0) * -0.74; // Wandler zu hoch → Druck zu niedrig
      if (!hasPulse) return MT.lerp(dampState || 20, 18, 0.01) + offset;
      var sys = state.sys, dia = state.dia;
      var shape = pulseSum(t, 0.18, state.artDamping === 'under' ? 'under' : 'normal');
      var target = dia + (sys - dia) * MT.clamp(shape, 0, 1.3) / 1.0;
      if (state.artDamping === 'over') { dampState = dampState ? MT.lerp(dampState, target, 0.06) : target; return dampState + offset; }
      dampState = target;
      return target + offset;
    };

    src.co2 = function (t) {
      var rr = Math.max(1, state.rr);
      var Tc = 60 / rr, tc = t % Tc, ti = Tc * 0.33;
      if (state.tubeDisconnect || state.apnea) return 0.5 * Math.random();
      if (tc < ti) {
        // Inspiration: steiler Abfall auf 0
        var f = Math.min(1, tc / 0.12);
        return state.etco2 * (1 - f) * (tc < 0.12 ? 1 : 0);
      }
      var te = tc - ti, tExp = Tc - ti;
      var rise = state.bronchospasm ? 0.55 * tExp : 0.12;
      var v = te < rise ? (state.bronchospasm ? Math.pow(te / rise, 0.55) : (te / rise)) : 1;
      var plateau = 0.92 + 0.08 * Math.min(1, te / tExp);
      return state.etco2 * Math.min(1, v) * plateau * (state.bronchospasm ? 1 : 1);
    };

    src.resp = function (t) { // Impedanz-Atemkurve
      var rr = Math.max(1, state.rr);
      if (state.apnea || state.tubeDisconnect) return 0;
      return Math.sin(2 * Math.PI * t * rr / 60);
    };

    src.beats = function () { return beats; };
    return src;
  };

  /* ---------- Standard-Patientenzustand (fiktiv) ---------- */
  physio.createPatient = function (over) {
    var p = {
      label: 'Lernpatient (fiktiv)',
      hr: 78, rhythm: 'sinus', spo2: 96, sys: 124, dia: 72, rr: 14, etco2: 37, temp: 37.2,
      perfusion: 1, artDamping: 'normal', transducerOffsetCm: 0,
      ecgLeadOff: false, spo2Probe: 'ok', motionArtifact: false, tubeDisconnect: false, apnea: false, bronchospasm: false,
      vtPulse: false, cvp: 8, nibpSys: 122, nibpDia: 70
    };
    if (over) Object.keys(over).forEach(function (k) { p[k] = over[k]; });
    return p;
  };
  physio.map = function (sys, dia) { return dia + (sys - dia) / 3; };
})();
