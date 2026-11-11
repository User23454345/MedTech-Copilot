/* =====================================================================
   Ansichten: Krankenhausplan, Bereich, Gerätekatalog, Fortschritt,
   Simulationslabor (Rahmen)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  var V = (MT.views = MT.views || {});

  /* ------------------------------------------------------------------
     Krankenhausplan
     ------------------------------------------------------------------ */
  var MAP_LAYOUT = {
    er: [40, 70], radiology: [262, 70], cathlab: [484, 70], or: [706, 70], pacu: [928, 70],
    lab: [40, 400], ward: [262, 400], dialysis: [484, 400], icu: [706, 400], neo: [928, 400]
  };

  function hospitalMap() {
    var W = 1170, H = 700;
    var s = '<svg class="hospital-map" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Krankenhausplan – Bereich auswählen">';
    s += '<defs><pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e3e9ef" stroke-width="1"/></pattern>' +
      '<filter id="mapsh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f2236" flood-opacity=".18"/></filter></defs>';
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="18" fill="#f7f9fb"/><rect x="0" y="0" width="' + W + '" height="' + H + '" rx="18" fill="url(#mapgrid)"/>';
    s += '<rect x="20" y="50" width="' + (W - 40) + '" height="' + (H - 90) + '" rx="14" fill="#fff" stroke="#c9d4de" stroke-width="3"/>';
    // Flur
    s += '<rect x="20" y="320" width="' + (W - 40) + '" height="70" fill="#eef3f7"/><path d="M40 355 H' + (W - 40) + '" stroke="#c9d4de" stroke-width="2" stroke-dasharray="14 10"/>';
    s += '<text x="' + (W / 2) + '" y="361" text-anchor="middle" font-size="13" fill="#7a8a9a" font-family="system-ui" letter-spacing="4">ZENTRALER FLUR · EBENE 1</text>';
    // Eingänge
    s += '<g><rect x="20" y="325" width="12" height="60" fill="#2f7fd8"/><text x="38" y="18" font-size="0"> </text></g>';
    s += '<g transform="translate(40,22)"><rect width="170" height="24" rx="12" fill="#d62839"/><text x="85" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui">🚑 Liegendanfahrt</text></g>';
    s += '<g transform="translate(' + (W - 200) + ',' + (H - 34) + ')"><rect width="170" height="24" rx="12" fill="#2f7fd8"/><text x="85" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui">Haupteingang ↑</text></g>';
    s += '<g transform="translate(' + (W / 2 - 60) + ',' + (H - 34) + ')"><rect width="120" height="24" rx="12" fill="#5a6672"/><text x="60" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui">⇅ Aufzüge</text></g>';
    MT.areas.forEach(function (a) {
      var pos = MAP_LAYOUT[a.id] || [40, 70];
      var x = pos[0], y = pos[1], w = 202, h = 230;
      var n = (a.placements || []).length;
      var visited = MT.progress.data.areas[a.id];
      var seen = (a.placements || []).filter(function (p) { return MT.progress.data.viewed[p.device]; }).length;
      s += '<g class="dept" tabindex="0" role="link" data-area="' + a.id + '" aria-label="' + MT.esc(a.name) + ' – ' + n + ' Geräte">';
      s += '<rect class="room" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' + a.color + '" filter="url(#mapsh)"/>';
      s += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (w - 12) + '" height="' + (h - 12) + '" rx="9" fill="#fff" opacity=".9"/>';
      s += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (w - 12) + '" height="52" rx="9" fill="' + a.color + '" opacity=".14"/>';
      s += '<text x="' + (x + 18) + '" y="' + (y + 44) + '" font-size="28" font-family="system-ui">' + a.icon + '</text>';
      s += '<text x="' + (x + 56) + '" y="' + (y + 30) + '" font-size="15" font-weight="700" fill="#142333" font-family="system-ui">' + MT.esc(a.name) + '</text>';
      s += '<text x="' + (x + 56) + '" y="' + (y + 48) + '" font-size="12" fill="#4a5a6b" font-family="system-ui">' + n + ' Geräte · ' + (a.scenarios || []).length + ' Szenario' + ((a.scenarios || []).length === 1 ? '' : 's') + '</text>';
      // Mini-Raumskizze: Geräte als Punkte
      (a.placements || []).forEach(function (p) {
        var px = x + 16 + (p.x / 1600) * (w - 32), py = y + 70 + (p.y / 900) * (h - 120);
        s += '<rect x="' + px + '" y="' + py + '" width="' + Math.max(6, p.w / 1600 * (w - 32)) + '" height="' + Math.max(6, (p.w / 1600 * (w - 32)) * 0.6) + '" rx="2" fill="' + a.color + '" opacity="' + (MT.progress.data.viewed[p.device] ? '.85' : '.3') + '"/>';
      });
      // Fortschrittsbalken
      s += '<rect x="' + (x + 16) + '" y="' + (y + h - 30) + '" width="' + (w - 32) + '" height="8" rx="4" fill="#e5ebf1"/>';
      s += '<rect x="' + (x + 16) + '" y="' + (y + h - 30) + '" width="' + ((w - 32) * (n ? seen / n : 0)) + '" height="8" rx="4" fill="' + a.color + '"/>';
      s += '<text x="' + (x + w - 16) + '" y="' + (y + h - 36) + '" text-anchor="end" font-size="11" fill="#4a5a6b" font-family="system-ui">' + seen + '/' + n + ' erkundet</text>';
      if (a.complete) s += '<g transform="translate(' + (x + w - 92) + ',' + (y + 64) + ')"><rect width="80" height="20" rx="10" fill="#1f9d55"/><text x="40" y="14" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="system-ui">SCHWERPUNKT</text></g>';
      if (visited) s += '<circle cx="' + (x + w - 16) + '" cy="' + (y + 22) + '" r="7" fill="#1f9d55"/>';
      s += '</g>';
    });
    s += '</svg>';
    return s;
  }

  V.home = function (main) {
    var nDev = Object.keys(MT.devices).length, nScen = Object.keys(MT.scenarios).length, nSims = Object.keys(MT.sims).length;
    main.innerHTML =
      '<section class="home-hero">' +
      '<div class="card">' + hospitalMap() + '</div>' +
      '<div class="card hero-text"><h1>Willkommen im MedTech Simulator</h1>' +
      '<p class="lead">Erkunde ein virtuelles Krankenhaus und lerne die Medizintechnik im klinischen Alltag kennen: Welche Geräte stehen wo, wie funktionieren sie, wie arbeiten sie zusammen – und was tun, wenn es alarmiert?</p>' +
      '<div class="hero-stats"><div><b>' + MT.areas.length + '</b><span>Bereiche</span></div><div><b>' + nDev + '</b><span>Geräte</span></div><div><b>' + nScen + '</b><span>Szenarien</span></div></div>' +
      '<div class="row"><a class="btn primary" href="#/area/icu">▶ Start: Intensivstation</a><a class="btn" href="#/lab">🧪 Simulationslabor (' + nSims + ')</a><a class="btn" href="#/challenges">🎯 Herausforderungen</a></div>' +
      '<h3 style="margin-top:18px">So funktioniert es</h3><ol style="padding-left:18px;font-size:14px;margin:0 0 12px">' +
      '<li>Wähle einen Bereich auf dem Plan.</li><li>Klicke im Raum auf ein Gerät – rechts erscheinen Zweck, Funktion, Komponenten, Messwerte, Alarme und Verbindungen.</li>' +
      '<li>Starte ein <b>Lernszenario</b> und löse Aufgaben in einer simulierten Alltagssituation.</li><li>Vertiefe die Physik im <b>Simulationslabor</b> und teste dich in den <b>Herausforderungen</b>.</li></ol>' +
      '<p class="disclaimer"><b>Lernumgebung:</b> Alle Patientinnen, Patienten und Messwerte sind fiktiv. Die Simulationen sind vereinfachte Modelle und ersetzen weder Geräteeinweisung (MPBetreibV) noch Gebrauchsanweisung oder klinische Ausbildung. Geräteabbildungen sind generisch; genannte Hersteller sind Beispiele.</p>' +
      '</div></section>' +
      '<div class="area-cards">' + MT.areas.map(function (a) {
        return '<a class="area-card" style="--c:' + a.color + '" href="#/area/' + a.id + '"><h3><span>' + a.icon + '</span>' + MT.esc(a.name) + '</h3><p>' + MT.esc(a.description) + '</p><div class="meta"><span class="chip">' + (a.placements || []).length + ' Geräte</span><span class="chip">' + (a.scenarios || []).length + ' Szenario' + ((a.scenarios || []).length === 1 ? '' : 's') + '</span>' + (a.complete ? '<span class="chip ok">Schwerpunkt</span>' : '') + '</div></a>';
      }).join('') + '</div>';
    MT.$$('.dept', main).forEach(function (g) {
      var go = function () { location.hash = '#/area/' + g.getAttribute('data-area'); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  };

  /* ------------------------------------------------------------------
     Bereichsansicht
     ------------------------------------------------------------------ */
  V.area = function (main, id, params) {
    var area = MT.areaById[id];
    if (!area) { main.innerHTML = '<div class="card"><h2>Bereich nicht gefunden</h2><a href="#/">Zurück zum Plan</a></div>'; return; }
    MT.progress.visitArea(id);
    var state = { patient: null, vent: null };
    function resetState() {
      var fresh = area.createState ? area.createState() : { patient: MT.physio.createPatient(), vent: null };
      // In-place, damit Monitore die Referenz behalten
      if (!state.patient) { state.patient = fresh.patient; state.vent = fresh.vent; }
      else {
        Object.keys(fresh.patient).forEach(function (k) { state.patient[k] = fresh.patient[k]; });
        Object.keys(state.patient).forEach(function (k) { if (!(k in fresh.patient)) delete state.patient[k]; });
        if (fresh.vent) { if (!state.vent) state.vent = fresh.vent; else Object.keys(fresh.vent).forEach(function (k) { state.vent[k] = fresh.vent[k]; }); }
      }
    }
    resetState();

    main.innerHTML =
      '<div class="area-layout"><div class="area-main">' +
      '<div class="area-head"><a class="btn small" href="#/">← Plan</a><h1><span class="dot" style="background:' + area.color + '"></span>' + area.icon + ' ' + MT.esc(area.name) + '</h1>' + (area.complete ? '<span class="chip ok">Schwerpunktbereich · 4 Szenarien</span>' : '') + '<span class="spacer"></span>' +
      '<div class="row">' + MT.areas.map(function (a) { return '<a class="chip" style="' + (a.id === id ? 'background:' + a.color + ';color:#fff;border-color:' + a.color : '') + '" href="#/area/' + a.id + '" title="' + MT.esc(a.name) + '">' + a.icon + '</a>'; }).join('') + '</div></div>' +
      (area.patientInfo ? '<div class="patient-strip">🧾 <span><b>LERNSZENARIO · FIKTIV:</b> ' + MT.esc(area.patientInfo) + '</span></div>' : '') +
      '<div class="room-wrap"><div id="room-host"></div><div class="room-toolbar">' +
      '<button class="btn small" id="btn-labels" aria-pressed="false">🏷️ Beschriftungen</button>' +
      '<button class="btn small" id="btn-network">🔗 Geräteverbund</button>' +
      (area.createState ? '<button class="btn small" id="btn-bigmon">🖥️ Monitor groß</button>' : '') +
      '<span class="spacer"></span><span class="muted" style="font-size:12px">Tipp: Gerät anklicken oder mit <kbd>Tab</kbd> auswählen und <kbd>Enter</kbd> drücken</span></div></div>' +
      '<div class="device-chips" id="dev-chips"></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="font-size:16px">Über diesen Bereich</h3><p>' + MT.esc(area.description) + '</p>' +
      (area.learningGoals ? '<h4 style="font-size:13px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.5px">Lernziele</h4><ul class="safety-list">' + area.learningGoals.map(function (g) { return '<li>' + MT.esc(g) + '</li>'; }).join('') + '</ul>' : '') +
      (area.facts ? '<h4 style="font-size:13px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.5px">Wissenswertes</h4><ul class="safety-list">' + area.facts.map(function (g) { return '<li>' + MT.esc(g) + '</li>'; }).join('') + '</ul>' : '') +
      '</div></div>' +
      '<aside class="side" aria-label="Informationsfenster"><div class="side-tabs" role="tablist"><button data-tab="device" class="active">Gerät</button><button data-tab="scen">Szenarien (' + (area.scenarios || []).length + ')</button></div><div class="side-body" id="side-body"></div></aside></div>';

    var sideBody = MT.$('#side-body', main);
    var tab = 'device', selected = null;
    var room = MT.renderRoom(MT.$('#room-host', main), area, { onSelect: onSelect });

    // Live-Bildschirme
    room.liveHosts.forEach(function (lh) {
      if (lh.type === 'monitor' && state.patient) MT.createMonitor(lh.el, { patient: state.patient, compact: true, sound: true, title: area.monitorTitle });
      if (lh.type === 'ventilator' && state.vent) MT.createVentScreen(lh.el, function () { return state.vent; });
    });

    // Geräte-Chips
    var chips = MT.$('#dev-chips', main);
    function renderChips() {
      var seen = {};
      chips.innerHTML = '';
      (area.placements || []).forEach(function (p) {
        if (seen[p.device]) return; seen[p.device] = 1;
        var d = MT.devices[p.device]; if (!d) return;
        var b = MT.el('button', { class: 'device-chip' + (selected === p.device ? ' active' : ''), html: '<span class="seen' + (MT.progress.data.viewed[p.device] ? ' on' : '') + '"></span>' + MT.esc(d.short || d.name) });
        b.addEventListener('click', function () { onSelect(p.device); });
        chips.appendChild(b);
      });
    }
    renderChips();

    function onSelect(devId) {
      if (MT.activeScenario && MT.activeScenario.handleSelect(devId)) return;
      selected = devId;
      room.highlight(devId);
      setTab('device');
      renderChips();
      if (window.innerWidth < 1180) MT.$('.side', main).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setTab(t) {
      tab = t;
      MT.$$('.side-tabs button', main).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === t); });
      if (t === 'device') {
        if (MT.activeScenario) { MT.activeScenario.stop(); }
        if (selected) MT.renderDevicePanel(sideBody, selected, { areaId: id, onSelectDevice: function (other) { if ((area.placements || []).some(function (p) { return p.device === other; })) onSelect(other); else MT.renderDevicePanel(sideBody, other, {}); } });
        else sideBody.innerHTML = '<div class="empty-hint"><div class="big">👆</div><p><b>Klicke auf ein Gerät im Raum</b>, um Informationen zu Zweck, Funktion, Komponenten, Messwerten, Alarmen und Verbindungen zu sehen.</p>' +
          ((area.scenarios || []).length ? '<p>Oder starte ein <button class="linklike" id="go-scen">Lernszenario</button>.</p>' : '') + '</div>';
        var gs = MT.$('#go-scen', sideBody); if (gs) gs.addEventListener('click', function () { setTab('scen'); });
      } else {
        renderScenarioList();
      }
    }

    function renderScenarioList() {
      var list = (area.scenarios || []).map(function (sid) { return MT.scenarios[sid]; }).filter(Boolean);
      if (!list.length) { sideBody.innerHTML = '<p class="muted">Für diesen Bereich sind noch keine Szenarien hinterlegt.</p>'; return; }
      sideBody.innerHTML = '<p class="muted" style="font-size:13px">Simulierte Alltagssituationen mit fiktiven Patientendaten. Während eines Szenarios reagieren die Geräte im Raum.</p><div class="scen-list">' + list.map(function (s) {
        var res = MT.progress.data.scenarios[s.id];
        return '<div class="scen-card"><h3>' + MT.esc(s.title) + '</h3><p>' + MT.esc(s.summary || '') + '</p><div class="row"><span class="chip">' + MT.esc(s.level || '') + '</span>' + (s.duration ? '<span class="chip">⏱ ' + MT.esc(s.duration) + '</span>' : '') + (res ? '<span class="chip ok">✓ ' + res.score + '/' + res.max + '</span>' : '') + '<span class="spacer"></span><button class="btn small primary" data-scen="' + s.id + '">▶ Starten</button></div></div>';
      }).join('') + '</div>';
      MT.$$('[data-scen]', sideBody).forEach(function (b) {
        b.addEventListener('click', function () { startScenario(b.getAttribute('data-scen')); });
      });
    }

    function startScenario(sid) {
      var s = MT.scenarios[sid]; if (!s) return;
      if (MT.activeScenario) MT.activeScenario.stop();
      resetState();
      room.highlight(null);
      tab = 'scen';
      MT.$$('.side-tabs button', main).forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === 'scen'); });
      MT.runScenario(sideBody, s, { state: state, room: room, resetState: resetState, onExit: function () { resetState(); renderScenarioList(); } });
      if (window.innerWidth < 1180) sideBody.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    MT.$$('.side-tabs button', main).forEach(function (b) { b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); }); });

    var lblBtn = MT.$('#btn-labels', main), labelsOn = false;
    lblBtn.addEventListener('click', function () { labelsOn = !labelsOn; room.setLabels(labelsOn); lblBtn.setAttribute('aria-pressed', labelsOn); lblBtn.classList.toggle('primary', labelsOn); });
    MT.$('#btn-network', main).addEventListener('click', function () { MT.showNetwork(area, function (devId) { MT.closeModal(); onSelect(devId); }); });
    var bm = MT.$('#btn-bigmon', main);
    if (bm) bm.addEventListener('click', function () { showBigMonitor(state, area); });

    if (params && params.scenario && MT.scenarios[params.scenario]) startScenario(params.scenario);
    else if (params && params.device && MT.devices[params.device]) onSelect(params.device);
    else setTab('device');
  };

  function showBigMonitor(state, area) {
    var wrap = MT.el('div');
    var mon = MT.el('div', { class: 'big-monitor' });
    wrap.appendChild(mon);
    var info = MT.el('div', { class: 'row', style: 'margin-top:10px', html: '<span class="muted" style="font-size:13px">Live-Ansicht des Bettmonitors (fiktive Werte). Alarme folgen den Prioritäten hoch/mittel/niedrig. Ton über 🔇/🔊 in der Kopfzeile.</span><span class="spacer"></span><button class="btn small" id="bm-silence">🔕 Alarm 2 min pausieren</button>' });
    wrap.appendChild(info);
    var m;
    MT.modal({ title: '🖥️ Patientenmonitor – ' + MT.esc(area.name), size: 'wide', body: wrap, onClose: function () { if (m) m.destroy(); } });
    m = MT.createMonitor(mon, { patient: state.patient, sound: true });
    MT.$('#bm-silence', wrap).addEventListener('click', function () { m.silence(120); MT.toast('Akustischer Alarm für 2 min pausiert – optische Anzeige bleibt aktiv.'); });
  }

  /* ------------------------------------------------------------------
     Geräteverbund-Diagramm eines Bereichs
     ------------------------------------------------------------------ */
  MT.showNetwork = function (area, onPick) {
    var ids = [];
    (area.placements || []).forEach(function (p) { if (ids.indexOf(p.device) < 0 && MT.devices[p.device]) ids.push(p.device); });
    var W = 900, H = 560, cx = W / 2, cy = H / 2 + 10;
    var pos = {};
    ids.forEach(function (d, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / ids.length; pos[d] = [cx + Math.cos(a) * 360, cy + Math.sin(a) * 215]; });
    var types = Object.keys(MT.CONN_COLORS);
    var active = {}; types.forEach(function (t) { active[t] = true; });
    var wrap = MT.el('div');
    var filt = MT.el('div', { class: 'row', style: 'margin-bottom:10px' });
    var holder = MT.el('div');
    var detail = MT.el('div', { class: 'callout', html: 'Klicke auf ein Gerät, um seine Verbindungen hervorzuheben. Doppelklick öffnet die Geräteinfo.' });
    wrap.appendChild(filt); wrap.appendChild(holder); wrap.appendChild(detail);
    var sel = null;
    types.forEach(function (t) {
      var b = MT.el('button', { class: 'btn small', html: '<span style="color:' + MT.CONN_COLORS[t] + '">●</span> ' + t });
      b.style.borderColor = MT.CONN_COLORS[t];
      b.addEventListener('click', function () { active[t] = !active[t]; b.style.opacity = active[t] ? 1 : 0.4; draw(); });
      filt.appendChild(b);
    });
    function draw() {
      var s = '<svg class="net-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Geräteverbund ' + MT.esc(area.name) + '">';
      var drawn = {};
      ids.forEach(function (a) {
        (MT.devices[a].connections || []).forEach(function (c) {
          if (!pos[c.to] || !active[c.type]) return;
          var key = [a, c.to].sort().join('|') + c.type;
          if (drawn[key]) return; drawn[key] = 1;
          var hl = !sel || sel === a || sel === c.to;
          var p1 = pos[a], p2 = pos[c.to];
          var mx = (p1[0] + p2[0]) / 2 + (cy - (p1[1] + p2[1]) / 2) * 0.12, my = (p1[1] + p2[1]) / 2 + ((p1[0] + p2[0]) / 2 - cx) * 0.12;
          s += '<path class="edge" d="M' + p1[0] + ' ' + p1[1] + ' Q' + mx + ' ' + my + ' ' + p2[0] + ' ' + p2[1] + '" stroke="' + MT.CONN_COLORS[c.type] + '" opacity="' + (hl ? 0.85 : 0.08) + '"' + (c.type === 'Klinisch' ? ' stroke-dasharray="6 5"' : '') + '/>';
        });
      });
      ids.forEach(function (d) {
        var p = pos[d], name = MT.devices[d].short || MT.devices[d].name, tw = Math.min(190, name.length * 7.6 + 24);
        s += '<g class="node' + (sel === d ? ' sel' : '') + '" data-id="' + d + '" tabindex="0"><rect x="' + (p[0] - tw / 2) + '" y="' + (p[1] - 18) + '" width="' + tw + '" height="36" rx="18"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle">' + MT.esc(name) + '</text></g>';
      });
      s += '</svg>';
      holder.innerHTML = s;
      MT.$$('.node', holder).forEach(function (g) {
        var id = g.getAttribute('data-id');
        g.addEventListener('click', function () { sel = sel === id ? null : id; draw(); showDetail(); });
        g.addEventListener('dblclick', function () { if (onPick) onPick(id); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter') { sel = id; draw(); showDetail(); } });
      });
    }
    function showDetail() {
      if (!sel) { detail.innerHTML = 'Klicke auf ein Gerät, um seine Verbindungen hervorzuheben. Doppelklick öffnet die Geräteinfo.'; return; }
      var d = MT.devices[sel];
      var inArea = d.connections.filter(function (c) { return pos[c.to]; });
      var incoming = ids.filter(function (o) { return o !== sel && MT.devices[o].connections.some(function (c) { return c.to === sel; }); });
      detail.innerHTML = '<b>' + MT.esc(d.name) + '</b><br>' + (inArea.length ? inArea.map(function (c) { return '<span class="conn-type ' + c.type + '" style="display:inline-block;margin:4px 6px 0 0">' + c.type + '</span>→ <b>' + MT.esc(MT.devices[c.to].short || MT.devices[c.to].name) + '</b>: ' + MT.esc(c.desc); }).join('<br>') : 'Keine direkten Verbindungen zu Geräten in diesem Raum.') +
        (incoming.length ? '<br><small class="muted">Wird außerdem genutzt von: ' + incoming.map(function (o) { return MT.esc(MT.devices[o].short || MT.devices[o].name); }).join(', ') + '</small>' : '') +
        '<div style="margin-top:8px"><button class="btn small" id="net-open">Geräteinfo öffnen</button></div>';
      MT.$('#net-open', detail).addEventListener('click', function () { if (onPick) onPick(sel); });
    }
    draw();
    MT.modal({ title: '🔗 Geräteverbund – ' + MT.esc(area.name), size: 'wide', body: wrap });
  };

  /* ------------------------------------------------------------------
     Gerätekatalog
     ------------------------------------------------------------------ */
  V.devices = function (main, params) {
    var cats = {};
    Object.keys(MT.devices).forEach(function (k) { cats[MT.devices[k].category || 'Sonstige'] = 1; });
    main.innerHTML = '<div class="page-head"><div><h1>Gerätekatalog</h1><p>Alle Medizingeräte des virtuellen Krankenhauses. Suche nach Namen, Funktion oder Messwert.</p></div></div>' +
      '<div class="catalog-tools"><input type="search" id="cat-q" placeholder="Suchen, z. B. „PEEP“, „Okklusion“, „Röntgen“ …" aria-label="Geräte durchsuchen"><select id="cat-c" aria-label="Kategorie"><option value="">Alle Kategorien</option>' + Object.keys(cats).sort().map(function (c) { return '<option>' + MT.esc(c) + '</option>'; }).join('') + '</select>' +
      '<select id="cat-a" aria-label="Bereich"><option value="">Alle Bereiche</option>' + MT.areas.map(function (a) { return '<option value="' + a.id + '">' + MT.esc(a.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="cat-grid" id="cat-grid"></div>';
    var q = MT.$('#cat-q', main), c = MT.$('#cat-c', main), a = MT.$('#cat-a', main), grid = MT.$('#cat-grid', main);
    function render() {
      var term = q.value.trim().toLowerCase();
      var list = Object.keys(MT.devices).map(function (k) { return MT.devices[k]; }).filter(function (d) {
        if (c.value && (d.category || 'Sonstige') !== c.value) return false;
        if (a.value && !MT.areasWithDevice(d.id).some(function (x) { return x.id === a.value; })) return false;
        if (!term) return true;
        var hay = [d.name, d.short, d.purpose, d.function, d.category].concat(d.measurements.map(function (m) { return m.name; }), d.alarms.map(function (m) { return m.name; }), d.components.map(function (m) { return m.name; })).join(' ').toLowerCase();
        return hay.indexOf(term) >= 0;
      }).sort(function (x, y) { return x.name.localeCompare(y.name, 'de'); });
      grid.innerHTML = list.length ? list.map(function (d) {
        return '<button class="cat-item" data-id="' + d.id + '"><div class="dev-thumb">' + MT.deviceThumb(d.id) + '</div><div><h4>' + MT.esc(d.name) + '</h4><small>' + MT.esc(d.category || '') + ' · ' + MT.areasWithDevice(d.id).map(function (x) { return x.short || x.name; }).join(', ') + '</small>' + (MT.progress.data.viewed[d.id] ? '<br><span class="chip ok" style="margin-top:4px">✓ angesehen</span>' : '') + '</div></button>';
      }).join('') : '<p class="muted">Keine Treffer.</p>';
      MT.$$('.cat-item', grid).forEach(function (b) {
        b.addEventListener('click', function () {
          var body = MT.el('div');
          MT.modal({ title: MT.esc(MT.devices[b.getAttribute('data-id')].name), body: body });
          MT.renderDevicePanel(body, b.getAttribute('data-id'), {});
        });
      });
    }
    [q, c, a].forEach(function (e) { e.addEventListener('input', render); });
    if (params && params.q) q.value = params.q;
    render();
  };

  /* ------------------------------------------------------------------
     Fortschritt
     ------------------------------------------------------------------ */
  V.progress = function (main) {
    var P = MT.progress.data;
    var devIds = Object.keys(MT.devices);
    var seen = devIds.filter(function (d) { return P.viewed[d]; }).length;
    var scen = Object.keys(MT.scenarios);
    var scenDone = scen.filter(function (s) { return P.scenarios[s]; }).length;
    var sims = Object.keys(MT.sims);
    var simDone = sims.filter(function (s) { return P.sims[s]; }).length;
    var chs = MT.CHALLENGES || [];
    var chDone = chs.filter(function (c) { return P.challenges[c.id]; }).length;
    function bar(a, b) { return '<div class="progress-bar"><div style="width:' + (b ? Math.round(a / b * 100) : 0) + '%"></div></div><small class="muted">' + a + ' / ' + b + '</small>'; }
    main.innerHTML = '<div class="page-head"><div><h1>Dein Lernfortschritt</h1><p>Wird lokal in deinem Browser gespeichert (keine Übertragung).</p></div><span class="spacer"></span><button class="btn small" id="reset">Fortschritt zurücksetzen</button></div>' +
      '<div class="stat-grid">' +
      '<div class="card"><h3>🩺 Geräte erkundet</h3>' + bar(seen, devIds.length) + '</div>' +
      '<div class="card"><h3>🎬 Szenarien abgeschlossen</h3>' + bar(scenDone, scen.length) + '</div>' +
      '<div class="card"><h3>🧪 Simulationen genutzt</h3>' + bar(simDone, sims.length) + '</div>' +
      '<div class="card"><h3>🎯 Herausforderungen</h3>' + bar(chDone, chs.length) + '</div></div>' +
      '<div class="card" style="margin-top:16px"><h3>Bereiche</h3><table class="meas-table"><thead><tr><th>Bereich</th><th>Geräte erkundet</th><th>Szenarien</th></tr></thead><tbody>' +
      MT.areas.map(function (a) {
        var ids = []; (a.placements || []).forEach(function (p) { if (ids.indexOf(p.device) < 0) ids.push(p.device); });
        var s = ids.filter(function (d) { return P.viewed[d]; }).length;
        return '<tr><td><a href="#/area/' + a.id + '">' + a.icon + ' ' + MT.esc(a.name) + '</a></td><td>' + s + ' / ' + ids.length + '</td><td>' + (a.scenarios || []).map(function (sid) { var r = P.scenarios[sid]; var sc = MT.scenarios[sid]; return sc ? '<span class="chip ' + (r ? 'ok' : '') + '" style="margin:2px">' + MT.esc(sc.title) + (r ? ' ✓ ' + r.score + '/' + r.max : '') + '</span>' : ''; }).join('') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    MT.$('#reset', main).addEventListener('click', function () { if (confirm('Gesamten Lernfortschritt löschen?')) { MT.progress.reset(); V.progress(main); } });
  };

  /* ------------------------------------------------------------------
     Simulationslabor (Rahmen)
     ------------------------------------------------------------------ */
  var SIM_ORDER = ['ventilation', 'ecg', 'spo2', 'bloodpressure', 'infusion', 'defibrillation', 'imaging'];
  V.lab = function (main, simId) {
    var ids = SIM_ORDER.filter(function (s) { return MT.sims[s]; });
    Object.keys(MT.sims).forEach(function (s) { if (ids.indexOf(s) < 0) ids.push(s); });
    if (!simId || !MT.sims[simId]) simId = ids[0];
    var sim = MT.sims[simId];
    MT.progress.useSim(simId);
    main.innerHTML = '<div class="page-head"><div><h1>🧪 Simulationslabor</h1><p>Vereinfachte, wissenschaftlich nachvollziehbare Modelle. Verändere Parameter und beobachte die Auswirkungen – alle Werte sind fiktiv.</p></div></div>' +
      '<div class="lab-layout"><nav class="lab-nav" aria-label="Simulationen">' + ids.map(function (s) { var x = MT.sims[s]; return '<a href="#/lab/' + s + '" class="' + (s === simId ? 'active' : '') + '"><span class="ico">' + x.icon + '</span><span>' + MT.esc(x.title) + '<small>' + MT.esc(x.subtitle || '') + '</small></span></a>'; }).join('') + '</nav>' +
      '<section class="card" id="sim-host" aria-live="polite"></section></div>';
    var host = MT.$('#sim-host', main);
    host.innerHTML = '<div class="row" style="margin-bottom:10px"><h2 style="margin:0">' + sim.icon + ' ' + MT.esc(sim.title) + '</h2><span class="spacer"></span>' + (sim.devices || []).map(function (d) { return MT.devices[d] ? '<button class="chip" data-dev="' + d + '">' + MT.esc(MT.devices[d].short || MT.devices[d].name) + '</button>' : ''; }).join('') + '</div><div id="sim-body"></div>';
    MT.$$('[data-dev]', host).forEach(function (b) { b.addEventListener('click', function () { var body = MT.el('div'); MT.modal({ title: MT.esc(MT.devices[b.getAttribute('data-dev')].name), body: body }); MT.renderDevicePanel(body, b.getAttribute('data-dev'), {}); }); });
    sim.mount(MT.$('#sim-body', host));
  };
})();
