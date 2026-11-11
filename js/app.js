/* =====================================================================
   App-Start & Hash-Router
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var q = {}, qi = h.indexOf('?');
    if (qi >= 0) { h.slice(qi + 1).split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); }); h = h.slice(0, qi); }
    return { parts: h.split('/').filter(Boolean), q: q };
  }

  function route() {
    var r = parse();
    var main = MT.$('#main');
    if (MT.activeScenario) MT.activeScenario.stop();
    MT.closeModal();
    MT.clearTickers();
    if (MT._simCleanup) { try { MT._simCleanup(); } catch (e) { /* ignore */ } MT._simCleanup = null; }
    var p0 = r.parts[0] || '';
    var nav = { '': 'home', area: 'home', lab: 'lab', challenges: 'challenges', challenge: 'challenges', devices: 'devices', progress: 'progress' }[p0] || 'home';
    MT.$$('.mainnav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === nav); });
    try {
      if (p0 === 'area') MT.views.area(main, r.parts[1], r.q);
      else if (p0 === 'lab') MT.views.lab(main, r.parts[1]);
      else if (p0 === 'challenges') MT.views.challenges(main);
      else if (p0 === 'challenge') MT.views.challenge(main, r.parts[1], r.q);
      else if (p0 === 'devices') MT.views.devices(main, r.q);
      else if (p0 === 'progress') MT.views.progress(main);
      else MT.views.home(main);
    } catch (e) {
      console.error(e);
      main.innerHTML = '<div class="card"><h2>Es ist ein Fehler aufgetreten</h2><pre style="white-space:pre-wrap">' + MT.esc(e && e.stack || e) + '</pre><a class="btn" href="#/">Zur Startseite</a></div>';
    }
    window.scrollTo(0, 0);
    var areaName = p0 === 'area' && MT.areaById[r.parts[1]] ? MT.areaById[r.parts[1]].name + ' – ' : '';
    document.title = areaName + 'MedTech Simulator';
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', function () {
    var sb = MT.$('#btn-sound');
    sb.addEventListener('click', function () {
      var on = MT.sound.toggle();
      sb.textContent = on ? '🔊' : '🔇';
      sb.setAttribute('aria-pressed', on);
      MT.toast(on ? 'Alarm- und QRS-Töne eingeschaltet' : 'Töne ausgeschaltet');
    });
    route();
  });
})();
