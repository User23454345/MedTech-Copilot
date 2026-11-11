/* =====================================================================
   Bereich: Aufwachraum (Post Anesthesia Care Unit)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'pacu-highflow', name: 'High-Flow-Sauerstofftherapie (HFNC)', short: 'High-Flow', category: 'Atmung', visual: 'highflow',
    manufacturers: ['Fisher & Paykel Healthcare', 'Hamilton Medical', 'Dräger', 'Vapotherm', 'ResMed'], mdr: 'IIb',
    standards: ['ISO 80601-2-90 (High-Flow-Therapiegeräte)', 'ISO 80601-2-74 (Atemgasbefeuchter)'],
    purpose: 'Sauerstoffgabe mit sehr hohem, erwärmtem und befeuchtetem Gasfluss über eine weiche Nasenkanüle – z. B. bei Hypoxie nach Operationen.',
    function: 'Ein Gerät mischt O₂ und Luft (FiO₂ 21–100 %) und liefert Flüsse bis ca. 60 l/min, die den Eigenbedarf des Patienten übersteigen. Dadurch wird die FiO₂ zuverlässiger als mit einer Maske; der Totraum im Nasen-Rachen-Raum wird ausgewaschen, und ein geringer positiver Druck entsteht. Das Gas wird auf ca. 37 °C erwärmt und gesättigt befeuchtet, damit die Schleimhäute nicht austrocknen.',
    components: [
      { name: 'Flow- und FiO₂-Regelung', desc: 'Einstellung von Flow und Sauerstoffanteil.' },
      { name: 'Befeuchterkammer', desc: 'Beheizte Wasserkammer.' },
      { name: 'Beheizter Atemschlauch', desc: 'Verhindert Kondensation („Rainout“).' },
      { name: 'Nasenkanüle', desc: 'Große, weiche Prongs.' }
    ],
    measurements: [
      { name: 'Flow', unit: 'l/min', normal: '30–60 (Erw.)', desc: '' },
      { name: 'FiO₂', unit: '%', normal: 'nach SpO₂-Ziel', desc: '' },
      { name: 'Gastemperatur', unit: '°C', normal: '31–37', desc: '' }
    ],
    alarms: [
      { name: 'Okklusion / Flow niedrig', prio: 'medium', cause: 'Schlauch geknickt, Kanüle verlegt.', action: 'System prüfen.' },
      { name: 'Wasser leer', prio: 'medium', cause: 'Befeuchterkammer leer.', action: 'Steriles Wasser nachfüllen.' },
      { name: 'O₂-Versorgung', prio: 'high', cause: 'Wand-O₂ getrennt.', action: 'Anschluss prüfen.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'Sauerstoff aus der Wandversorgung.' },
      { to: 'monitor', type: 'Klinisch', desc: 'SpO₂ und Atemfrequenz zeigen den Therapieerfolg.' }
    ],
    safety: ['Erfolgskontrolle engmaschig: Bei Versagen nicht zu spät eskalieren (NIV/Intubation).', 'Kanülengröße so wählen, dass die Nasenlöcher nicht vollständig verschlossen sind.']
  });

  R({
    id: 'pacu-warming', name: 'Warmluft-Wärmetherapiesystem', short: 'Wärmesystem', category: 'Thermoregulation', visual: 'warming-unit',
    manufacturers: ['3M (Solventum)', 'Stryker', 'Smiths Medical (ICU Medical)', 'The 37Company', 'Inspiration Healthcare'], mdr: 'IIb',
    standards: ['IEC 80601-2-35 (Wärmesysteme mit Decken, Matten oder Matratzen)'],
    purpose: 'Behandlung und Vorbeugung einer perioperativen Hypothermie (Körpertemperatur < 36 °C).',
    function: 'Ein Gebläse saugt Raumluft an, filtert und erwärmt sie (z. B. 38–43 °C) und bläst sie über einen Schlauch in eine Einwegdecke mit Perforationen auf der Patientenseite. Die warme Luft strömt über die Haut (erzwungene Konvektion) und reduziert Wärmeverlust bzw. führt Wärme zu.',
    components: [
      { name: 'Gebläseeinheit mit Heizung', desc: 'Temperaturstufen wählbar.' },
      { name: 'Luftfilter', desc: 'Hygiene der ausgeblasenen Luft.' },
      { name: 'Warmluftschlauch', desc: 'Verbindet Gerät und Decke.' },
      { name: 'Einweg-Wärmedecke', desc: 'Ober- oder Unterkörperdecke.' }
    ],
    measurements: [
      { name: 'Auslasstemperatur', unit: '°C', normal: 'Stufe nach Bedarf', desc: '' },
      { name: 'Körperkerntemperatur', unit: '°C', normal: '≥ 36,0', desc: 'Am Patienten gemessen.' }
    ],
    alarms: [
      { name: 'Übertemperatur', prio: 'high', cause: 'Regelungsfehler, Filter verstopft.', action: 'Gerät aus, Patient prüfen.' },
      { name: 'Filterwechsel', prio: 'low', cause: 'Betriebsstunden erreicht.', action: 'Filter tauschen.' }
    ],
    connections: [
      { to: 'monitor', type: 'Klinisch', desc: 'Temperaturverlauf am Monitor kontrollieren.' },
      { to: 'stretcher', type: 'Klinisch', desc: 'Decke auf der Trage korrekt platzieren.' }
    ],
    safety: [
      'Niemals den Schlauch ohne Decke direkt auf den Patienten blasen lassen („Hosing“) – Verbrennungsgefahr!',
      'Bei Patienten mit eingeschränktem Schmerzempfinden Haut regelmäßig kontrollieren.'
    ]
  });

  MT.registerArea({
    id: 'pacu', name: 'Aufwachraum', short: 'AWR', icon: '🌅', color: '#e67e22',
    sign: 'Aufwachraum · Platz 2', signSub: 'Lernumgebung · fiktiver Patient',
    description: 'Nach der Operation werden Patienten hier überwacht, bis Atmung, Kreislauf, Bewusstsein, Schmerz und Temperatur stabil sind. Typische Probleme: Atemdepression, Schmerzen, Übelkeit, Auskühlung.',
    patientInfo: 'Lernpatient „P-27“ (fiktiv) · 58 J. · nach offener Bauchoperation · extubiert · Opioid-PCA angeschlossen · Körpertemperatur 35,4 °C',
    room: { wall: '#fdf3ea', wall2: '#f4e2d0', floor: '#d3ccc4', floor2: '#bdb4aa', horizon: 640 },
    decor: [{ visual: 'window', x: 1180, y: 120, w: 260 }],
    placements: [
      { device: 'pendant', visual: 'pendant', x: 40, y: 34, w: 120, labelY: 470, labelX: 100 },
      { device: 'suction', visual: 'suction', x: 6, y: 600, w: 70 },
      { device: 'monitor', visual: 'monitor', x: 200, y: 96, w: 230, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'pca-pump', visual: 'iv-pole', x: 1000, y: 190, w: 105, opts: { bag: 'PCA', rate: '2' } },
      { device: 'pacu-highflow', visual: 'highflow', x: 250, y: 470, w: 125 },
      { device: 'stretcher', visual: 'stretcher', x: 390, y: 520, w: 580 },
      { device: 'pacu-warming', visual: 'warming-unit', x: 960, y: 470, w: 140 },
      { device: 'defibrillator', visual: 'defibrillator', x: 1300, y: 500, w: 140 }
    ],
    hosesBehind: [
      '<path d="M128 220 C 140 380, 240 430, 290 480" stroke="#fff" stroke-width="6" fill="none" filter="url(#f-soft)"/>',
      '<path d="M415 300 C 430 420, 520 470, 560 590" stroke="#59636e" stroke-width="3" fill="none"/>'
    ],
    hosesFront: [
      '<path d="M370 600 C 420 560, 450 570, 470 590" stroke="#bfe0f7" stroke-width="7" fill="none" stroke-linecap="round"/>',
      '<path d="M1105 560 C 1060 640, 960 640, 880 620" stroke="#c8d1da" stroke-width="12" fill="none" stroke-linecap="round"/>',
      '<path d="M1020 420 C 1000 520, 800 560, 700 600" stroke="rgba(150,190,225,.95)" stroke-width="2.5" fill="none"/>'
    ],
    scenarios: ['pacu-recovery'],
    learningGoals: [
      'Postoperative Überwachung (Atmung, Kreislauf, Bewusstsein, Temperatur) beschreiben',
      'Opioidbedingte Atemdepression an Kapnographie und Atemfrequenz erkennen',
      'Wärmetherapie und High-Flow-Sauerstoff sicher einsetzen',
      'Verlegungskriterien (z. B. Aldrete-Score) kennen'
    ],
    facts: [
      'Die Kapnographie zeigt eine Hypoventilation oft früher als die Pulsoximetrie – besonders unter Sauerstoffgabe.',
      'Bereits eine leichte Hypothermie erhöht das Risiko für Wundinfektionen und Blutungen.',
      'Bei der High-Flow-Therapie liegt der Gasfluss über dem inspiratorischen Spitzenfluss des Patienten.'
    ],
    createState: function () {
      return { patient: MT.physio.createPatient({ hr: 86, spo2: 96, sys: 128, dia: 74, rr: 14, etco2: 40, temp: 35.4, nibpSys: 130, nibpDia: 76, hasArt: false }), vent: null };
    }
  });

  MT.registerScenario({
    id: 'pacu-recovery', area: 'pacu', title: 'Übernahme aus dem OP: Atmung und Wärme', level: 'Fortgeschritten', duration: '8 min',
    summary: 'Ein Patient wird aus dem OP übernommen. Erkenne eine Atemdepression und behandle eine Hypothermie sicher.',
    steps: [
      { type: 'info', title: 'Übergabe', text: '<p>Lernpatient „P-27“ (fiktiv) kommt nach einer Bauchoperation in den Aufwachraum. Er ist extubiert, schläfrig, hat Schmerzen und friert. Die PCA-Pumpe mit Opioid ist angeschlossen.</p>', enter: function (c) { c.reset(); } },
      { type: 'find', device: 'monitor', title: 'Anschließen', prompt: 'Welches Gerät wird als Erstes angeschlossen?', explain: 'Der <b>Patientenmonitor</b> mit EKG, SpO₂, NIBP, Temperatur und – sehr wertvoll – Kapnographie über eine Nasenbrille.' },
      { type: 'info', title: 'Veränderung', text: '<p>Nach mehreren PCA-Boli schläft der Patient tief. Beobachte Atemfrequenz und etCO₂ am Monitor.</p>', enter: function (c) { c.animate({ rr: 6, etco2: 58, spo2: 89, hr: 64 }, 8); c.alarmPulse('monitor', true); } },
      { type: 'quiz', title: 'Deutung', question: 'Atemfrequenz 6/min, etCO₂ steigt auf 58 mmHg, SpO₂ fällt langsam. Was liegt vor?', options: [
        { t: 'Opioidbedingte Atemdepression (Hypoventilation)', correct: true, fb: 'Richtig. Weniger Atemzüge → CO₂ steigt. Die SpO₂ fällt erst später.' },
        { t: 'Hyperventilation durch Schmerz', correct: false, fb: 'Dann wären Atemfrequenz hoch und etCO₂ niedrig.' },
        { t: 'Messfehler des CO₂-Sensors', correct: false, fb: 'Langsame Atmung und klinisches Bild passen zusammen.' }
      ] },
      { type: 'quiz', multi: true, title: 'Maßnahmen', question: 'Was ist jetzt angemessen?', options: [
        { t: 'Patient wecken und zum Atmen auffordern', correct: true }, { t: 'Ärztin/Arzt informieren (ggf. Opioid-Antagonist nach Anordnung)', correct: true },
        { t: 'PCA-Pumpe und abgegebene Boli prüfen', correct: true }, { t: 'Alarmgrenze für die Atemfrequenz auf 4/min senken', correct: false }
      ], fb: 'Alarmgrenzen zu senken verschleiert das Problem.', after: function (c) { c.animate({ rr: 13, etco2: 41, spo2: 95, hr: 84 }, 6); c.alarmPulse('monitor', false); } },
      { type: 'find', device: 'pca-pump', title: 'Ursache', prompt: 'Welches Gerät hat das Opioid verabreicht?', explain: 'Die <b>PCA-Pumpe</b>. Im Ereignisprotokoll sieht man Anforderungen und abgegebene Boli.' },
      { type: 'find', device: 'pacu-warming', title: 'Auskühlung', prompt: 'Der Patient hat 35,4 °C und zittert. Welches Gerät hilft?', explain: 'Das <b>Warmluft-Wärmesystem</b> mit Einwegdecke (erzwungene Konvektion).' },
      { type: 'quiz', title: 'Sicherheit Wärme', question: 'Was ist bei Warmluftsystemen streng verboten?', options: [
        { t: 'Den Warmluftschlauch ohne Decke direkt unter die Bettdecke oder auf die Haut zu legen („Hosing“)', correct: true, fb: 'Richtig. Dabei kommt es immer wieder zu Verbrennungen.' },
        { t: 'Die Decke auf den Oberkörper zu legen', correct: false, fb: 'Oberkörperdecken sind üblich.' },
        { t: 'Die Temperatur des Patienten zu messen', correct: false, fb: 'Die Temperatur muss kontrolliert werden.' }
      ] },
      { type: 'find', device: 'pacu-highflow', title: 'Sauerstoff', prompt: 'Die SpO₂ bleibt trotz Maske grenzwertig. Welches Gerät liefert erwärmten, befeuchteten Sauerstoff mit hohem Fluss?', explain: 'Das <b>High-Flow-Gerät</b> (HFNC).' },
      { type: 'quiz', title: 'Prinzip', question: 'Warum wird das Gas bei der High-Flow-Therapie erwärmt und befeuchtet?', options: [
        { t: 'Bei Flüssen bis 60 l/min würden die Schleimhäute sonst austrocknen und auskühlen; befeuchtetes Gas wird gut toleriert.', correct: true, fb: 'Richtig. Erst die Klimatisierung macht hohe Flüsse über Stunden erträglich.' },
        { t: 'Damit das Gas mehr Sauerstoff enthält.', correct: false, fb: 'Die FiO₂ wird über den Mischer eingestellt.' },
        { t: 'Um Keime abzutöten.', correct: false, fb: '37 °C tötet keine Keime ab.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Im Aufwachraum überlagern sich Nachwirkungen von Narkose und Operation. Kapnographie, Temperaturmanagement und vorsichtige Schmerztherapie machen den Übergang auf die <a href="#/area/ward">Normalstation</a> sicher.</p>' }
    ]
  });
})();
