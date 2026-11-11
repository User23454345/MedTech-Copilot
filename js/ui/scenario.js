/* =====================================================================
   Szenario-Engine: geführte klinische Lernsituationen mit
   Aufgaben (Gerät finden, Quiz, Mehrfachauswahl) und Zustandsänderungen.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  MT.activeScenario = null;

  /**
   * host: Container im Seitenpanel
   * scen: Szenario-Definition
   * env: {state:{patient, vent}, room, resetState(), onExit()}
   */
  MT.runScenario = function (host, scen, env) {
    var idx = 0, score = 0, maxScore = 0, firstTry = true, tweenStop = null;
    var steps = scen.steps;
    steps.forEach(function (s) { if (s.type === 'find' || s.type === 'quiz') maxScore++; });

    // Kontext für enter/after-Hooks
    var c = {
      get patient() { return env.state.patient; },
      get vent() { return env.state.vent; },
      state: env.state,
      reset: function () { env.resetState(); },
      alarmPulse: function (id, on) { if (env.room) env.room.alarmPulse(id, on); },
      animate: function (target, sec) {
        if (tweenStop) tweenStop();
        var p = env.state.patient, from = {}, t = 0;
        Object.keys(target).forEach(function (k) { from[k] = p[k]; });
        tweenStop = MT.addTicker(function (dt) {
          t += dt / (sec || 5);
          var e = Math.min(1, t), ee = e * e * (3 - 2 * e);
          Object.keys(target).forEach(function (k) { p[k] = from[k] + (target[k] - from[k]) * ee; });
          if (e >= 1 && tweenStop) { tweenStop(); tweenStop = null; }
        });
      },
      set: function (obj) { Object.keys(obj).forEach(function (k) { env.state.patient[k] = obj[k]; }); }
    };

    var api = {
      scenario: scen,
      handleSelect: function (devId) {
        var s = steps[idx];
        if (!s || s.type !== 'find' || s._done) return false;
        if (devId === s.device) {
          if (firstTry) score++;
          s._done = true;
          env.room && env.room.flash(devId, 'flash-ok');
          if (s.after) s.after(c);
          renderFindDone(s);
        } else {
          firstTry = false;
          env.room && env.room.flash(devId, 'flash-bad');
          var d = MT.devices[devId];
          var fb = MT.$('.find-fb', host);
          if (fb) { fb.className = 'feedback bad find-fb'; fb.innerHTML = 'Das ist <b>' + MT.esc(d ? d.name : devId) + '</b> – versuche es noch einmal.' + (s.hint ? '<br><small>Tipp: ' + MT.esc(s.hint) + '</small>' : ''); }
        }
        return true;
      },
      stop: function () {
        if (tweenStop) tweenStop();
        MT.activeScenario = null;
        steps.forEach(function (s) { delete s._done; });
        (MT.areaById[scen.area].placements || []).forEach(function (p) { c.alarmPulse(p.device, false); });
        if (env.state.patient) env.state.patient.extraAlarms = [];
      }
    };
    MT.activeScenario = api;

    function header() {
      var pct = Math.round(idx / steps.length * 100);
      return '<div class="row"><span class="chip">' + MT.esc(scen.level || 'Szenario') + '</span><span class="muted" style="font-size:13px">Schritt ' + (idx + 1) + ' / ' + steps.length + '</span><span class="spacer"></span><button class="btn small ghost" data-act="quit">✕ Beenden</button></div>' +
        '<div class="scen-progress"><div style="width:' + pct + '%"></div></div>';
    }

    function next() {
      idx++;
      if (idx >= steps.length) return finish();
      show();
    }

    function bindCommon() {
      var q = MT.$('[data-act="quit"]', host);
      if (q) q.addEventListener('click', function () { api.stop(); env.onExit && env.onExit(); });
      var n = MT.$('[data-act="next"]', host);
      if (n) n.addEventListener('click', next);
    }

    function show() {
      var s = steps[idx];
      firstTry = true;
      if (s.enter) s.enter(c);
      var h = header() + '<div class="scen-step"><h3>' + MT.esc(s.title || '') + '</h3>';
      if (s.type === 'info') {
        h += '<div>' + (s.text || '') + '</div><div class="row" style="margin-top:12px"><button class="btn primary" data-act="next">' + (idx === steps.length - 1 ? 'Abschließen ✓' : 'Weiter →') + '</button></div>';
      } else if (s.type === 'find') {
        h += '<div class="prompt">🔎 ' + MT.esc(s.prompt) + '</div><p class="muted" style="font-size:13px">Klicke im Raum auf das passende Gerät.</p><div class="find-fb"></div>';
      } else if (s.type === 'quiz') {
        h += '<p><b>' + MT.esc(s.question) + '</b>' + (s.multi ? ' <span class="muted">(Mehrfachauswahl)</span>' : '') + '</p>';
        var order = s.options.map(function (o, i) { return i; });
        if (!s.fixedOrder) order = MT.shuffle(order);
        h += order.map(function (i) { return '<button class="opt" data-i="' + i + '">' + (s.multi ? '☐ ' : '') + MT.esc(s.options[i].t) + '</button>'; }).join('');
        if (s.multi) h += '<button class="btn primary" data-act="check">Prüfen</button>';
        h += '<div class="quiz-fb"></div>';
      }
      h += '</div>';
      host.innerHTML = h;
      bindCommon();
      if (s.type === 'quiz') bindQuiz(s);
    }

    function bindQuiz(s) {
      var fbBox = MT.$('.quiz-fb', host);
      var opts = MT.$$('.opt', host);
      if (!s.multi) {
        opts.forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.disabled) return;
            var o = s.options[+b.getAttribute('data-i')];
            if (o.correct) {
              if (firstTry) score++;
              b.classList.add('correct');
              opts.forEach(function (x) { x.disabled = true; });
              fbBox.innerHTML = '<div class="feedback ok">✅ ' + (o.fb || 'Richtig!') + '</div><button class="btn primary" data-act="next">Weiter →</button>';
              if (s.after) s.after(c);
              MT.$('[data-act="next"]', fbBox).addEventListener('click', next);
            } else {
              firstTry = false;
              b.classList.add('wrong'); b.disabled = true;
              fbBox.innerHTML = '<div class="feedback bad">❌ ' + (o.fb || 'Leider falsch.') + ' <br><small>Versuche es noch einmal.</small></div>';
            }
          });
        });
      } else {
        opts.forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.disabled) return;
            b.classList.toggle('selected');
            b.textContent = (b.classList.contains('selected') ? '☑ ' : '☐ ') + s.options[+b.getAttribute('data-i')].t;
          });
        });
        MT.$('[data-act="check"]', host).addEventListener('click', function () {
          var ok = true;
          opts.forEach(function (b) {
            var o = s.options[+b.getAttribute('data-i')];
            var sel = b.classList.contains('selected');
            if (sel !== !!o.correct) ok = false;
          });
          if (ok) {
            if (firstTry) score++;
            opts.forEach(function (b) { b.disabled = true; if (s.options[+b.getAttribute('data-i')].correct) b.classList.add('correct'); });
            this.remove();
            fbBox.innerHTML = '<div class="feedback ok">✅ Richtig! ' + (s.fb || '') + '</div><button class="btn primary" data-act="next">Weiter →</button>';
            if (s.after) s.after(c);
            MT.$('[data-act="next"]', fbBox).addEventListener('click', next);
          } else {
            firstTry = false;
            var nSel = opts.filter(function (b) { return b.classList.contains('selected'); }).length;
            fbBox.innerHTML = '<div class="feedback bad">❌ Noch nicht ganz richtig (' + nSel + ' ausgewählt). Überlege, welche Antworten fehlen oder nicht passen.</div>';
          }
        });
      }
    }

    function renderFindDone(s) {
      var fb = MT.$('.find-fb', host);
      if (!fb) return;
      fb.className = 'feedback ok find-fb';
      fb.innerHTML = '✅ ' + (s.explain || 'Richtig!') + '<div class="row" style="margin-top:10px"><button class="btn primary" data-act="next">Weiter →</button><button class="btn small" data-act="info">Geräteinfo</button></div>';
      MT.$('[data-act="next"]', fb).addEventListener('click', next);
      MT.$('[data-act="info"]', fb).addEventListener('click', function () {
        MT.modal({ title: MT.esc(MT.devices[s.device].name), body: (function () { var d = MT.el('div'); MT.renderDevicePanel(d, s.device, {}); return d; })() });
      });
    }

    function finish() {
      MT.progress.scenario(scen.id, score, maxScore);
      var pct = maxScore ? Math.round(score / maxScore * 100) : 100;
      host.innerHTML = '<div class="scen-progress"><div style="width:100%"></div></div><h3>Szenario abgeschlossen</h3>' +
        '<div class="score-big">' + score + ' / ' + maxScore + '</div><p style="text-align:center" class="muted">Aufgaben beim ersten Versuch gelöst (' + pct + ' %)</p>' +
        '<p>' + (pct >= 80 ? '🏆 Ausgezeichnet! Du hast den Geräteverbund sicher verstanden.' : pct >= 50 ? '👍 Gut gemacht. Schau dir die Geräteinfos zu den verpassten Punkten noch einmal an.' : '📚 Wiederhole das Szenario – die Geräteinfos (Tab „Verbund“, „Alarme“) helfen dir.') + '</p>' +
        '<div class="row"><button class="btn primary" data-act="again">↻ Wiederholen</button><button class="btn" data-act="quit">Zur Szenarioliste</button></div>';
      MT.$('[data-act="again"]', host).addEventListener('click', function () { api.stop(); env.resetState(); MT.runScenario(host, scen, env); });
      MT.$('[data-act="quit"]', host).addEventListener('click', function () { api.stop(); env.onExit && env.onExit(); });
      api.stop();
      MT.toast('Szenario „' + MT.esc(scen.title) + '“ abgeschlossen: ' + score + '/' + maxScore, pct >= 50 ? 'ok' : 'info');
    }

    show();
    return api;
  };
})();
