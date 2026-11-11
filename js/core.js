/* =====================================================================
   MedTech Simulator – Kern (Namespace, Registry, Hilfsfunktionen)
   Alle Patientendaten in dieser Anwendung sind FIKTIV.
   ===================================================================== */
(function () {
  'use strict';

  var MT = (window.MT = window.MT || {});

  MT.version = '1.0.0';
  MT.devices = {};      // id -> Gerätedefinition
  MT.areas = [];        // Reihenfolge = Anzeige-Reihenfolge
  MT.areaById = {};
  MT.scenarios = {};    // id -> Szenario
  MT.sims = {};         // id -> Simulationsmodul
  MT.sprites = {};      // visual -> function(opts) => SVG-String

  /* ---------- Registry ---------- */
  MT.registerDevice = function (d) {
    if (!d || !d.id) throw new Error('Gerät ohne id');
    d.connections = d.connections || [];
    d.components = d.components || [];
    d.measurements = d.measurements || [];
    d.alarms = d.alarms || [];
    d.safety = d.safety || [];
    d.manufacturers = d.manufacturers || [];
    MT.devices[d.id] = d;
    return d;
  };

  MT.registerArea = function (a) {
    if (MT.areaById[a.id]) {
      // Ersetzen (z. B. wenn ausführlichere Definition nachgeladen wird)
      var idx = MT.areas.indexOf(MT.areaById[a.id]);
      MT.areas[idx] = a;
    } else {
      MT.areas.push(a);
    }
    MT.areaById[a.id] = a;
    return a;
  };

  MT.registerScenario = function (s) { MT.scenarios[s.id] = s; return s; };
  MT.registerSim = function (s) { MT.sims[s.id] = s; return s; };

  /* ---------- DOM-Helfer ---------- */
  MT.$ = function (sel, root) { return (root || document).querySelector(sel); };
  MT.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  MT.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  };

  MT.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  MT.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  MT.lerp = function (a, b, t) { return a + (b - a) * t; };
  MT.round = function (v, d) { var f = Math.pow(10, d || 0); return Math.round(v * f) / f; };
  MT.fmt = function (v, d) {
    if (typeof v !== 'number' || !isFinite(v)) return '–';
    return v.toFixed(d || 0).replace('.', ',');
  };

  MT.shuffle = function (arr, seed) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  /* ---------- Einfacher Event-Bus ---------- */
  var listeners = {};
  MT.on = function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return function () { MT.off(ev, fn); }; };
  MT.off = function (ev, fn) { listeners[ev] = (listeners[ev] || []).filter(function (f) { return f !== fn; }); };
  MT.emit = function (ev, data) { (listeners[ev] || []).slice().forEach(function (f) { try { f(data); } catch (e) { console.error(e); } }); };

  /* ---------- Fortschritt (localStorage) ---------- */
  var STORE_KEY = 'medtech-sim-progress-v1';
  MT.progress = (function () {
    var data;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { data = {}; }
    data.viewed = data.viewed || {};
    data.areas = data.areas || {};
    data.challenges = data.challenges || {};
    data.scenarios = data.scenarios || {};
    data.sims = data.sims || {};
    function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* privat-Modus */ } MT.emit('progress', data); }
    return {
      data: data,
      viewDevice: function (id) { if (!data.viewed[id]) { data.viewed[id] = Date.now(); save(); } },
      visitArea: function (id) { if (!data.areas[id]) { data.areas[id] = Date.now(); save(); } },
      useSim: function (id) { if (!data.sims[id]) { data.sims[id] = Date.now(); save(); } },
      challenge: function (id, score, max) {
        var prev = data.challenges[id];
        if (!prev || score / max > prev.score / prev.max) { data.challenges[id] = { score: score, max: max, t: Date.now() }; save(); }
      },
      scenario: function (id, score, max) {
        var prev = data.scenarios[id];
        if (!prev || score / max >= prev.score / prev.max) { data.scenarios[id] = { score: score, max: max, t: Date.now() }; save(); }
      },
      reset: function () { data.viewed = {}; data.areas = {}; data.challenges = {}; data.scenarios = {}; data.sims = {}; save(); }
    };
  })();

  /* ---------- Toasts ---------- */
  MT.toast = function (msg, type, ms) {
    var host = MT.$('#toasts');
    if (!host) return;
    var t = MT.el('div', { class: 'toast ' + (type || 'info'), html: msg, role: 'status' });
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, ms || 3200);
  };

  /* ---------- Modal ---------- */
  MT.modal = function (opts) {
    MT.closeModal();
    var wrap = MT.el('div', { class: 'modal-backdrop', id: 'modal' });
    var box = MT.el('div', { class: 'modal ' + (opts.size || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title || 'Dialog' });
    var head = MT.el('div', { class: 'modal-head' }, [
      MT.el('h2', { html: opts.title || '' }),
      MT.el('button', { class: 'icon-btn', 'aria-label': 'Schließen', html: '&times;', onclick: function () { MT.closeModal(); } })
    ]);
    var body = MT.el('div', { class: 'modal-body' });
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    box.appendChild(head); box.appendChild(body);
    wrap.appendChild(box);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap && !opts.sticky) MT.closeModal(); });
    document.body.appendChild(wrap);
    MT._modalCleanup = opts.onClose;
    return body;
  };
  MT.closeModal = function () {
    var m = MT.$('#modal');
    if (m) {
      m.remove();
      if (MT._modalCleanup) { var f = MT._modalCleanup; MT._modalCleanup = null; f(); }
    }
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') MT.closeModal(); });

  /* ---------- Animations-Loop (ein zentraler rAF) ---------- */
  var tickers = [];
  var last = 0;
  MT.addTicker = function (fn) { tickers.push(fn); return function () { tickers = tickers.filter(function (f) { return f !== fn; }); }; };
  MT.clearTickers = function () { tickers = []; };
  function loop(ts) {
    var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0.016;
    last = ts;
    if (!document.hidden) {
      for (var i = 0; i < tickers.length; i++) { try { tickers[i](dt, ts / 1000); } catch (e) { console.error(e); } }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Canvas-Helfer (HiDPI) ---------- */
  MT.setupCanvas = function (canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  };

  /* ---------- Akustische Alarme (WebAudio, optional) ---------- */
  MT.sound = (function () {
    var ac = null, enabled = false;
    function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } return ac; }
    function beep(freq, dur, when, vol) {
      var c = ctx(); if (!c || !enabled) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      var t0 = c.currentTime + (when || 0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.08, t0 + 0.01);
      g.gain.linearRampToValueAtTime(0, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    }
    return {
      get enabled() { return enabled; },
      toggle: function () { enabled = !enabled; if (enabled && ctx() && ac.state === 'suspended') ac.resume(); return enabled; },
      beep: beep,
      // QRS-Ton: Tonhöhe folgt SpO2 (wie bei echten Monitoren)
      qrs: function (spo2) { beep(440 + (MT.clamp(spo2, 70, 100) - 70) * 12, 0.06, 0, 0.05); },
      // IEC 60601-1-8 angelehnte Melodien (vereinfacht)
      alarm: function (prio) {
        if (prio === 'high') { [0, 0.15, 0.3, 0.6, 0.75].forEach(function (t) { beep(880, 0.11, t, 0.09); }); }
        else if (prio === 'medium') { [0, 0.2, 0.4].forEach(function (t) { beep(660, 0.15, t, 0.07); }); }
        else { beep(520, 0.2, 0, 0.05); }
      }
    };
  })();
})();
