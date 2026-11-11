/* =====================================================================
   Raum-Renderer: zeichnet einen Krankenhausraum (SVG, 1600×900)
   mit anklickbaren Geräten und optionalen Live-Bildschirmen.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  var VW = 1600, VH = 900;

  function placementBox(pl) {
    var sp = MT.sprites[pl.visual] || MT.sprites.generic;
    var w = pl.w, h = pl.h || (w * sp.vb[1] / sp.vb[0]);
    return { x: pl.x, y: pl.y, w: w, h: h, sx: w / sp.vb[0], sy: h / sp.vb[1], sp: sp };
  }
  MT.placementBox = placementBox;

  function drawSprite(pl, extraOpts) {
    var b = placementBox(pl);
    var o = {};
    Object.keys(pl.opts || {}).forEach(function (k) { o[k] = pl.opts[k]; });
    if (pl.live) o.live = true;
    if (extraOpts) Object.keys(extraOpts).forEach(function (k) { o[k] = extraOpts[k]; });
    return '<svg x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" viewBox="0 0 ' + b.sp.vb[0] + ' ' + b.sp.vb[1] + '" preserveAspectRatio="none" overflow="visible">' + b.sp.draw(o) + '</svg>';
  }

  function backdrop(area) {
    var r = area.room || {};
    var wall = r.wall || '#e9eff4', wall2 = r.wall2 || '#dfe7ee', floor = r.floor || '#c9d3dc', floor2 = r.floor2 || '#b5c1cc';
    var horizon = r.horizon || 640;
    var out = '';
    out += '<defs>' + MT.spriteDefs +
      '<linearGradient id="g-wall-' + area.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + wall + '"/><stop offset="1" stop-color="' + wall2 + '"/></linearGradient>' +
      '<linearGradient id="g-floor-' + area.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + floor2 + '"/><stop offset="1" stop-color="' + floor + '"/></linearGradient>' +
      '<pattern id="p-tiles-' + area.id + '" width="80" height="40" patternUnits="userSpaceOnUse"><path d="M0 0 H80 M0 0 V40" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/></pattern>' +
      '</defs>';
    out += '<rect x="0" y="0" width="' + VW + '" height="' + horizon + '" fill="url(#g-wall-' + area.id + ')"/>';
    // Deckenleiste und Lichtband
    out += '<rect x="0" y="0" width="' + VW + '" height="34" fill="#f6f8fa"/><rect x="0" y="34" width="' + VW + '" height="4" fill="#cfd8e1"/>';
    out += '<rect x="420" y="6" width="760" height="18" rx="9" fill="#fffef6" opacity=".9"/><ellipse cx="800" cy="40" rx="420" ry="30" fill="url(#g-glow)"/>';
    // Wand-Akzentstreifen (Bereichsfarbe)
    out += '<rect x="0" y="' + (horizon - 150) + '" width="' + VW + '" height="10" fill="' + (area.color || '#3b8de0') + '" opacity=".35"/>';
    // Boden
    out += '<path d="M0 ' + horizon + ' H' + VW + ' V' + VH + ' H0 Z" fill="url(#g-floor-' + area.id + ')"/>';
    out += '<path d="M0 ' + horizon + ' H' + VW + ' V' + VH + ' H0 Z" fill="url(#p-tiles-' + area.id + ')" opacity=".6"/>';
    // Perspektivische Fugen
    for (var i = -6; i <= 6; i++) {
      out += '<path d="M' + (800 + i * 90) + ' ' + horizon + ' L' + (800 + i * 260) + ' ' + VH + '" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>';
    }
    out += '<rect x="0" y="' + (horizon - 14) + '" width="' + VW + '" height="14" fill="#b9c3cc"/>';
    // Raumschild
    out += '<g transform="translate(1340,60)"><rect width="220" height="58" rx="8" fill="#fff" stroke="#cfd7e0" filter="url(#f-soft)"/>' +
      '<rect width="10" height="58" rx="4" fill="' + (area.color || '#3b8de0') + '"/>' +
      '<text x="22" y="26" font-size="16" font-weight="700" fill="#1d2b3a" font-family="system-ui">' + MT.esc(area.sign || area.name) + '</text>' +
      '<text x="22" y="46" font-size="12" fill="#5a6672" font-family="system-ui">' + MT.esc(area.signSub || 'Lernumgebung · fiktiv') + '</text></g>';
    return out;
  }

  /**
   * Rendert einen Raum in `host`.
   * opts: {onSelect(id), labels:bool, highlight:id}
   * Rückgabe: {el, setLabels, highlight, flash, destroy, liveHosts}
   */
  MT.renderRoom = function (host, area, opts) {
    opts = opts || {};
    host.innerHTML = '';
    var stage = MT.el('div', { class: 'room-stage' + (opts.labels ? ' show-labels' : '') });
    var svg = '<svg class="room-svg" viewBox="0 0 ' + VW + ' ' + VH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Raumansicht ' + MT.esc(area.name) + '">';
    svg += backdrop(area);
    // Dekor (nicht anklickbar)
    (area.decor || []).forEach(function (d) { svg += '<g class="decor">' + drawSprite(d) + '</g>'; });
    // Verbindungs-/Schlauchebene hinter den Geräten
    if (area.hosesBehind) svg += '<g class="hoses">' + area.hosesBehind.join('') + '</g>';
    // Geräte
    (area.placements || []).forEach(function (pl, idx) {
      var dev = MT.devices[pl.device];
      var b = placementBox(pl);
      var name = dev ? dev.name : pl.device;
      svg += '<g class="hotspot" tabindex="0" role="button" data-device="' + pl.device + '" data-idx="' + idx + '" aria-label="' + MT.esc(name) + '">' +
        drawSprite(pl) +
        '<rect class="hit" x="' + (b.x - 6) + '" y="' + (b.y - 6) + '" width="' + (b.w + 12) + '" height="' + (b.h + 12) + '" rx="14"/>' +
        '</g>';
    });
    if (area.hosesFront) svg += '<g class="hoses">' + area.hosesFront.join('') + '</g>';
    // Beschriftungen (separat, damit immer oben)
    svg += '<g class="labels">';
    (area.placements || []).forEach(function (pl) {
      var dev = MT.devices[pl.device];
      if (!dev) return;
      var b = placementBox(pl);
      var lx = pl.labelX != null ? pl.labelX : b.x + b.w / 2, ly = pl.labelY != null ? pl.labelY : b.y - 14;
      var txt = dev.short || dev.name;
      var tw = Math.min(300, txt.length * 8.4 + 22);
      svg += '<g class="label" data-device="' + pl.device + '" transform="translate(' + lx + ',' + ly + ')"><rect x="' + (-tw / 2) + '" y="-15" width="' + tw + '" height="26" rx="13"/><text x="0" y="3" text-anchor="middle">' + MT.esc(txt) + '</text></g>';
    });
    svg += '</g>';
    svg += '<text x="20" y="' + (VH - 16) + '" font-size="13" fill="rgba(30,45,60,.55)" font-family="system-ui">LERNSZENARIO · Alle Patientendaten fiktiv · Keine realen Produktabbildungen</text>';
    svg += '</svg>';
    stage.innerHTML = svg;
    host.appendChild(stage);

    // Live-Bildschirme als absolut positionierte Container
    var liveHosts = [];
    (area.placements || []).forEach(function (pl) {
      if (!pl.live) return;
      var b = placementBox(pl);
      var sc = pl.live.screen; // [x,y,w,h] in Sprite-Koordinaten
      var x = b.x + sc[0] * b.sx, y = b.y + sc[1] * b.sy, w = sc[2] * b.sx, h = sc[3] * b.sy;
      var d = MT.el('div', { class: 'live-screen', 'data-device': pl.device });
      d.style.left = (x / VW * 100) + '%'; d.style.top = (y / VH * 100) + '%';
      d.style.width = (w / VW * 100) + '%'; d.style.height = (h / VH * 100) + '%';
      stage.appendChild(d);
      liveHosts.push({ el: d, placement: pl, type: pl.live.type });
    });

    // Interaktion
    function select(id, e) { if (opts.onSelect) opts.onSelect(id, e); }
    MT.$$('.hotspot', stage).forEach(function (g) {
      g.addEventListener('click', function (e) { select(g.getAttribute('data-device'), e); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.getAttribute('data-device'), e); } });
      g.addEventListener('mouseenter', function () { stage.classList.add('hovering'); var l = MT.$('.label[data-device="' + g.getAttribute('data-device') + '"]', stage); if (l) l.classList.add('hot'); });
      g.addEventListener('mouseleave', function () { stage.classList.remove('hovering'); var l = MT.$('.label[data-device="' + g.getAttribute('data-device') + '"]', stage); if (l) l.classList.remove('hot'); });
    });
    MT.$$('.live-screen', stage).forEach(function (d) {
      d.addEventListener('click', function (e) { select(d.getAttribute('data-device'), e); });
    });

    var api = {
      el: stage, liveHosts: liveHosts,
      setLabels: function (on) { stage.classList.toggle('show-labels', !!on); },
      highlight: function (id) {
        MT.$$('.hotspot', stage).forEach(function (g) { g.classList.toggle('active', g.getAttribute('data-device') === id); });
        MT.$$('.label', stage).forEach(function (g) { g.classList.toggle('active', g.getAttribute('data-device') === id); });
      },
      flash: function (id, cls) {
        var g = MT.$('.hotspot[data-device="' + id + '"]', stage);
        if (!g) return;
        g.classList.remove('flash-ok', 'flash-bad', 'pulse-alarm');
        void g.getBBox; // reflow
        g.classList.add(cls || 'flash-ok');
        setTimeout(function () { g.classList.remove(cls || 'flash-ok'); }, 1400);
      },
      alarmPulse: function (id, on) {
        var g = MT.$('.hotspot[data-device="' + id + '"]', stage);
        if (g) g.classList.toggle('pulse-alarm', !!on);
      }
    };
    return api;
  };

  /* ---------- Mini-Beatmungsanzeige für den Raum ---------- */
  MT.createVentScreen = function (host, settingsRef, opts) {
    opts = opts || {};
    var c = MT.el('canvas', { class: 'monitor-canvas' });
    host.appendChild(c);
    var t = 0;
    var bufP = [], bufF = [], W = 0, wx = 0;
    var remove = MT.addTicker(function (dt) {
      if (!c.isConnected) return;
      var s = MT.setupCanvas(c), ctx = s.ctx;
      var st = settingsRef();
      var waveW = Math.round(s.w * 0.7);
      if (W !== waveW) { W = waveW; bufP = new Array(W).fill(NaN); bufF = new Array(W).fill(NaN); wx = 0; }
      var pps = W / 8;
      var steps = Math.max(1, Math.round(dt * pps));
      for (var i = 0; i < steps; i++) {
        t += 1 / pps;
        var v = st.disconnected ? { p: 0.5, flow: 30 * Math.sin(t * 7) } : MT.physio.ventCycle(st, t);
        if (st.obstructed && v.phase === 'insp') v.p *= 1.45;
        bufP[wx] = v.p; bufF[wx] = v.flow; wx = (wx + 1) % W;
        for (var g = 1; g < 6; g++) { bufP[(wx + g) % W] = NaN; bufF[(wx + g) % W] = NaN; }
      }
      ctx.fillStyle = '#04080d'; ctx.fillRect(0, 0, s.w, s.h);
      var h2 = s.h / 2;
      function plot(buf, y0, h, lo, hi, col) {
        ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath(); var pen = false;
        for (var x = 0; x < W; x++) { var v = buf[x]; if (v !== v) { pen = false; continue; } var y = y0 + h * 0.9 - (MT.clamp(v, lo, hi) - lo) / (hi - lo) * h * 0.8; if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      plot(bufP, 0, h2, 0, 45, '#ffd84a');
      plot(bufF, h2, h2, -70, 70, '#3fe0ff');
      var m = MT.physio.ventMetrics(st);
      ctx.fillStyle = '#0a1520'; ctx.fillRect(W, 0, s.w - W, s.h);
      ctx.font = '600 ' + Math.max(7, Math.round(s.h * 0.1)) + 'px system-ui'; ctx.textBaseline = 'top';
      var rows = [['Ppeak', st.disconnected ? '0' : MT.fmt(m.ppeak * (st.obstructed ? 1.45 : 1), 0)], ['PEEP', st.disconnected ? '0' : MT.fmt(st.peep, 0)], ['VTe', st.disconnected ? '0' : MT.fmt(m.vt, 0)], ['f', MT.fmt(st.rr, 0)], ['FiO₂', MT.fmt(st.fio2 * 100, 0)]];
      rows.forEach(function (r, i) {
        var y = 3 + i * s.h / rows.length;
        ctx.fillStyle = '#9fb3c8'; ctx.textAlign = 'left'; ctx.fillText(r[0], W + 3, y);
        ctx.fillStyle = '#ffd84a'; ctx.textAlign = 'right'; ctx.fillText(r[1], s.w - 3, y);
      });
      ctx.textAlign = 'left';
      if (st.disconnected || st.obstructed) {
        ctx.fillStyle = Math.floor(t * 2) % 2 ? '#e0182d' : '#7a0d18'; ctx.fillRect(0, 0, W, s.h * 0.16);
        ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.max(7, Math.round(s.h * 0.11)) + 'px system-ui';
        ctx.fillText(st.disconnected ? '!!! DISKONNEKTION' : '!!! PAW HOCH', 4, 2);
      }
    });
    return { destroy: function () { remove(); c.remove(); } };
  };
})();
