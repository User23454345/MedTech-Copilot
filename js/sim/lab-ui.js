/* =====================================================================
   Bausteine für das Simulationslabor (Layout, Regler, Anzeigen)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  var uid = 0;
  MT.labUI = {
    layout: function (host, opts) {
      opts = opts || {};
      host.innerHTML = '';
      var grid = MT.el('div', { class: 'sim-grid' });
      var left = MT.el('div');
      var view = MT.el('div', { class: 'sim-view' + (opts.light ? ' light' : '') });
      var readouts = MT.el('div', { class: 'readouts' });
      var theory = MT.el('div', { class: 'theory', style: 'margin-top:14px' });
      left.appendChild(view); left.appendChild(readouts); left.appendChild(theory);
      var controls = MT.el('div', { class: 'controls card', style: 'box-shadow:none;border:1px solid var(--line)' });
      grid.appendChild(left); grid.appendChild(controls);
      host.appendChild(grid);
      return { view: view, readouts: readouts, theory: theory, controls: controls };
    },
    canvas: function (view, aspect) {
      var c = MT.el('canvas');
      c.style.aspectRatio = aspect || '16 / 9';
      view.appendChild(c);
      return c;
    },
    heading: function (host, text) {
      host.appendChild(MT.el('h4', { text: text, style: 'margin:4px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:var(--ink-3)' }));
    },
    slider: function (host, o) {
      var wrap = MT.el('div', { class: 'ctrl' });
      var out = MT.el('output');
      var id = 'sl' + (++uid);
      var lab = MT.el('label', { for: id }, [o.label, out]);
      var inp = MT.el('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.step || 1, value: o.value });
      function upd() { var v = parseFloat(inp.value); out.textContent = (o.fmt ? o.fmt(v) : MT.fmt(v, o.dec || 0)) + (o.unit ? ' ' + o.unit : ''); }
      inp.addEventListener('input', function () { upd(); if (o.onInput) o.onInput(parseFloat(inp.value)); });
      upd();
      wrap.appendChild(lab); wrap.appendChild(inp);
      if (o.hint) wrap.appendChild(MT.el('small', { class: 'muted', text: o.hint, style: 'font-size:11.5px' }));
      host.appendChild(wrap);
      return { input: inp, set: function (v) { inp.value = v; upd(); }, get: function () { return parseFloat(inp.value); } };
    },
    seg: function (host, o) {
      var wrap = MT.el('div', { class: 'ctrl' });
      if (o.label) wrap.appendChild(MT.el('label', { text: o.label }));
      var seg = MT.el('div', { class: 'seg', role: 'group' });
      var val = o.value;
      var btns = {};
      function setVal(v) { val = v; Object.keys(btns).forEach(function (k) { btns[k].classList.toggle('active', k === v); }); }
      o.options.forEach(function (op) {
        var b = MT.el('button', { type: 'button', text: op[1], class: op[0] === val ? 'active' : '' });
        b.addEventListener('click', function () { setVal(op[0]); if (o.onChange) o.onChange(val); });
        btns[op[0]] = b;
        seg.appendChild(b);
      });
      wrap.appendChild(seg); host.appendChild(wrap);
      return { get: function () { return val; }, set: setVal };
    },
    select: function (host, o) {
      var wrap = MT.el('div', { class: 'ctrl' });
      wrap.appendChild(MT.el('label', { text: o.label }));
      var s = MT.el('select', { 'aria-label': o.label });
      o.options.forEach(function (op) { var e = MT.el('option', { value: op[0], text: op[1] }); if (op[0] === o.value) e.selected = true; s.appendChild(e); });
      s.addEventListener('change', function () { if (o.onChange) o.onChange(s.value); });
      wrap.appendChild(s); host.appendChild(wrap);
      return s;
    },
    check: function (host, o) {
      var lab = MT.el('label', { style: 'display:flex;gap:8px;align-items:center;font-size:13.5px;cursor:pointer' });
      var c = MT.el('input', { type: 'checkbox' });
      c.checked = !!o.value;
      c.addEventListener('change', function () { if (o.onChange) o.onChange(c.checked); });
      lab.appendChild(c); lab.appendChild(document.createTextNode(o.label));
      host.appendChild(lab);
      return c;
    },
    button: function (host, text, cls, fn) {
      var b = MT.el('button', { class: 'btn ' + (cls || ''), type: 'button', html: text });
      b.addEventListener('click', fn); host.appendChild(b); return b;
    },
    readouts: function (host, defs) {
      var els = {};
      host.innerHTML = '';
      defs.forEach(function (d) {
        var r = MT.el('div', { class: 'readout', title: d.title || '' });
        r.innerHTML = '<span>' + d.label + '</span><b>–</b> <small>' + (d.unit || '') + '</small>';
        host.appendChild(r); els[d.key] = r;
      });
      return function (vals) {
        Object.keys(vals).forEach(function (k) {
          var r = els[k]; if (!r) return;
          var v = vals[k];
          if (v && typeof v === 'object') { r.querySelector('b').textContent = v.v; r.className = 'readout ' + (v.state || ''); }
          else { r.querySelector('b').textContent = v; r.className = 'readout'; }
        });
      };
    },
    // Rahmen eines Diagrammbereichs (Gitter, Titel, Skala)
    plotFrame: function (ctx, x, y, w, h, o) {
      ctx.save();
      ctx.strokeStyle = o.grid || 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      for (var i = 0; i <= 4; i++) { var yy = Math.round(y + h * i / 4) + 0.5; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
      ctx.fillStyle = o.labelColor || '#9fb3c8'; ctx.font = '600 11px system-ui'; ctx.textBaseline = 'top';
      if (o.title) { ctx.fillStyle = o.color || ctx.fillStyle; ctx.fillText(o.title, x + 4, y + 3); ctx.fillStyle = o.labelColor || '#9fb3c8'; }
      ctx.textAlign = 'right';
      if (o.max != null) ctx.fillText(o.max, x + w - 3, y + 3);
      ctx.textBaseline = 'bottom'; if (o.min != null) ctx.fillText(o.min, x + w - 3, y + h - 2);
      if (o.zero != null) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, o.zero); ctx.lineTo(x + w, o.zero); ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore();
    },
    // Kurve aus Funktion zeichnen
    plotFn: function (ctx, x, y, w, h, lo, hi, n, fn, color, lw) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var v = fn(i / n);
        var yy = y + h - (MT.clamp(v, lo, hi) - lo) / (hi - lo) * h;
        if (i === 0) ctx.moveTo(x + w * i / n, yy); else ctx.lineTo(x + w * i / n, yy);
      }
      ctx.stroke(); ctx.restore();
    }
  };
})();
