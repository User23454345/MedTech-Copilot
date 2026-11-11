/* =====================================================================
   Interaktive Herausforderungen
   1. Gerät finden  2. Geräte ↔ Aufgaben zuordnen  3. Komponenten identifizieren
   4. Alarm erkennen  5. Geräteverbund erklären
   Aufgaben werden aus der Gerätedatenbank erzeugt.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;
  MT.views = MT.views || {};

  MT.CHALLENGES = [
    { id: 'find', icon: '🔎', title: 'Finde das Gerät', desc: 'Eine Aufgabe wird beschrieben – klicke im Raum auf das passende Gerät.', area: true },
    { id: 'match', icon: '🧩', title: 'Geräte ↔ Aufgaben', desc: 'Ordne Geräte ihrem medizinischen Zweck zu.', area: true },
    { id: 'components', icon: '⚙️', title: 'Komponenten identifizieren', desc: 'Finde technische Bauteile an der Gerätedarstellung.' },
    { id: 'alarm', icon: '🚨', title: 'Alarm erkennen', desc: 'Ein Monitor zeigt eine Situation – erkenne Alarm, Artefakt oder Notfall.' },
    { id: 'network', icon: '🔗', title: 'Geräteverbund erklären', desc: 'Welche Geräte hängen wie voneinander ab – Gas, Strom, Daten, Fluide?', area: true }
  ];

  function firstSentence(t) { var m = String(t).match(/^.*?[.!?](\s|$)/); return (m ? m[0] : t).trim(); }
  function deviceIdsOf(area) { var ids = []; (area.placements || []).forEach(function (p) { if (ids.indexOf(p.device) < 0 && MT.devices[p.device]) ids.push(p.device); }); return ids; }
  function pick(arr, n) { return MT.shuffle(arr).slice(0, n); }

  MT.views.challenges = function (main) {
    var P = MT.progress.data.challenges;
    main.innerHTML = '<div class="page-head"><div><h1>🎯 Herausforderungen</h1><p>Teste dein Wissen. Die Aufgaben werden aus der Gerätedatenbank zusammengestellt und sind bei jedem Durchgang anders.</p></div></div>' +
      '<div class="ch-grid">' + MT.CHALLENGES.map(function (c) {
        var r = P[c.id];
        return '<div class="ch-card"><div class="ico">' + c.icon + '</div><h3>' + c.title + '</h3><p>' + c.desc + '</p><div class="row">' + (r ? '<span class="chip ok">Bestwert ' + r.score + '/' + r.max + '</span>' : '<span class="chip">noch offen</span>') + '<span class="spacer"></span><a class="btn primary small" href="#/challenge/' + c.id + '">Starten ▶</a></div></div>';
      }).join('') + '</div>' +
      '<div class="card" style="margin-top:16px"><h3>Szenarien</h3><p class="muted">Klinische Lernszenarien findest du in den einzelnen Bereichen (Tab „Szenarien“ im Informationsfenster).</p><div class="row">' +
      Object.keys(MT.scenarios).map(function (k) { var s = MT.scenarios[k], a = MT.areaById[s.area]; return a ? '<a class="chip" href="#/area/' + a.id + '?scenario=' + k + '">' + a.icon + ' ' + MT.esc(s.title) + '</a>' : ''; }).join('') + '</div></div>';
  };

  MT.views.challenge = function (main, id, q) {
    var ch = MT.CHALLENGES.filter(function (c) { return c.id === id; })[0];
    if (!ch) { location.hash = '#/challenges'; return; }
    var areas = MT.areas.filter(function (a) { return deviceIdsOf(a).length >= 4; });
    var areaId = q && q.area && MT.areaById[q.area] ? q.area : 'icu';
    main.innerHTML = '<div class="page-head"><div><a class="btn small" href="#/challenges">← Übersicht</a><h1 style="margin-top:8px">' + ch.icon + ' ' + ch.title + '</h1><p>' + ch.desc + '</p></div><span class="spacer"></span>' +
      (ch.area ? '<label class="ctrl" style="min-width:220px"><span style="font-size:13px;font-weight:600">Bereich</span><select id="ch-area" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--line)">' + areas.map(function (a) { return '<option value="' + a.id + '"' + (a.id === areaId ? ' selected' : '') + '>' + a.icon + ' ' + MT.esc(a.name) + '</option>'; }).join('') + '</select></label>' : '') +
      '</div><div id="ch-body"></div>';
    var sel = MT.$('#ch-area', main);
    if (sel) sel.addEventListener('change', function () { location.hash = '#/challenge/' + id + '?area=' + sel.value; });
    var body = MT.$('#ch-body', main);
    RUN[id](body, MT.areaById[areaId], q || {});
  };

  /* ---------- gemeinsame Ergebnisanzeige ---------- */
  function finish(host, id, score, max, again) {
    MT.progress.challenge(id, score, max);
    var pct = Math.round(score / max * 100);
    host.innerHTML = '<div class="card" style="max-width:560px;margin:20px auto;text-align:center"><h2>Ergebnis</h2><div class="score-big">' + score + ' / ' + max + '</div><p>' +
      (pct >= 80 ? '🏆 Hervorragend!' : pct >= 50 ? '👍 Gut – mit etwas Übung wird es perfekt.' : '📚 Schau dir die Geräteinfos noch einmal an und versuche es erneut.') + '</p><div class="row" style="justify-content:center"><button class="btn primary" id="again">↻ Nochmal</button><a class="btn" href="#/challenges">Andere Herausforderung</a></div></div>';
    MT.$('#again', host).addEventListener('click', again);
  }
  function hud(i, n, score) { return '<div class="row" style="margin-bottom:10px"><span class="chip">Aufgabe ' + (i + 1) + ' / ' + n + '</span><span class="chip ok">Punkte ' + score + '</span></div><div class="scen-progress"><div style="width:' + Math.round(i / n * 100) + '%"></div></div>'; }

  var RUN = {};

  /* ---------- 1. Gerät finden ---------- */
  RUN.find = function (host, area) {
    var ids = pick(deviceIdsOf(area), Math.min(8, deviceIdsOf(area).length));
    var i = 0, score = 0, tries = 0;
    host.innerHTML = '<div class="area-layout"><div><div id="f-hud"></div><div class="room-wrap"><div id="f-room"></div></div></div><aside class="side"><div class="side-body" id="f-side"></div></aside></div>';
    var room = MT.renderRoom(MT.$('#f-room', host), area, { onSelect: onSel });
    function show() {
      tries = 0;
      MT.$('#f-hud', host).innerHTML = hud(i, ids.length, score);
      var d = MT.devices[ids[i]];
      MT.$('#f-side', host).innerHTML = '<h3>Welches Gerät ist gemeint?</h3><div class="prompt" style="background:#eaf2fb;border:1px solid #cfe0f2;border-radius:10px;padding:12px;font-weight:600">' + MT.esc(firstSentence(d.purpose)) + '</div><p class="muted" style="font-size:13px">Klicke im Raum auf das Gerät. Beim ersten Versuch richtig = 1 Punkt.</p><div id="f-fb"></div>';
    }
    function onSel(dev) {
      if (i >= ids.length) return;
      var fb = MT.$('#f-fb', host);
      if (dev === ids[i]) {
        if (!tries) score++;
        room.flash(dev, 'flash-ok');
        fb.innerHTML = '<div class="feedback ok">✅ Richtig: <b>' + MT.esc(MT.devices[dev].name) + '</b></div>';
        i++;
        setTimeout(function () { if (i >= ids.length) finish(host, 'find', score, ids.length, function () { RUN.find(host, area); }); else show(); }, 900);
      } else {
        tries++; room.flash(dev, 'flash-bad');
        fb.innerHTML = '<div class="feedback bad">❌ Das ist <b>' + MT.esc(MT.devices[dev].name) + '</b>. ' + (tries >= 2 ? 'Tipp: gesucht ist „' + MT.esc(MT.devices[ids[i]].short || MT.devices[ids[i]].name) + '“.' : 'Versuche es noch einmal.') + '</div>';
      }
    }
    show();
  };

  /* ---------- 2. Zuordnen ---------- */
  RUN.match = function (host, area) {
    var ids = pick(deviceIdsOf(area), 5);
    var left = MT.shuffle(ids), right = MT.shuffle(ids);
    var selL = null, done = {}, errors = 0;
    host.innerHTML = '<div class="card"><p>Wähle links ein Gerät und rechts den passenden Zweck. Fehlversuche werden gezählt.</p><div class="match-cols"><div id="m-l"></div><div id="m-r"></div></div><div id="m-fb"></div></div>';
    var L = MT.$('#m-l', host), Rr = MT.$('#m-r', host);
    left.forEach(function (d) {
      var b = MT.el('div', { class: 'match-item', tabindex: '0', role: 'button', 'data-id': d, html: '<span style="width:46px;height:46px;flex:none" class="dev-thumb">' + MT.deviceThumb(d) + '</span><b>' + MT.esc(MT.devices[d].name) + '</b>' });
      b.addEventListener('click', function () { if (done[d]) return; selL = d; MT.$$('.match-item', L).forEach(function (x) { x.classList.toggle('sel', x === b); }); });
      L.appendChild(b);
    });
    right.forEach(function (d) {
      var b = MT.el('div', { class: 'match-item', tabindex: '0', role: 'button', 'data-id': d, text: firstSentence(MT.devices[d].purpose) });
      b.addEventListener('click', function () {
        if (done[d] || !selL) return;
        if (selL === d) {
          done[d] = 1;
          b.classList.add('done'); MT.$('[data-id="' + d + '"]', L).classList.add('done'); MT.$('[data-id="' + d + '"]', L).classList.remove('sel');
          selL = null;
          if (Object.keys(done).length === ids.length) {
            var sc = Math.max(0, ids.length - errors);
            setTimeout(function () { finish(host, 'match', sc, ids.length, function () { RUN.match(host, area); }); }, 700);
          }
        } else {
          errors++; b.classList.remove('err'); void b.offsetWidth; b.classList.add('err');
          MT.$('#m-fb', host).innerHTML = '<div class="feedback bad">Nicht passend. Fehlversuche: ' + errors + '</div>';
        }
      });
      Rr.appendChild(b);
    });
  };

  /* ---------- 3. Komponenten ---------- */
  RUN.components = function (host, area, q) {
    var list = Object.keys(MT.devices).filter(function (k) { return (MT.devices[k].parts || []).length >= 3; });
    var devId = q.device && list.indexOf(q.device) >= 0 ? q.device : list[0];
    host.innerHTML = '<div class="row" style="margin-bottom:10px"><label style="font-weight:600;font-size:14px">Gerät: <select id="c-dev" style="padding:8px;border-radius:8px;border:1px solid var(--line)">' + list.map(function (k) { return '<option value="' + k + '"' + (k === devId ? ' selected' : '') + '>' + MT.esc(MT.devices[k].name) + '</option>'; }).join('') + '</select></label></div><div class="sim-grid"><div class="parts-stage" id="c-stage"></div><div class="card" id="c-side"></div></div>';
    MT.$('#c-dev', host).addEventListener('change', function (e) { location.hash = '#/challenge/components?device=' + e.target.value; });
    var d = MT.devices[devId], v = MT.deviceVisual(devId), sp = MT.sprites[v.visual] || MT.sprites.generic;
    var order = MT.shuffle(d.parts.map(function (p, i) { return i; }));
    var k = 0, score = 0, tries = 0;
    var markers = d.parts.map(function (p, i) {
      return '<g class="part-marker" data-i="' + i + '" tabindex="0" role="button" aria-label="Markierung ' + (i + 1) + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + Math.max(9, sp.vb[0] / 18) + '"/><text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle">' + (i + 1) + '</text></g>';
    }).join('');
    var pad = 20;
    MT.$('#c-stage', host).innerHTML = '<svg viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (sp.vb[0] + 2 * pad) + ' ' + (sp.vb[1] + 2 * pad) + '"><defs>' + MT.spriteDefs + '</defs>' + sp.draw(v.opts) + markers + '</svg>';
    function show() {
      tries = 0;
      var part = d.parts[order[k]];
      var comp = d.components.filter(function (c) { return c.name === part.name; })[0];
      MT.$('#c-side', host).innerHTML = hud(k, order.length, score) + '<h3>Wo befindet sich …</h3><div class="prompt" style="background:#eaf2fb;border:1px solid #cfe0f2;border-radius:10px;padding:12px"><b>' + MT.esc(part.name) + '</b>' + (comp ? '<br><small>' + MT.esc(comp.desc) + '</small>' : '') + '</div><p class="muted" style="font-size:13px">Klicke auf die richtige nummerierte Markierung.</p><div id="c-fb"></div>';
    }
    MT.$$('.part-marker', host).forEach(function (g) {
      g.addEventListener('click', function () {
        if (k >= order.length) return;
        var i = +g.getAttribute('data-i'), fb = MT.$('#c-fb', host);
        if (i === order[k]) {
          if (!tries) score++;
          g.classList.add('ok');
          fb.innerHTML = '<div class="feedback ok">✅ Richtig!</div>';
          k++;
          setTimeout(function () { if (k >= order.length) finish(host, 'components', score, order.length, function () { RUN.components(host, area, { device: devId }); }); else show(); }, 700);
        } else {
          tries++; g.classList.add('bad'); setTimeout(function () { g.classList.remove('bad'); }, 700);
          fb.innerHTML = '<div class="feedback bad">❌ Markierung ' + (i + 1) + ' ist: <b>' + MT.esc(d.parts[i].name) + '</b>.</div>';
        }
      });
    });
    show();
  };

  /* ---------- 4. Alarm erkennen ---------- */
  var ALARM_CASES = [
    { set: { rhythm: 'vf', hr: 0 }, q: 'Der Monitor alarmiert rot. Was liegt vor?', a: 'Kammerflimmern – Kreislaufstillstand, sofort Reanimation und Defibrillation', d: ['Bewegungsartefakt bei Lagerung', 'EKG-Elektrode gelöst', 'Sinustachykardie'], ex: 'Chaotisches EKG, keine Pulswellen in SpO₂ und ART: Kammerflimmern. Der Patient hat keinen Kreislauf.' },
    { set: { ecgLeadOff: true }, q: 'Die EKG-Kurve ist eine Nulllinie, der Monitor meldet einen gelben Alarm. Pleth- und ART-Kurve zeigen Pulse. Was ist los?', a: 'Technischer Alarm: EKG-Ableitung gelöst – keine Asystolie', d: ['Asystolie – sofort reanimieren', 'Kammerflimmern', 'Bradykardie'], ex: 'Die Pulswellen beweisen eine Herzaktion. Die Nulllinie ist technisch bedingt – Elektroden prüfen.' },
    { set: { spo2Probe: 'off' }, q: 'Die SpO₂-Kurve ist flach und der Wert zeigt „--“. EKG und ART sind unauffällig. Was ist die Ursache?', a: 'SpO₂-Sensor abgefallen oder schlecht positioniert (technischer Alarm)', d: ['Schwere Hypoxie', 'Kreislaufstillstand', 'Lungenembolie'], ex: 'Bei unauffälligem EKG und ART deutet ein fehlendes SpO₂-Signal auf ein Sensorproblem hin. Trotzdem: Patient ansehen!' },
    { set: { tubeDisconnect: true, spo2: 91 }, q: 'Ein beatmeter Patient: Die CO₂-Kurve ist plötzlich flach, etCO₂ = 0. Was ist die wahrscheinlichste Ursache?', a: 'Diskonnektion oder Tubusdislokation – keine Ventilation messbar', d: ['Fieber', 'Sensor zu warm', 'Hyperventilation'], ex: 'Plötzlicher Verlust der Kapnographiekurve = Diskonnektion, Tubusfehllage oder Kreislaufstillstand, bis das Gegenteil bewiesen ist.' },
    { set: { artDamping: 'over' }, q: 'Die arterielle Kurve wirkt „verschliffen“, die Systole niedriger als bei der NIBP-Messung, der MAP passt. Ursache?', a: 'Überdämpftes Drucksystem (z. B. Luftblase, Gerinnsel, Knick)', d: ['Septischer Schock', 'Wandler zu tief positioniert', 'Unterdämpftes System'], ex: 'Überdämpfung senkt die Systole und hebt die Diastole an, der MAP bleibt annähernd korrekt. Fast-Flush-Test durchführen, System entlüften.' },
    { set: { rhythm: 'afib', hr: 138 }, q: 'Der Monitor zeigt „HF HOCH“ mit unregelmäßigen RR-Abständen ohne erkennbare P-Wellen. Welcher Rhythmus?', a: 'Tachyarrhythmie bei Vorhofflimmern', d: ['Sinustachykardie', 'Kammerflimmern', 'AV-Block III°'], ex: 'Absolut unregelmäßige Kammerfrequenz ohne P-Wellen ist typisch für Vorhofflimmern.' },
    { set: { rhythm: 'stemi', hr: 92 }, q: 'Gelber Alarm „ST-HEBUNG II“. Was ist zu tun?', a: '12-Kanal-EKG schreiben, Arzt informieren – Verdacht auf akuten Myokardinfarkt', d: ['Alarm ignorieren – ST-Analyse ist unzuverlässig', 'Sofort defibrillieren', 'Elektroden wechseln, weiter nichts'], ex: 'Eine ST-Hebung am Monitor muss durch ein diagnostisches 12-Kanal-EKG abgeklärt werden.' },
    { set: { rhythm: 'avb3', hr: 34, sys: 88, dia: 50 }, q: 'Sehr langsame, breite Kammerkomplexe; P-Wellen laufen unabhängig durch. Was liegt vor?', a: 'AV-Block III. Grades mit Kammerersatzrhythmus', d: ['Sinusbradykardie', 'Vorhofflattern', 'Asystolie'], ex: 'Vollständige Dissoziation von Vorhöfen und Kammern – ggf. Schrittmacher (transkutan/temporär) nötig.' },
    { set: { motionArtifact: true }, q: 'Während der Lagerung zeigt das EKG wilde Ausschläge, die ART-Kurve ist unverändert regelmäßig. Was ist es?', a: 'Bewegungsartefakt', d: ['Kammerflimmern', 'Ventrikuläre Tachykardie', 'Hypoglykämie'], ex: 'Eine stabile arterielle Pulskurve schließt einen Kreislaufstillstand aus. Artefakte entstehen durch Muskelaktivität und Kabelbewegung.' },
    { set: { bronchospasm: true, etco2: 52, spo2: 90, rr: 14 }, q: 'Die Kapnographiekurve steigt flach und „haifischflossenartig“ an, etCO₂ erhöht. Was deutet das an?', a: 'Obstruktion der Atemwege (z. B. Bronchospasmus)', d: ['Diskonnektion', 'Hypothermie', 'Normale Kurve'], ex: 'Verlangsamte Exspiration bei Obstruktion verformt das Plateau zur „Haifischflosse“.' },
    { set: { sys: 72, dia: 40, hr: 124 }, q: 'Rote Alarme ART SYS NIEDRIG, HF 124, regelmäßiger Sinusrhythmus. Wandler korrekt genullt. Einordnung?', a: 'Echte Hypotonie mit Kompensationstachykardie – Patient beurteilen, Ursache klären (z. B. Volumenmangel, Vasopressor-Pumpe?)', d: ['Messfehler, kann ignoriert werden', 'Kammerflimmern', 'Technischer Alarm'], ex: 'Hypotonie plus Tachykardie bei korrektem Messsystem ist ein echtes Kreislaufproblem.' }
  ];

  RUN.alarm = function (host) {
    var cases = pick(ALARM_CASES, 6), i = 0, score = 0, mon = null;
    host.innerHTML = '<div class="sim-grid"><div><div id="a-hud"></div><div class="big-monitor" id="a-mon"></div><p class="muted" style="font-size:12px;margin-top:6px">Lernsimulation · fiktiver Patient · Ton über 🔇/🔊 oben rechts</p></div><div class="card" id="a-side"></div></div>';
    function show() {
      if (mon) mon.destroy();
      var c = cases[i];
      var p = MT.physio.createPatient({ hr: 84, spo2: 96, sys: 122, dia: 70 });
      Object.keys(c.set).forEach(function (k) { p[k] = c.set[k]; });
      mon = MT.createMonitor(MT.$('#a-mon', host), { patient: p, sound: true, title: 'Herausforderung · fiktiver Patient' });
      MT.$('#a-hud', host).innerHTML = hud(i, cases.length, score);
      var opts = MT.shuffle([c.a].concat(c.d));
      var side = MT.$('#a-side', host);
      side.innerHTML = '<h3>' + MT.esc(c.q) + '</h3>' + opts.map(function (o) { return '<button class="opt">' + MT.esc(o) + '</button>'; }).join('') + '<div id="a-fb"></div>';
      var answered = false;
      MT.$$('.opt', side).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return; answered = true;
          var ok = b.textContent === c.a;
          if (ok) score++;
          MT.$$('.opt', side).forEach(function (x) { x.disabled = true; if (x.textContent === c.a) x.classList.add('correct'); });
          if (!ok) b.classList.add('wrong');
          MT.$('#a-fb', side).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✅ ' : '❌ ') + MT.esc(c.ex) + '</div><button class="btn primary" id="a-next">' + (i === cases.length - 1 ? 'Auswertung' : 'Nächster Fall →') + '</button>';
          MT.$('#a-next', side).addEventListener('click', function () { i++; if (i >= cases.length) { mon.destroy(); finish(host, 'alarm', score, cases.length, function () { RUN.alarm(host); }); } else show(); });
        });
      });
    }
    show();
  };

  /* ---------- 5. Geräteverbund ---------- */
  var TYPE_EXPL = { Gas: 'medizinische Gase / Vakuum', Strom: 'Energieversorgung', Daten: 'Datenübertragung / Vernetzung', Fluid: 'Flüssigkeiten / Infusionen / Blut', Signal: 'Messsignal', Klinisch: 'klinisch-funktioneller Zusammenhang', Strahlung: 'ionisierende Strahlung / Bildgebung' };
  RUN.network = function (host, area) {
    var ids = deviceIdsOf(area);
    var pool = [];
    ids.forEach(function (a) { (MT.devices[a].connections || []).forEach(function (c) { if (ids.indexOf(c.to) >= 0) pool.push({ from: a, c: c }); }); });
    if (pool.length < 3) { host.innerHTML = '<div class="card">In diesem Bereich gibt es zu wenige Verbindungen. Wähle einen anderen Bereich.</div>'; return; }
    var qs = pick(pool, Math.min(8, pool.length)).map(function (e, i) {
      var A = MT.devices[e.from], B = MT.devices[e.c.to];
      if (i % 2 === 0) {
        var others = pick(ids.filter(function (x) { return x !== e.c.to && x !== e.from; }), 3);
        return { q: '<b>' + MT.esc(A.short || A.name) + '</b> → ? &nbsp;<span class="conn-type ' + e.c.type + '" style="display:inline-block">' + e.c.type + '</span><br>„' + MT.esc(e.c.desc) + '“<br><br>Mit welchem Gerät besteht diese Verbindung?', opts: [e.c.to].concat(others).map(function (x) { return { t: MT.devices[x].short || MT.devices[x].name, ok: x === e.c.to }; }) };
      }
      var types = pick(Object.keys(TYPE_EXPL).filter(function (t) { return t !== e.c.type; }), 3);
      return { q: 'Welche Art von Verbindung besteht zwischen <b>' + MT.esc(A.short || A.name) + '</b> und <b>' + MT.esc(B.short || B.name) + '</b>?<br><small class="muted">„' + MT.esc(e.c.desc) + '“</small>', opts: [e.c.type].concat(types).map(function (t) { return { t: t + ' – ' + TYPE_EXPL[t], ok: t === e.c.type }; }) };
    });
    var i = 0, score = 0;
    host.innerHTML = '<div class="sim-grid"><div class="card" id="n-q"></div><div class="card"><h3>Geräteverbund</h3><p class="muted" style="font-size:13px">Öffne zur Orientierung das Verbunddiagramm des Bereichs.</p><button class="btn" id="n-net">🔗 Verbunddiagramm</button><div class="callout" style="margin-top:12px">' + Object.keys(TYPE_EXPL).map(function (t) { return '<div><span style="color:' + MT.CONN_COLORS[t] + ';font-weight:700">● ' + t + '</span>: ' + TYPE_EXPL[t] + '</div>'; }).join('') + '</div></div></div>';
    MT.$('#n-net', host).addEventListener('click', function () { MT.showNetwork(area); });
    function show() {
      var q = qs[i], box = MT.$('#n-q', host);
      var opts = MT.shuffle(q.opts);
      box.innerHTML = hud(i, qs.length, score) + '<p>' + q.q + '</p>' + opts.map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + MT.esc(o.t) + '</button>'; }).join('') + '<div id="n-fb"></div>';
      var answered = false;
      MT.$$('.opt', box).forEach(function (b) {
        b.addEventListener('click', function () {
          if (answered) return; answered = true;
          var o = opts[+b.getAttribute('data-k')];
          if (o.ok) score++;
          MT.$$('.opt', box).forEach(function (x) { x.disabled = true; if (opts[+x.getAttribute('data-k')].ok) x.classList.add('correct'); });
          if (!o.ok) b.classList.add('wrong');
          MT.$('#n-fb', box).innerHTML = '<div class="feedback ' + (o.ok ? 'ok' : 'bad') + '">' + (o.ok ? '✅ Richtig!' : '❌ Leider nicht.') + '</div><button class="btn primary" id="n-next">' + (i === qs.length - 1 ? 'Auswertung' : 'Weiter →') + '</button>';
          MT.$('#n-next', box).addEventListener('click', function () { i++; if (i >= qs.length) finish(host, 'network', score, qs.length, function () { RUN.network(host, area); }); else show(); });
        });
      });
    }
    show();
  };
})();
