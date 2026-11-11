/* =====================================================================
   Bereich: Dialyse
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'dialysis-machine', name: 'Hämodialysegerät', short: 'Dialysegerät', category: 'Nierenersatz',
    manufacturers: ['Fresenius Medical Care', 'B. Braun', 'Baxter', 'Nipro', 'Nikkiso'], mdr: 'IIb',
    standards: ['IEC 60601-2-16 (Hämodialyse-, Hämodiafiltrations- und Hämofiltrationsgeräte)', 'ISO 23500 (Dialysewasser und -flüssigkeiten)'],
    purpose: 'Übernimmt bei Nierenversagen die Entgiftung des Blutes (z. B. Harnstoff, Kreatinin, Kalium) und den Entzug überschüssigen Wassers.',
    function: 'Eine Rollenpumpe fördert Blut (Qb ca. 200–400 ml/min) über einen Gefäßzugang (Shunt oder Katheter) durch den Dialysator. In dessen Hohlfasern strömt das Blut im Gegenstrom zur Dialysierflüssigkeit (Qd ca. 500 ml/min); gelöste Stoffe wandern entlang des Konzentrationsgefälles durch die semipermeable Membran (Diffusion). Ein Druckunterschied (Transmembrandruck, TMP) presst Wasser aus dem Blut (Ultrafiltration, Konvektion). Das Gerät mischt die Dialysierflüssigkeit aus aufbereitetem Wasser und Konzentrat, kontrolliert Temperatur und Leitfähigkeit und überwacht den extrakorporalen Kreislauf mit Drucksensoren, Luftdetektor, venöser Schlauchklemme und Blutleckdetektor. Eine Heparinpumpe verhindert die Gerinnung im Schlauchsystem.',
    components: [
      { name: 'Bildschirm', desc: 'Behandlungsparameter, Drücke, Bilanz, Alarme.' },
      { name: 'Blutpumpe', desc: 'Rollenpumpe für den extrakorporalen Blutfluss.' },
      { name: 'Heparinpumpe', desc: 'Spritzenpumpe zur Antikoagulation.' },
      { name: 'Dialysator', desc: 'Hohlfasermembran-„künstliche Niere“ mit großer Oberfläche (ca. 1,5–2 m²).' },
      { name: 'Venöse Tropfkammer mit Luftdetektor', desc: 'Ultraschall-Luftdetektor; bei Luft schließt die venöse Klemme und die Blutpumpe stoppt.' },
      { name: 'Konzentratanschlüsse', desc: 'Säure- und Bicarbonatkonzentrat werden mit Wasser gemischt.' }
    ],
    parts: [
      { name: 'Bildschirm', x: 100, y: 62 },
      { name: 'Blutpumpe', x: 66, y: 140 },
      { name: 'Heparinpumpe', x: 134, y: 140 },
      { name: 'Dialysator', x: 151, y: 240 },
      { name: 'Venöse Tropfkammer mit Luftdetektor', x: 71, y: 360 },
      { name: 'Konzentratanschlüsse', x: 56, y: 215 }
    ],
    measurements: [
      { name: 'Blutfluss Qb', unit: 'ml/min', normal: '200–400', desc: '' },
      { name: 'Dialysatfluss Qd', unit: 'ml/min', normal: '300–800', desc: '' },
      { name: 'Arterieller Druck (PA)', unit: 'mmHg', normal: 'negativ, z. B. −100 bis −200', desc: 'Sog vor der Blutpumpe.' },
      { name: 'Venöser Druck (PV)', unit: 'mmHg', normal: 'z. B. +100 bis +200', desc: 'Rückgabedruck in den Zugang.' },
      { name: 'Transmembrandruck (TMP)', unit: 'mmHg', normal: 'gerätespezifisch', desc: 'Treibende Kraft der Ultrafiltration.' },
      { name: 'Ultrafiltrationsvolumen / -rate', unit: 'ml / ml/h', normal: 'nach Zielgewicht', desc: 'Wasserentzug.' },
      { name: 'Leitfähigkeit des Dialysats', unit: 'mS/cm', normal: 'ca. 13,5–14,5', desc: 'Maß für die Elektrolytkonzentration.' }
    ],
    alarms: [
      { name: 'Venöser Druck hoch', prio: 'high', cause: 'Abgeknickte Leitung, Nadellage, Gerinnsel in der venösen Kammer, Shuntstenose.', action: 'Blutpumpe stoppt; Leitung und Punktionsstelle prüfen.' },
      { name: 'Venöser Druck niedrig', prio: 'high', cause: 'Diskonnektion oder herausgerutschte venöse Nadel – Blutverlustgefahr!', action: 'Sofort Punktionsstelle prüfen.' },
      { name: 'Arterieller Druck zu negativ', prio: 'medium', cause: 'Unzureichender Shuntfluss, Nadel liegt an der Gefäßwand.', action: 'Nadellage korrigieren, Blutfluss reduzieren.' },
      { name: 'Luft im venösen System', prio: 'high', cause: 'Undichtigkeit, Leerlaufen.', action: 'Venöse Klemme schließt automatisch – System entlüften, niemals Alarm überbrücken.' },
      { name: 'Blutleck', prio: 'high', cause: 'Membranruptur im Dialysator.', action: 'Behandlung stoppen, Dialysator wechseln.' },
      { name: 'Leitfähigkeit/Temperatur außerhalb', prio: 'medium', cause: 'Konzentrat leer, Mischfehler.', action: 'Gerät leitet Dialysat am Dialysator vorbei (Bypass); Konzentrat prüfen.' }
    ],
    connections: [
      { to: 'water-treatment', type: 'Fluid', desc: 'Bezieht Reinstwasser aus der Ringleitung der Umkehrosmose.' },
      { to: 'dialysis-chair', type: 'Klinisch', desc: 'Blutschläuche verbinden das Gerät mit dem Shunt des Patienten.' },
      { to: 'spot-monitor', type: 'Klinisch', desc: 'Regelmäßige Blutdruckmessung (Ultrafiltration kann Hypotonie auslösen); viele Geräte haben eine integrierte NIBP.' },
      { to: 'pendant', type: 'Strom', desc: 'Netz; zusätzlich Abwasseranschluss.' }
    ],
    safety: [
      'Dialysegeräte fallen unter MPBetreibV Anlage 1 (Einweisung, STK).',
      'Luftdetektor und venöse Klemme sind Schutzsysteme gegen Luftembolie – nie umgehen.',
      'Punktionsstellen während der Behandlung sichtbar lassen (Diskonnektion früh erkennen).',
      'Hygiene: Desinfektion des Geräts nach jeder Behandlung; Hepatitis-/Infektionsstatus berücksichtigen.'
    ],
    tip: 'Diffusion entfernt vor allem kleine Moleküle (Harnstoff, Kalium), Konvektion (Hämodiafiltration) auch mittelgroße Moleküle.'
  });

  R({
    id: 'dialysis-chair', name: 'Dialyse-Behandlungsstuhl', short: 'Behandlungsstuhl', category: 'Lagerung',
    manufacturers: ['Fresenius Medical Care', 'Völker', 'Stiegelmeyer', 'Lojer', 'Merivaara'], mdr: 'I',
    standards: ['IEC 60601-2-52'],
    purpose: 'Bequeme Lagerung für mehrstündige Behandlungen; schnelle Kopftieflage bei Blutdruckabfall.',
    function: 'Elektrisch verstellbare Sitz-, Rücken- und Beinteile; Trendelenburg-Funktion per Knopfdruck. Teilweise mit integrierter Waage zur Kontrolle des Ultrafiltrationsziels.',
    components: [
      { name: 'Verstellantrieb', desc: 'Liege- bis Sitzposition.' },
      { name: 'Armauflage', desc: 'Für den Shuntarm, gut zugänglich.' },
      { name: 'Bedienteil', desc: 'Inklusive Schnell-Kopftieflage.' },
      { name: 'Waage (optional)', desc: 'Gewicht vor/nach der Dialyse.' }
    ],
    measurements: [
      { name: 'Gewicht vor/nach', unit: 'kg', normal: 'Ziel: „Trockengewicht“', desc: '' },
      { name: 'Position', unit: '°', normal: '–', desc: '' }
    ],
    alarms: [
      { name: 'Akku schwach', prio: 'low', cause: 'Netz getrennt.', action: 'Anschließen.' },
      { name: 'Bewegung blockiert', prio: 'low', cause: 'Hindernis.', action: 'Hindernis entfernen.' }
    ],
    connections: [
      { to: 'dialysis-machine', type: 'Klinisch', desc: 'Blutschläuche zum Shuntarm.' },
      { to: 'spot-monitor', type: 'Klinisch', desc: 'Blutdruckmessung am Nicht-Shunt-Arm.' }
    ],
    safety: ['Nie am Shuntarm Blutdruck messen.', 'Bei Hypotonie: Kopftieflage, Ultrafiltration pausieren, Arzt informieren.']
  });

  R({
    id: 'water-treatment', name: 'Wasseraufbereitung (Umkehrosmose)', short: 'Wasseraufbereitung', category: 'Infrastruktur',
    manufacturers: ['Fresenius Medical Care', 'B. Braun', 'Vivonic', 'Lauer Membran Wassertechnik', 'Baxter'], mdr: 'IIb',
    standards: ['ISO 23500 (Dialysewasser)', 'ISO 26722 (Wasseraufbereitungsanlagen für die Hämodialyse)'],
    purpose: 'Stellt hochreines Wasser für die Herstellung der Dialysierflüssigkeit bereit.',
    function: 'Trinkwasser wird vorbehandelt (Filter, Enthärtung, Aktivkohle gegen Chlor/Chloramin) und dann unter Druck durch Umkehrosmose-Membranen gepresst, die Salze, Bakterien und Endotoxine zurückhalten. Das Permeat wird über eine Ringleitung zu den Dialyseplätzen geführt. Leitfähigkeit, Temperatur und mikrobiologische Qualität werden überwacht; die Anlage wird regelmäßig desinfiziert (thermisch oder chemisch).',
    components: [
      { name: 'Umkehrosmose-Module', desc: 'Membranen trennen Wasser von gelösten Stoffen.' },
      { name: 'Steuerung mit Leitfähigkeitsmessung', desc: 'Überwacht die Wasserqualität.' },
      { name: 'Ringleitung', desc: 'Versorgt alle Dialysegeräte; ständige Zirkulation gegen Keimwachstum.' },
      { name: 'Vorbehandlung', desc: 'Partikelfilter, Enthärter, Aktivkohle.' }
    ],
    parts: [
      { name: 'Umkehrosmose-Module', x: 100, y: 170 },
      { name: 'Steuerung mit Leitfähigkeitsmessung', x: 208, y: 95 },
      { name: 'Ringleitung', x: 255, y: 285 }
    ],
    measurements: [
      { name: 'Leitfähigkeit Permeat', unit: 'µS/cm', normal: 'sehr niedrig (wenige µS/cm)', desc: '' },
      { name: 'Keimzahl', unit: 'KBE/ml', normal: '< 100 (Dialysewasser nach ISO 23500)', desc: 'Regelmäßige Proben.' },
      { name: 'Endotoxine', unit: 'EU/ml', normal: '< 0,25 (Dialysewasser)', desc: '' }
    ],
    alarms: [
      { name: 'Leitfähigkeit zu hoch', prio: 'high', cause: 'Membran defekt, Vorbehandlung erschöpft.', action: 'Anlage prüft automatisch; Dialysen ggf. unterbrechen, Technik informieren.' },
      { name: 'Desinfektion fällig', prio: 'low', cause: 'Intervall abgelaufen.', action: 'Desinfektion außerhalb der Behandlungszeit planen.' }
    ],
    connections: [
      { to: 'dialysis-machine', type: 'Fluid', desc: 'Liefert Reinstwasser über die Ringleitung.' },
      { to: 'pendant', type: 'Strom', desc: 'Netzversorgung (Sicherheitsstrom).' }
    ],
    safety: [
      'Pro Behandlung kommt der Patient über die Membran mit über 100 Litern Dialysierflüssigkeit in Kontakt – Wasserqualität ist Patientensicherheit.',
      'Regelmäßige mikrobiologische Kontrollen und Desinfektion dokumentieren.',
      'Chlor/Chloramin müssen vollständig entfernt sein (Hämolyse-Gefahr).'
    ]
  });

  MT.registerArea({
    id: 'dialysis', name: 'Dialyse', short: 'Dialyse', icon: '💧', color: '#0e9aa7',
    sign: 'Dialysezentrum · Platz 5–6', signSub: 'Lernumgebung · fiktive Patienten',
    description: 'Ein Behandlungsraum der Hämodialyse: Zwei Behandlungsplätze mit Dialysegeräten, versorgt von einer zentralen Wasseraufbereitung. Drei Mal pro Woche verbringen Patienten hier mehrere Stunden.',
    patientInfo: 'Lernpatient „P-41“ (fiktiv) · 67 J. · terminale Niereninsuffizienz · Hämodialyse 3×/Woche über arteriovenöse Fistel (Shunt) links · Ultrafiltrationsziel 2,5 l',
    room: { wall: '#ecf7f8', wall2: '#d7ecee', floor: '#c4d3d6', floor2: '#abbec2', horizon: 640 },
    decor: [{ visual: 'window', x: 300, y: 110, w: 250 }, { visual: 'window', x: 820, y: 110, w: 250 }],
    placements: [
      { device: 'water-treatment', visual: 'water-treatment', x: 30, y: 260, w: 230 },
      { device: 'dialysis-machine', visual: 'dialysis', x: 600, y: 240, w: 190 },
      { device: 'dialysis-chair', visual: 'dialysis-chair', x: 320, y: 560, w: 300 },
      { device: 'dialysis-machine', visual: 'dialysis', x: 1110, y: 240, w: 190 },
      { device: 'dialysis-chair', visual: 'dialysis-chair', x: 830, y: 560, w: 300 },
      { device: 'spot-monitor', visual: 'spot-monitor', x: 1320, y: 450, w: 120 },
      { device: 'defibrillator', visual: 'defibrillator', x: 1455, y: 500, w: 130 }
    ],
    hosesBehind: [
      '<path d="M260 470 H 1320" stroke="#3b8de0" stroke-width="6" fill="none"/><path d="M260 486 H 1320" stroke="#7fb6ea" stroke-width="6" fill="none"/>',
      '<text x="880" y="508" font-size="12" font-family="system-ui" fill="#1d5fae" font-weight="700">Ringleitung Reinstwasser →</text>',
      '<path d="M700 478 v40 M1210 478 v40" stroke="#3b8de0" stroke-width="5"/>'
    ],
    hosesFront: [
      '<path d="M660 330 C 640 520, 520 600, 440 620" stroke="#c22" stroke-width="3" fill="none"/>',
      '<path d="M670 580 C 620 640, 520 640, 450 628" stroke="#c22" stroke-width="3" fill="none"/>',
      '<path d="M1170 330 C 1150 520, 1030 600, 950 620" stroke="#c22" stroke-width="3" fill="none"/>',
      '<path d="M1180 580 C 1130 640, 1030 640, 960 628" stroke="#c22" stroke-width="3" fill="none"/>'
    ],
    scenarios: ['dialysis-session'],
    learningGoals: [
      'Prinzipien Diffusion, Ultrafiltration und Konvektion erklären',
      'Aufbau des extrakorporalen Kreislaufs mit seinen Schutzsystemen beschreiben',
      'Typische Druckalarme deuten',
      'Bedeutung der Wasseraufbereitung für die Patientensicherheit erkennen'
    ],
    facts: [
      'Eine Dialysebehandlung dauert meist 4–5 Stunden, drei Mal pro Woche.',
      'Die Membranfläche eines Dialysators beträgt etwa 1,5–2 m² – verteilt auf tausende Hohlfasern.',
      'Blut und Dialysierflüssigkeit fließen im Gegenstrom, damit das Konzentrationsgefälle über die gesamte Länge erhalten bleibt.'
    ]
  });

  MT.registerScenario({
    id: 'dialysis-session', area: 'dialysis', title: 'Eine Dialysebehandlung mit Druckalarm', level: 'Fortgeschritten', duration: '9 min',
    summary: 'Begleite eine Dialysebehandlung: Funktionsprinzip, Druckalarm, Blutdruckabfall und Wasserqualität.',
    steps: [
      { type: 'info', title: 'Behandlungsbeginn', text: '<p>Lernpatient „P-41“ (fiktiv) ist an seinen Shunt angeschlossen. Blutfluss 300 ml/min, Ultrafiltrationsziel 2,5 l in 4 Stunden.</p>' },
      { type: 'find', device: 'dialysis-machine', title: 'Künstliche Niere', prompt: 'Welches Gerät reinigt das Blut?', explain: 'Das <b>Hämodialysegerät</b> mit Blutpumpe, Dialysator und Überwachungssystemen.' },
      { type: 'quiz', title: 'Prinzip', question: 'Wie gelangen Harnstoff und Kalium aus dem Blut in die Dialysierflüssigkeit?', options: [
        { t: 'Durch Diffusion entlang des Konzentrationsgefälles über eine semipermeable Membran (Gegenstromprinzip)', correct: true, fb: 'Richtig. Die Dialysierflüssigkeit enthält kein Harnstoff und weniger Kalium als das Blut.' },
        { t: 'Durch Filtration über Aktivkohle im Gerät', correct: false, fb: 'Aktivkohle findet sich in der Wasservorbehandlung, nicht im Blutkreislauf.' },
        { t: 'Durch Zentrifugieren des Blutes', correct: false, fb: 'Zentrifugation trennt Blutbestandteile, wird bei der Dialyse aber nicht verwendet.' }
      ] },
      { type: 'quiz', title: 'Wasserentzug', question: 'Wie entzieht das Gerät dem Patienten 2,5 l Wasser?', options: [
        { t: 'Ultrafiltration: Über den Transmembrandruck wird Wasser durch die Membran gepresst; das Gerät bilanziert exakt.', correct: true, fb: 'Richtig. Die Ultrafiltrationsrate wird aus Zielvolumen und Behandlungszeit berechnet.' },
        { t: 'Über Verdunstung im Dialysator', correct: false, fb: 'Nein – es ist ein druckgetriebener Prozess.' },
        { t: 'Der Patient muss währenddessen viel Wasser lassen.', correct: false, fb: 'Dialysepatienten produzieren oft kaum noch Urin.' }
      ] },
      { type: 'info', title: 'Alarm', text: '<p>Nach einer Stunde stoppt die Blutpumpe: <b>„Venöser Druck hoch“</b>. Der Patient hat sich im Schlaf auf den Arm gedreht.</p>', enter: function (c) { c.alarmPulse('dialysis-machine', true); } },
      { type: 'quiz', title: 'Ursache', question: 'Was ist die wahrscheinlichste Ursache?', options: [
        { t: 'Abgeknickte venöse Leitung oder Lageänderung der venösen Nadel durch die Armbewegung', correct: true, fb: 'Richtig. Leitung entknicken, Nadellage prüfen; anschließend die Behandlung fortsetzen.' },
        { t: 'Zu niedrige Dialysattemperatur', correct: false, fb: 'Das würde einen Temperaturalarm auslösen.' },
        { t: 'Membranruptur', correct: false, fb: 'Dafür ist der Blutleckdetektor zuständig.' }
      ], after: function (c) { c.alarmPulse('dialysis-machine', false); } },
      { type: 'quiz', title: 'Schutzsystem', question: 'Was passiert automatisch, wenn der Luftdetektor Luft im venösen System erkennt?', options: [
        { t: 'Die venöse Schlauchklemme schließt und die Blutpumpe stoppt – Luft kann nicht zum Patienten gelangen.', correct: true, fb: 'Richtig. Dieses Schutzsystem darf nie überbrückt werden.' },
        { t: 'Das Gerät erhöht den Blutfluss, um die Luft herauszuspülen.', correct: false, fb: 'Das würde die Luft zum Patienten befördern – lebensgefährlich.' },
        { t: 'Nichts – kleine Luftmengen sind unproblematisch.', correct: false, fb: 'Luftembolien sind eine ernste Gefahr.' }
      ] },
      { type: 'info', title: 'Blutdruckabfall', text: '<p>Gegen Ende der Behandlung klagt der Patient über Schwindel. Die Messung ergibt 86/50 mmHg.</p>' },
      { type: 'find', device: 'spot-monitor', title: 'Messen', prompt: 'Mit welchem Gerät wird der Blutdruck kontrolliert?', explain: 'Mit dem <b>Vitaldatenmessgerät</b> (oszillometrische NIBP) – immer am Nicht-Shunt-Arm!' },
      { type: 'quiz', title: 'Zusammenhang', question: 'Welcher Zusammenhang besteht zwischen Gerät und Blutdruckabfall?', options: [
        { t: 'Die Ultrafiltration entzieht dem Gefäßsystem Volumen schneller, als es aus dem Gewebe nachströmt – Ultrafiltration reduzieren/pausieren, Kopftieflage.', correct: true, fb: 'Richtig. Viele Geräte bieten Profile oder eine Blutvolumenüberwachung, um das zu vermeiden.' },
        { t: 'Der Blutdruck fällt wegen der Heparinpumpe.', correct: false, fb: 'Heparin beeinflusst die Gerinnung, nicht direkt den Blutdruck.' },
        { t: 'Die Wasseraufbereitung liefert zu kaltes Wasser.', correct: false, fb: 'Kühles Dialysat würde den Blutdruck eher stabilisieren.' }
      ] },
      { type: 'find', device: 'water-treatment', title: 'Die unsichtbare Infrastruktur', prompt: 'Woher kommt das hochreine Wasser für die Dialysierflüssigkeit?', explain: 'Aus der <b>Wasseraufbereitung</b> mit Umkehrosmose und Ringleitung.' },
      { type: 'quiz', title: 'Warum so rein?', question: 'Warum werden an Dialysewasser höhere Anforderungen gestellt als an Trinkwasser?', options: [
        { t: 'Pro Behandlung hat das Blut über die Membran Kontakt mit über 100 Litern Flüssigkeit – Verunreinigungen und Endotoxine können direkt ins Blut gelangen.', correct: true, fb: 'Richtig. Deshalb gelten Grenzwerte für Keime, Endotoxine und chemische Stoffe (ISO 23500).' },
        { t: 'Weil das Wasser getrunken wird.', correct: false, fb: 'Es wird nicht getrunken, sondern gelangt indirekt in Kontakt mit dem Blut.' },
        { t: 'Damit die Geräte nicht verkalken – für den Patienten ist es egal.', correct: false, fb: 'Die Wasserqualität ist vor allem eine Frage der Patientensicherheit.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Dialyse ist ein Geräteverbund aus Wasseraufbereitung, Dialysegerät und Überwachung. Schutzsysteme (Druck, Luft, Blutleck, Leitfähigkeit) sichern den extrakorporalen Kreislauf.</p>' }
    ]
  });
})();
