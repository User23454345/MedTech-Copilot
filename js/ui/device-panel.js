/* =====================================================================
   Geräte-Informationsfenster (Tabs: Überblick, Komponenten, Messwerte,
   Alarme, Verbund, Sicherheit, Simulation)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  var SIM_LABELS = {
    ventilation: 'Atemphysiologie & Beatmung', ecg: 'EKG', spo2: 'Sauerstoffsättigung', bloodpressure: 'Blutdruck',
    infusion: 'Infusion', defibrillation: 'Defibrillation', imaging: 'Bildgebung'
  };
  MT.SIM_LABELS = SIM_LABELS;

  // Findet eine Darstellung für ein Gerät (aus einer Raum-Platzierung oder device.visual)
  MT.deviceVisual = function (id) {
    var d = MT.devices[id];
    if (d && d.visual) return { visual: d.visual, opts: d.visualOpts || {} };
    for (var i = 0; i < MT.areas.length; i++) {
      var pls = MT.areas[i].placements || [];
      for (var k = 0; k < pls.length; k++) if (pls[k].device === id) return { visual: pls[k].visual, opts: pls[k].opts || {} };
    }
    return { visual: 'generic', opts: { short: d ? d.short || d.name : id } };
  };
  MT.deviceThumb = function (id) {
    var v = MT.deviceVisual(id);
    var sp = MT.sprites[v.visual] || MT.sprites.generic;
    var o = {}; Object.keys(v.opts).forEach(function (k) { o[k] = v.opts[k]; });
    if (v.visual === 'generic' && !o.short) o.short = (MT.devices[id] || {}).short;
    return '<svg viewBox="-6 -6 ' + (sp.vb[0] + 12) + ' ' + (sp.vb[1] + 12) + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>' + MT.spriteDefs + '</defs>' + sp.draw(o) + '</svg>';
  };
  MT.areasWithDevice = function (id) {
    return MT.areas.filter(function (a) { return (a.placements || []).some(function (p) { return p.device === id; }); });
  };

  var PRIO = { high: 'HOCH', medium: 'MITTEL', low: 'NIEDRIG' };

  /**
   * Rendert die Geräteinfo in `host`.
   * opts: {areaId, onSelectDevice(id), tab}
   */
  MT.renderDevicePanel = function (host, id, opts) {
    opts = opts || {};
    var d = MT.devices[id];
    host.innerHTML = '';
    if (!d) { host.innerHTML = '<p class="muted">Gerät nicht gefunden.</p>'; return; }
    MT.progress.viewDevice(id);

    var head = MT.el('div', { class: 'dev-head' });
    head.innerHTML = '<div class="dev-thumb">' + MT.deviceThumb(id) + '</div><div><div class="cat">' + MT.esc(d.category || 'Medizingerät') + '</div><h2>' + MT.esc(d.name) + '</h2>' +
      '<div class="row">' + (d.mdr ? '<span class="chip" title="Risikoklasse nach EU-Medizinprodukteverordnung (MDR) bzw. IVDR – Orientierung">Klasse ' + MT.esc(d.mdr) + '</span>' : '') +
      (d.sim ? '<span class="chip ok">▶ Simulation</span>' : '') + '</div></div>';
    host.appendChild(head);

    var tabs = [
      ['overview', 'Überblick'], ['components', 'Komponenten'], ['measurements', 'Messwerte'],
      ['alarms', 'Alarme'], ['connections', 'Verbund'], ['safety', 'Sicherheit']
    ];
    if (d.sim) tabs.push(['sim', 'Simulation']);
    var tabBar = MT.el('div', { class: 'dev-tabs', role: 'tablist' });
    var body = MT.el('div', { class: 'dev-section' });
    host.appendChild(tabBar); host.appendChild(body);
    var current = opts.tab && tabs.some(function (t) { return t[0] === opts.tab; }) ? opts.tab : 'overview';

    tabs.forEach(function (t) {
      var b = MT.el('button', { role: 'tab', 'aria-selected': t[0] === current ? 'true' : 'false', class: t[0] === current ? 'active' : '', text: t[1] });
      b.addEventListener('click', function () { current = t[0]; MT.$$('button', tabBar).forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); }); b.classList.add('active'); b.setAttribute('aria-selected', 'true'); render(); });
      tabBar.appendChild(b);
    });

    function devLink(otherId) {
      var o = MT.devices[otherId];
      if (!o) return MT.esc(otherId);
      return '<button class="linklike" data-dev="' + otherId + '">' + MT.esc(o.short || o.name) + '</button>';
    }

    function render() {
      var h = '';
      if (current === 'overview') {
        h += '<h4>Gerätebezeichnung</h4><p><b>' + MT.esc(d.name) + '</b></p>';
        h += '<h4>Medizinischer Zweck</h4><p>' + MT.esc(d.purpose) + '</p>';
        h += '<h4>Technische Funktion</h4><p>' + MT.esc(d.function) + '</p>';
        h += '<h4>Hersteller (Beispiele)</h4><p>' + d.manufacturers.map(MT.esc).join(' · ') + '<br><small class="muted">Typische Anbieter am Markt – keine Produktempfehlung, Darstellung generisch.</small></p>';
        if (d.standards && d.standards.length) h += '<h4>Normen & Regeln</h4><ul class="safety-list">' + d.standards.map(function (s) { return '<li>' + MT.esc(s) + '</li>'; }).join('') + '</ul>';
        if (d.tip) h += '<div class="callout">💡 ' + MT.esc(d.tip) + '</div>';
        var where = MT.areasWithDevice(id);
        if (where.length) h += '<h4>Einsatzbereiche</h4><div class="row">' + where.map(function (a) { return '<a class="chip" href="#/area/' + a.id + '">' + MT.esc(a.name) + '</a>'; }).join('') + '</div>';
      } else if (current === 'components') {
        h += '<h4>Komponenten</h4><div class="kv">' + d.components.map(function (c) { return '<div class="item"><b>' + MT.esc(c.name) + '</b><span>' + MT.esc(c.desc) + '</span></div>'; }).join('') + '</div>';
        if (d.parts && d.parts.length) h += '<div class="callout">🧩 Dieses Gerät kann in der Herausforderung <a href="#/challenge/components?device=' + id + '">„Komponenten identifizieren“</a> geübt werden.</div>';
      } else if (current === 'measurements') {
        h += '<h4>Messwerte & Einstellgrößen</h4><table class="meas-table"><thead><tr><th>Parameter</th><th>Einheit</th><th>Orientierung*</th></tr></thead><tbody>' +
          d.measurements.map(function (m) { return '<tr><td><b>' + MT.esc(m.name) + '</b>' + (m.desc ? '<small>' + MT.esc(m.desc) + '</small>' : '') + '</td><td>' + MT.esc(m.unit) + '</td><td>' + MT.esc(m.normal) + '</td></tr>'; }).join('') +
          '</tbody></table><p class="muted" style="font-size:12px;margin-top:6px">* Orientierungswerte für Erwachsene zu Lernzwecken; Zielwerte werden individuell ärztlich festgelegt.</p>';
      } else if (current === 'alarms') {
        h += '<h4>Typische Alarme</h4>' + d.alarms.map(function (a) {
          return '<div class="alarm-item ' + a.prio + '"><div><span class="prio">' + PRIO[a.prio] + '</span><b>' + MT.esc(a.name) + '</b></div><div><b>Ursachen:</b> ' + MT.esc(a.cause) + '</div><div><b>Reaktion:</b> ' + MT.esc(a.action) + '</div></div>';
        }).join('');
        h += '<p class="muted" style="font-size:12px">Alarmprioritäten angelehnt an IEC 60601-1-8: hoch (rot, sofortige Reaktion), mittel (gelb, zeitnahe Reaktion), niedrig (cyan, Aufmerksamkeit).</p>';
      } else if (current === 'connections') {
        h += '<h4>Verbindung zu anderen Geräten</h4>' + renderNetSvg(d) + d.connections.map(function (c) {
          return '<div class="conn-item"><span class="conn-type ' + MT.esc(c.type) + '">' + MT.esc(c.type) + '</span><div>' + devLink(c.to) + '<br>' + MT.esc(c.desc) + '</div></div>';
        }).join('');
      } else if (current === 'safety') {
        h += '<h4>Sicherheitsaspekte</h4><ul class="safety-list">' + d.safety.map(function (s) { return '<li>' + MT.esc(s) + '</li>'; }).join('') + '</ul>';
        h += '<div class="callout warn">⚖️ Allgemein gilt in Deutschland die Medizinprodukte-Betreiberverordnung (MPBetreibV): Anwendung nur durch eingewiesenes Personal, Funktionsprüfung vor Anwendung, Meldung von Vorkommnissen.</div>';
      } else if (current === 'sim') {
        h += '<h4>Interaktive Simulation</h4><p>Zu diesem Gerät gibt es eine vereinfachte, physikalisch-physiologisch begründete Simulation: <b>' + MT.esc(SIM_LABELS[d.sim] || d.sim) + '</b>.</p><a class="btn primary" href="#/lab/' + d.sim + '">▶ Simulation öffnen</a>';
      }
      body.innerHTML = h;
      MT.$$('[data-dev]', body).forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          var other = b.getAttribute('data-dev');
          if (opts.onSelectDevice) opts.onSelectDevice(other); else MT.renderDevicePanel(host, other, opts);
        });
      });
    }
    render();
  };

  // Kleiner Verbundgraph (Stern um das Gerät)
  var TYPE_COLORS = { Gas: '#1d5fae', Strom: '#17733f', Daten: '#5a35a8', Fluid: '#127a72', Signal: '#a84d10', Klinisch: '#a51d2b', Strahlung: '#7a5b00' };
  MT.CONN_COLORS = TYPE_COLORS;
  function renderNetSvg(d) {
    var targets = [];
    d.connections.forEach(function (c) { if (targets.indexOf(c.to) < 0) targets.push(c.to); });
    if (!targets.length) return '';
    var W = 400, H = 240, cx = W / 2, cy = H / 2;
    var s = '<svg class="mini-graph" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Verbundgraph">';
    targets.forEach(function (t, i) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / targets.length;
      var x = cx + Math.cos(ang) * 150, y = cy + Math.sin(ang) * 88;
      var types = d.connections.filter(function (c) { return c.to === t; }).map(function (c) { return c.type; });
      types.forEach(function (ty, k) {
        var off = (k - (types.length - 1) / 2) * 5;
        s += '<line x1="' + cx + '" y1="' + (cy + off) + '" x2="' + x + '" y2="' + (y + off) + '" stroke="' + (TYPE_COLORS[ty] || '#888') + '" stroke-width="2.5" opacity=".75"/>';
      });
      var name = (MT.devices[t] || {}).short || t;
      var tw = Math.min(140, name.length * 6.6 + 14);
      s += '<g><rect x="' + (x - tw / 2) + '" y="' + (y - 12) + '" width="' + tw + '" height="24" rx="12" fill="#fff" stroke="#b9c7d6"/><text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#142333" font-family="system-ui">' + MT.esc(name) + '</text></g>';
    });
    var mn = d.short || d.name, mw = Math.min(170, mn.length * 7.4 + 20);
    s += '<rect x="' + (cx - mw / 2) + '" y="' + (cy - 15) + '" width="' + mw + '" height="30" rx="15" fill="#0f2236"/><text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui">' + MT.esc(mn) + '</text>';
    s += '</svg><div class="row" style="margin:6px 0 4px;font-size:11px">' + Object.keys(TYPE_COLORS).filter(function (k) { return d.connections.some(function (c) { return c.type === k; }); }).map(function (k) { return '<span style="color:' + TYPE_COLORS[k] + ';font-weight:700">● ' + k + '</span>'; }).join(' ') + '</div>';
    return s;
  }
})();
