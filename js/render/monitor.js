/* =====================================================================
   Patientenmonitor (Canvas): Kurven im Sweep-Modus, Messwerte, Alarmsystem
   Alarmprioritäten angelehnt an IEC 60601-1-8 (hoch / mittel / niedrig)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  var COLORS = {
    ecg: '#3cff7a', pleth: '#3fe0ff', art: '#ff4d5e', co2: '#ffd84a', resp: '#f5f5f5', cvp: '#5aa8ff',
    bg: '#04080d', grid: 'rgba(80,120,140,0.10)', label: '#9fb3c8'
  };

  var DEFAULT_LIMITS = {
    hr: [50, 120], spo2: [90, 101], sys: [90, 160], map: [65, 110], etco2: [28, 48], rr: [8, 30]
  };

  // Alarmbewertung – liefert Liste aktiver Alarme {id, prio, text, kind:'phys'|'tech'}
  MT.evaluateAlarms = function (p, limits) {
    var L = limits || p.limits || DEFAULT_LIMITS;
    var a = [];
    var noPulse = p.rhythm === 'vf' || p.rhythm === 'asystole' || p.rhythm === 'pea' || (p.rhythm === 'vt' && !p.vtPulse);
    if (!p.ecgLeadOff) {
      if (p.rhythm === 'vf') a.push({ id: 'vf', prio: 'high', text: 'KAMMERFLIMMERN', kind: 'phys' });
      else if (p.rhythm === 'asystole') a.push({ id: 'asys', prio: 'high', text: 'ASYSTOLIE', kind: 'phys' });
      else if (p.rhythm === 'vt') a.push({ id: 'vt', prio: 'high', text: 'V-TACH', kind: 'phys' });
    } else {
      a.push({ id: 'leadoff', prio: 'medium', text: 'EKG ABLEITUNG PRÜFEN', kind: 'tech' });
    }
    if (p.rhythm === 'pea') {
      a.push({ id: 'pea', prio: 'high', text: 'KEIN PULS (ART)', kind: 'phys' });
    }
    if (!noPulse && !p.ecgLeadOff) {
      if (p.hr < L.hr[0]) a.push({ id: 'hrlo', prio: p.hr < 40 ? 'high' : 'medium', text: 'HF NIEDRIG ' + Math.round(p.hr), kind: 'phys' });
      if (p.hr > L.hr[1]) a.push({ id: 'hrhi', prio: p.hr > 150 ? 'high' : 'medium', text: 'HF HOCH ' + Math.round(p.hr), kind: 'phys' });
      if (p.rhythm === 'afib') a.push({ id: 'afib', prio: 'low', text: 'ARRHYTHMIE: VHF', kind: 'phys' });
      if (p.rhythm === 'stemi') a.push({ id: 'st', prio: 'medium', text: 'ST-HEBUNG II', kind: 'phys' });
    }
    if (p.spo2Probe === 'off') a.push({ id: 'spo2off', prio: 'medium', text: 'SpO₂ SENSOR AB', kind: 'tech' });
    else if (p.motionArtifact) a.push({ id: 'spo2art', prio: 'low', text: 'SpO₂ ARTEFAKT', kind: 'tech' });
    else if (!noPulse) {
      if (p.spo2 < 85) a.push({ id: 'spo2lolo', prio: 'high', text: 'SpO₂ NIEDRIG ' + Math.round(p.spo2), kind: 'phys' });
      else if (p.spo2 < L.spo2[0]) a.push({ id: 'spo2lo', prio: 'medium', text: 'SpO₂ NIEDRIG ' + Math.round(p.spo2), kind: 'phys' });
    }
    if (p.hasArt !== false && !noPulse) {
      var map = MT.physio.map(p.sys, p.dia);
      if (p.sys < L.sys[0]) a.push({ id: 'syslo', prio: p.sys < 75 ? 'high' : 'medium', text: 'ART SYS NIEDRIG ' + Math.round(p.sys), kind: 'phys' });
      if (p.sys > L.sys[1]) a.push({ id: 'syshi', prio: 'medium', text: 'ART SYS HOCH ' + Math.round(p.sys), kind: 'phys' });
      if (p.artDamping === 'over') a.push({ id: 'artdamp', prio: 'low', text: 'ART KURVE GEDÄMPFT?', kind: 'tech' });
      if (map < L.map[0] && p.sys >= L.sys[0]) a.push({ id: 'maplo', prio: 'medium', text: 'MAP NIEDRIG ' + Math.round(map), kind: 'phys' });
    }
    if (p.hasCo2 !== false) {
      if (p.tubeDisconnect || p.apnea) a.push({ id: 'apnea', prio: 'high', text: 'APNOE / KEIN CO₂', kind: 'phys' });
      else {
        if (p.etco2 > L.etco2[1]) a.push({ id: 'co2hi', prio: 'medium', text: 'etCO₂ HOCH ' + Math.round(p.etco2), kind: 'phys' });
        if (p.etco2 < L.etco2[0]) a.push({ id: 'co2lo', prio: 'medium', text: 'etCO₂ NIEDRIG ' + Math.round(p.etco2), kind: 'phys' });
      }
    }
    if (p.extraAlarms) a = a.concat(p.extraAlarms);
    var order = { high: 0, medium: 1, low: 2 };
    a.sort(function (x, y) { return order[x.prio] - order[y.prio]; });
    return a;
  };

  /**
   * Erzeugt einen Monitor in `container`.
   * opts: {patient, channels:['ecg','pleth','art','co2'], compact:bool, sweep: Sekunden über Breite,
   *        sound:bool, onAlarm:fn(list), showAlarmBar:true}
   */
  MT.createMonitor = function (container, opts) {
    opts = opts || {};
    var p = opts.patient || MT.physio.createPatient();
    var src = opts.source || MT.physio.createSignalSource(p);
    var channels = opts.channels || ['ecg', 'pleth', 'art', 'co2'];
    var compact = !!opts.compact;
    var canvas = MT.el('canvas', { class: 'monitor-canvas', 'aria-label': 'Patientenmonitor – Lernsimulation, fiktive Werte', role: 'img' });
    container.appendChild(canvas);
    var t = 0, writeX = 0, bufs = {}, bufW = 0;
    var numerics = {}, numTimer = 0, alarms = [], blink = 0, silencedUntil = -1, lastAlarmSound = -10;
    var paused = false, lastBeatSeen = -1;
    var CH = {
      ecg: { label: 'II', color: COLORS.ecg, range: [-0.6, 1.4], fn: src.ecg },
      pleth: { label: 'Pleth', color: COLORS.pleth, range: [-0.1, 1.3], fn: src.pleth },
      art: { label: 'ART', color: COLORS.art, range: [0, 180], fn: src.art, scale: true },
      co2: { label: 'CO₂', color: COLORS.co2, range: [0, 60], fn: src.co2, scale: true },
      resp: { label: 'Resp', color: COLORS.resp, range: [-1.3, 1.3], fn: src.resp }
    };

    function updateNumerics() {
      var n = 1 + (Math.random() - 0.5) * 0.01;
      var noPulse = p.rhythm === 'vf' || p.rhythm === 'asystole' || p.rhythm === 'pea' || (p.rhythm === 'vt' && !p.vtPulse);
      numerics.hr = p.ecgLeadOff ? (p.spo2Probe === 'ok' && !noPulse ? Math.round(p.hr) + '' : '---') : (p.rhythm === 'vf' || p.rhythm === 'asystole' ? '---' : Math.round(p.rhythm === 'vt' ? Math.max(p.hr, 140) : p.rhythm === 'avb3' ? Math.min(p.hr, 40) : p.hr * n) + '');
      numerics.hrSrc = p.ecgLeadOff ? 'Puls (SpO₂)' : 'EKG';
      numerics.spo2 = (p.spo2Probe === 'off' || noPulse || p.motionArtifact) ? '--' : Math.round(MT.clamp(p.spo2 + (Math.random() - 0.5) * 0.8, 50, 100)) + '';
      numerics.pr = (p.spo2Probe === 'off' || noPulse) ? '--' : Math.round(p.hr) + '';
      var off = (p.transducerOffsetCm || 0) * -0.74;
      var sys = p.sys + off, dia = p.dia + off;
      if (p.artDamping === 'over') { var m = MT.physio.map(sys, dia); sys = m + (sys - m) * 0.55; dia = m - (m - dia) * 0.55; }
      if (p.artDamping === 'under') { sys += 18; dia -= 4; }
      numerics.art = noPulse ? '--/--' : Math.round(sys) + '/' + Math.round(dia);
      numerics.map = noPulse ? '(--)' : '(' + Math.round(MT.physio.map(sys, dia)) + ')';
      numerics.etco2 = (p.tubeDisconnect || p.apnea) ? '0' : Math.round(p.etco2) + '';
      numerics.awrr = (p.tubeDisconnect || p.apnea) ? '0' : Math.round(p.rr) + '';
      numerics.temp = MT.fmt(p.temp, 1);
      numerics.nibp = Math.round(p.nibpSys) + '/' + Math.round(p.nibpDia);
      numerics.cvp = Math.round(p.cvp) + '';
      alarms = MT.evaluateAlarms(p, opts.limits);
      if (opts.onAlarm) opts.onAlarm(alarms);
    }

    function draw(dt) {
      var s = MT.setupCanvas(canvas);
      var ctx = s.ctx, W = s.w, H = s.h;
      var numW = compact ? Math.round(W * 0.34) : Math.round(Math.min(260, W * 0.3));
      var alarmH = compact ? Math.round(H * 0.13) : 30;
      var waveW = W - numW;
      if (bufW !== waveW) { bufW = waveW; bufs = {}; channels.forEach(function (c) { bufs[c] = new Float32Array(waveW).fill(NaN); }); writeX = 0; }
      var sweep = opts.sweep || (compact ? 5 : 6.5);
      var pxPerSec = waveW / sweep;
      if (!paused) {
        var steps = Math.max(1, Math.round(dt * pxPerSec));
        for (var i = 0; i < steps; i++) {
          t += 1 / pxPerSec;
          channels.forEach(function (c) { bufs[c][writeX] = CH[c].fn(t); });
          writeX = (writeX + 1) % waveW;
          // Gap vor dem Cursor
          channels.forEach(function (c) { for (var g = 1; g < 10; g++) bufs[c][(writeX + g) % waveW] = NaN; });
        }
        // QRS-Ton
        var b = src.beats();
        if (b.length && opts.sound && MT.sound.enabled && !p.ecgLeadOff) {
          for (var k = b.length - 1; k >= 0; k--) {
            if (b[k].t <= t && b[k].t > lastBeatSeen) { lastBeatSeen = b[k].t; MT.sound.qrs(p.spo2); break; }
          }
        }
      }
      numTimer -= dt; blink += dt;
      if (numTimer <= 0) { updateNumerics(); numTimer = 1; }

      // Hintergrund
      ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, W, H);
      // Alarmleiste
      var top = alarmH;
      var hi = alarms[0];
      var silenced = t < silencedUntil;
      if (hi) {
        var col = hi.prio === 'high' ? '#e0182d' : hi.prio === 'medium' ? '#f2b705' : '#1fb5d6';
        var on = hi.prio === 'high' ? (Math.floor(blink * 2) % 2 === 0) : hi.prio === 'medium' ? (Math.floor(blink * 0.8) % 2 === 0) : true;
        ctx.fillStyle = on || silenced ? col : 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, W, alarmH);
        ctx.fillStyle = hi.prio === 'medium' ? '#111' : '#fff';
        ctx.font = '700 ' + Math.round(alarmH * 0.55) + 'px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        var txt = (hi.prio === 'high' ? '!!! ' : hi.prio === 'medium' ? '!! ' : '! ') + hi.text + (alarms.length > 1 ? '   (+' + (alarms.length - 1) + ')' : '');
        ctx.fillText(txt, 8, alarmH / 2 + 1);
        if (silenced) { ctx.textAlign = 'right'; ctx.fillText('🔕 ' + Math.ceil(silencedUntil - t) + ' s', W - 8, alarmH / 2 + 1); ctx.textAlign = 'left'; }
        if (opts.sound && MT.sound.enabled && !silenced && t - lastAlarmSound > (hi.prio === 'high' ? 4 : 10)) { MT.sound.alarm(hi.prio); lastAlarmSound = t; }
      } else {
        ctx.fillStyle = '#0c1824'; ctx.fillRect(0, 0, W, alarmH);
        ctx.fillStyle = '#6f8aa3'; ctx.font = '600 ' + Math.round(alarmH * 0.45) + 'px system-ui, sans-serif'; ctx.textBaseline = 'middle';
        ctx.fillText(compact ? (opts.title || 'Bett 3 · fiktiv') : (opts.title || 'ITS Bett 3 · Lernpatient (fiktiv) · Lernszenario'), 8, alarmH / 2 + 1);
      }

      // Kurven
      var areaH = H - top;
      var rowH = areaH / channels.length;
      ctx.lineWidth = compact ? 1.2 : 1.6;
      ctx.lineJoin = 'round';
      channels.forEach(function (c, ci) {
        var ch = CH[c], y0 = top + ci * rowH, buf = bufs[c];
        // Raster
        ctx.strokeStyle = COLORS.grid; ctx.beginPath(); ctx.moveTo(0, y0 + rowH - 0.5); ctx.lineTo(waveW, y0 + rowH - 0.5); ctx.stroke();
        ctx.fillStyle = ch.color; ctx.font = '600 ' + (compact ? 9 : 12) + 'px system-ui, sans-serif'; ctx.textBaseline = 'top';
        ctx.fillText(ch.label, 4, y0 + 3);
        if (c === 'ecg' && p.ecgLeadOff && !compact) { ctx.fillStyle = '#f2b705'; ctx.fillText('ABLEITUNG PRÜFEN', 30, y0 + 3); }
        if (ch.scale && !compact) {
          ctx.fillStyle = 'rgba(200,210,220,0.45)'; ctx.font = '10px system-ui'; ctx.fillText(ch.range[1] + '', waveW - 26, y0 + 3);
          ctx.textBaseline = 'bottom'; ctx.fillText(ch.range[0] + '', waveW - 26, y0 + rowH - 2);
        }
        var r0 = ch.range[0], r1 = ch.range[1];
        ctx.strokeStyle = ch.color; ctx.beginPath();
        var pen = false;
        for (var x = 0; x < waveW; x++) {
          var v = buf[x];
          if (v !== v) { pen = false; continue; }
          var yy = y0 + rowH * 0.9 - (MT.clamp(v, r0 - (r1 - r0) * 0.1, r1 + (r1 - r0) * 0.05) - r0) / (r1 - r0) * rowH * 0.8;
          if (!pen) { ctx.moveTo(x, yy); pen = true; } else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      });

      // Messwerte
      var nx = waveW;
      ctx.fillStyle = '#060c13'; ctx.fillRect(nx, top, numW, H - top);
      ctx.strokeStyle = 'rgba(120,150,170,0.25)'; ctx.beginPath(); ctx.moveTo(nx + 0.5, top); ctx.lineTo(nx + 0.5, H); ctx.stroke();
      var blocks = [];
      blocks.push({ k: 'HF', u: '/min', v: numerics.hr, c: COLORS.ecg, alarm: alarmFor(['hrlo', 'hrhi', 'vf', 'asys', 'vt']) });
      blocks.push({ k: 'SpO₂', u: '%', v: numerics.spo2, c: COLORS.pleth, sub: 'PR ' + numerics.pr, alarm: alarmFor(['spo2lo', 'spo2lolo']) });
      if (channels.indexOf('art') >= 0) blocks.push({ k: 'ART', u: 'mmHg', v: numerics.art, c: COLORS.art, sub: numerics.map, alarm: alarmFor(['syslo', 'syshi', 'maplo', 'pea']) });
      if (channels.indexOf('co2') >= 0) blocks.push({ k: 'etCO₂', u: 'mmHg', v: numerics.etco2, c: COLORS.co2, sub: 'AF ' + numerics.awrr, alarm: alarmFor(['co2hi', 'co2lo', 'apnea']) });
      if (!compact) {
        blocks.push({ k: 'NIBP', u: 'mmHg', v: numerics.nibp, c: '#e8eef5', small: true });
        blocks.push({ k: 'Temp', u: '°C', v: numerics.temp, c: '#f0a4ff', small: true });
      }
      var bh = (H - top) / blocks.length;
      blocks.forEach(function (bk, i) {
        var y = top + i * bh;
        if (bk.alarm && Math.floor(blink * 2) % 2 === 0) { ctx.fillStyle = bk.alarm === 'high' ? 'rgba(224,24,45,0.55)' : 'rgba(242,183,5,0.45)'; ctx.fillRect(nx + 2, y + 2, numW - 4, bh - 4); }
        var long = bk.v.length > 4;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        var lf = compact ? Math.max(6, Math.min(bh * 0.2, 9)) : Math.max(9, Math.round(bh * 0.2));
        ctx.fillStyle = bk.c; ctx.font = '600 ' + lf + 'px system-ui, sans-serif';
        ctx.fillText(bk.k, nx + 4, y + 3);
        if (!compact) {
          ctx.font = '500 ' + Math.max(8, Math.round(bh * 0.15)) + 'px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(200,215,230,0.6)'; ctx.fillText(bk.u, nx + 6, y + 4 + Math.round(bh * 0.22));
        }
        // Wertgröße so wählen, dass der Text in die verbleibende Breite passt
        var avail = compact ? numW - 6 : numW - 12;
        var fs = bk.small ? bh * 0.42 : bh * (long ? 0.42 : 0.62);
        if (compact) fs = bh * (long ? 0.4 : 0.58);
        ctx.font = '700 ' + Math.round(fs) + 'px "Segoe UI", system-ui, sans-serif';
        var tw = ctx.measureText(bk.v).width;
        if (tw > avail) { fs = fs * avail / tw; ctx.font = '700 ' + Math.max(6, Math.round(fs)) + 'px "Segoe UI", system-ui, sans-serif'; }
        ctx.fillStyle = bk.c; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        var vy = compact ? y + bh - (bk.sub ? bh * 0.2 : 1) : y + bh * (bk.sub ? 0.78 : 0.86);
        ctx.fillText(bk.v, nx + numW - (compact ? 3 : 6), vy);
        if (bk.sub && (!compact || bh > 26)) {
          ctx.font = '600 ' + Math.max(6, Math.round(bh * (compact ? 0.16 : 0.17))) + 'px system-ui, sans-serif'; ctx.textBaseline = 'bottom';
          ctx.fillText(bk.sub, nx + numW - (compact ? 3 : 6), y + bh - 2);
        }
        ctx.textAlign = 'left';
      });
    }
    function alarmFor(ids) {
      for (var i = 0; i < alarms.length; i++) if (ids.indexOf(alarms[i].id) >= 0) return alarms[i].prio;
      return null;
    }

    var remove = MT.addTicker(function (dt) { if (canvas.isConnected) draw(dt); });
    updateNumerics();
    return {
      canvas: canvas, patient: p, source: src,
      alarms: function () { return alarms; },
      refresh: function () { updateNumerics(); },
      silence: function (sec) { silencedUntil = t + (sec || 120); },
      pause: function (v) { paused = v; },
      destroy: function () { remove(); canvas.remove(); }
    };
  };

  MT.MONITOR_COLORS = COLORS;
})();
