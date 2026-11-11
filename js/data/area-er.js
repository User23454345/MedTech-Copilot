/* =====================================================================
   Bereich: Notaufnahme (Schockraum)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'stretcher', name: 'Notfalltrage / Schockraumliege', short: 'Notfalltrage', category: 'Lagerung',
    manufacturers: ['Stryker', 'Hillrom (Baxter)', 'Linet', 'Ferno', 'Stiegelmeyer'], mdr: 'I',
    standards: ['IEC 60601-2-52 (Medizinische Betten)'],
    purpose: 'Schneller, sicherer Transport und Lagerung von Notfallpatienten; Untersuchung, Reanimation und Röntgen direkt auf der Liege.',
    function: 'Hydraulische oder elektrische Höhenverstellung, verstellbares Rückenteil und Trendelenburg-Lage. Röntgendurchlässige Liegefläche mit Kassettenfach ermöglicht Aufnahmen ohne Umlagern. Seitengitter, Infusionsständer und Halterungen für Monitor und O₂-Flasche sind integriert.',
    components: [
      { name: 'Liegefläche (röntgendurchlässig)', desc: 'Mit Kassetten-/Detektorfach.' },
      { name: 'Hydraulik / Antrieb', desc: 'Höhen- und Neigungsverstellung.' },
      { name: 'Seitengitter', desc: 'Sturzschutz während Transport.' },
      { name: 'Zentralbremse & Lenkrolle', desc: 'Sicheres Abstellen und Manövrieren.' }
    ],
    measurements: [
      { name: 'Rückenteilwinkel', unit: '°', normal: '–', desc: '' },
      { name: 'Traglast', unit: 'kg', normal: 'gerätespezifisch', desc: '' }
    ],
    alarms: [
      { name: 'Bremse nicht arretiert', prio: 'low', cause: 'Zentralbremse gelöst.', action: 'Bremse feststellen.' },
      { name: 'Akku schwach (elektrische Liegen)', prio: 'low', cause: 'Kein Netzanschluss.', action: 'Laden.' }
    ],
    connections: [
      { to: 'defibrillator', type: 'Klinisch', desc: 'Harte Unterlage für Herzdruckmassage; ggf. Reanimationsbrett.' },
      { to: 'xray-system', type: 'Strahlung', desc: 'Röntgenaufnahmen durch die Liegefläche.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Monitor und Transportmonitor werden an der Liege befestigt.' }
    ],
    safety: ['Vor Umlagerung Bremsen feststellen.', 'Leitungen und Tubus beim Transport sichern.', 'Seitengitter bei Transport hochstellen.']
  });

  R({
    id: 'ecg-12lead', name: '12-Kanal-EKG-Gerät', short: '12-Kanal-EKG', category: 'Diagnostik',
    manufacturers: ['Schiller', 'GE HealthCare', 'Philips', 'Nihon Kohden', 'custo med'], mdr: 'IIa',
    standards: ['IEC 60601-2-25 (Elektrokardiographen)'],
    purpose: 'Diagnostisches Ruhe-EKG mit 12 Ableitungen – z. B. zur Erkennung eines Herzinfarkts (STEMI) und zur Lokalisation, Rhythmusdiagnostik, Leitungsstörungen.',
    function: '10 Elektroden (4 Extremitäten, 6 Brustwand) liefern 12 Ableitungen: Einthoven I, II, III, Goldberger aVR, aVL, aVF und Wilson V1–V6. Sie betrachten das Herz aus verschiedenen Richtungen in Frontal- und Horizontalebene. Im Diagnosemodus wird ein breiter Frequenzbereich (typisch 0,05–150 Hz) verwendet, damit ST-Strecken unverfälscht dargestellt werden. Interpretationsalgorithmen liefern Messwerte (PQ, QRS, QTc) und Befundvorschläge; das EKG kann digital an Klinik oder Kardiologie übertragen werden.',
    components: [
      { name: 'Druck- und Anzeigeeinheit', desc: 'Darstellung und Ausdruck (25 oder 50 mm/s).' },
      { name: 'Bedienfeld', desc: 'Patientendaten, Filter, Start der Aufzeichnung.' },
      { name: 'Patientenkabel & Elektroden', desc: '10 Elektroden, farbcodiert (IEC- oder AHA-Code).' },
      { name: 'Gerätewagen', desc: 'Fahrbar, mit Ablage für Elektroden.' },
      { name: 'Datenschnittstelle', desc: 'Übertragung ins KIS/Kardiologiesystem (z. B. DICOM-ECG, HL7).' }
    ],
    parts: [
      { name: 'Druck- und Anzeigeeinheit', x: 85, y: 46 },
      { name: 'Bedienfeld', x: 85, y: 91 },
      { name: 'Patientenkabel & Elektroden', x: 157, y: 182 },
      { name: 'Gerätewagen', x: 85, y: 200 }
    ],
    measurements: [
      { name: 'Herzfrequenz', unit: '/min', normal: '60–100', desc: '' },
      { name: 'PQ-Zeit', unit: 'ms', normal: '120–200', desc: '' },
      { name: 'QRS-Dauer', unit: 'ms', normal: '< 120', desc: '' },
      { name: 'QTc', unit: 'ms', normal: '< 450 (♂) / < 460 (♀)', desc: 'Frequenzkorrigierte QT-Zeit.' },
      { name: 'ST-Strecke', unit: 'mm bzw. mV', normal: 'isoelektrisch', desc: 'Hebungen in zusammenhängenden Ableitungen → STEMI-Verdacht.' }
    ],
    alarms: [
      { name: 'Elektrode gelöst / Signal gestört', prio: 'medium', cause: 'Schlechter Hautkontakt, Muskelzittern.', action: 'Haut vorbereiten, Elektroden neu kleben, Patient ruhig lagern.' },
      { name: 'Elektrodenvertauschung vermutet', prio: 'low', cause: 'Algorithmus erkennt untypische Achse (z. B. Arme vertauscht).', action: 'Elektrodenposition prüfen.' }
    ],
    connections: [
      { to: 'monitor', type: 'Klinisch', desc: 'Monitor-EKG (gefiltert, 3–5 Ableitungen) ersetzt nicht das diagnostische 12-Kanal-EKG.' },
      { to: 'angio-system', type: 'Klinisch', desc: 'STEMI im 12-Kanal-EKG → sofortige Herzkatheteruntersuchung.' },
      { to: 'defibrillator', type: 'Klinisch', desc: 'Viele Notfall-Defibrillatoren können ebenfalls ein 12-Kanal-EKG schreiben und telemetrisch senden.' }
    ],
    safety: [
      'Korrekte Elektrodenposition (V1/V2 im 4. ICR parasternal) – Fehlplatzierung verfälscht die Diagnose.',
      'Defibrillationsgeschützte Kabel verwenden.',
      'EKG immer mit Name/ID, Datum und Uhrzeit versehen.'
    ],
    sim: 'ecg'
  });

  R({
    id: 'ultrasound', name: 'Ultraschallgerät (Sonographie / POCUS)', short: 'Ultraschall', category: 'Bildgebung',
    manufacturers: ['GE HealthCare', 'Philips', 'Siemens Healthineers', 'Canon Medical', 'FUJIFILM Sonosite'], mdr: 'IIa',
    standards: ['IEC 60601-2-37 (Ultraschall-Diagnosegeräte)'],
    purpose: 'Bildgebung ohne ionisierende Strahlung: Schockraum-Diagnostik (eFAST: freie Flüssigkeit, Pneumothorax), Herz, Gefäße, Punktionen.',
    function: 'Piezokristalle im Schallkopf senden Ultraschallimpulse (ca. 2–15 MHz) und empfangen die Echos. Aus der Laufzeit (Schallgeschwindigkeit im Gewebe ≈ 1540 m/s) wird die Tiefe berechnet, aus der Echostärke die Helligkeit (B-Bild). Höhere Frequenz = bessere Auflösung, aber geringere Eindringtiefe. Der Doppler-Effekt erlaubt die Messung von Blutflussgeschwindigkeiten.',
    components: [
      { name: 'Bildschirm', desc: 'B-Bild, M-Mode, Doppler-Darstellung.' },
      { name: 'Bedienfeld', desc: 'Verstärkung (Gain), Tiefe, Fokus, Modi.' },
      { name: 'Schallkopf', desc: 'Linear (hochfrequent), Konvex (Abdomen), Sektor (Herz).' },
      { name: 'Trackball', desc: 'Messungen und Cursorsteuerung.' }
    ],
    parts: [
      { name: 'Bildschirm', x: 85, y: 58 },
      { name: 'Bedienfeld', x: 100, y: 162 },
      { name: 'Schallkopf', x: 15, y: 163 },
      { name: 'Trackball', x: 40, y: 162 }
    ],
    measurements: [
      { name: 'Frequenz', unit: 'MHz', normal: '2–15', desc: 'Je nach Schallkopf.' },
      { name: 'Eindringtiefe', unit: 'cm', normal: '2–25', desc: '' },
      { name: 'Thermischer/mechanischer Index', unit: 'TI / MI', normal: 'so niedrig wie möglich', desc: 'Sicherheitsindizes (ALARA).' }
    ],
    alarms: [
      { name: 'Schallkopf-Temperatur hoch', prio: 'low', cause: 'Lange Anwendung, hohe Leistung.', action: 'Pause, Leistung reduzieren.' },
      { name: 'Akku schwach', prio: 'low', cause: 'Mobiler Betrieb.', action: 'Ans Netz anschließen.' }
    ],
    connections: [
      { to: 'pacs-workstation', type: 'Daten', desc: 'Bilder und Loops werden ins PACS übertragen.' },
      { to: 'stretcher', type: 'Klinisch', desc: 'Untersuchung direkt an der Liege, ohne Transport.' },
      { to: 'pendant', type: 'Strom', desc: 'Netz/Akku.' }
    ],
    safety: [
      'Schallköpfe nach jeder Anwendung desinfizieren; bei Punktionen sterile Schutzhüllen.',
      'ALARA-Prinzip auch beim Ultraschall (TI/MI beachten), besonders in der Geburtshilfe.',
      'Kein ionisierender Strahlenschutz nötig – ein großer Vorteil im Schockraum.'
    ],
    sim: 'imaging'
  });

  R({
    id: 'er-transport-ventilator', name: 'Transportbeatmungsgerät', short: 'Transportbeatmung', category: 'Atmung',
    manufacturers: ['Dräger', 'Hamilton Medical', 'Weinmann (Löwenstein Medical)', 'GS (corpuls)', 'ZOLL'], mdr: 'IIb',
    standards: ['ISO 80601-2-84 (Notfall- und Transportbeatmungsgeräte)'],
    purpose: 'Beatmung während Rettungsdienst, innerklinischen Transporten (z. B. zum CT) und im Schockraum.',
    function: 'Kompaktes, akkubetriebenes Gerät, das Sauerstoff aus einer Flasche oder der Wandversorgung nutzt. Es bietet volumen- und druckkontrollierte Modi, NIV und oft CPR-Modi. Die Gaszufuhr ist begrenzt: Der O₂-Vorrat einer Flasche ergibt sich aus Volumen × Fülldruck.',
    components: [
      { name: 'Display & Bedienknopf', desc: 'Einstellung von VT, AF, PEEP, FiO₂.' },
      { name: 'Akku', desc: 'Mehrere Stunden Betrieb.' },
      { name: 'O₂-Anschluss', desc: 'Flasche (mit Druckminderer) oder Wand.' },
      { name: 'Patientenschlauchsystem', desc: 'Einweg-System mit Exspirationsventil und Flowsensor.' }
    ],
    measurements: [
      { name: 'Atemwegsdruck', unit: 'cmH₂O', normal: '< 30', desc: '' },
      { name: 'Tidalvolumen', unit: 'ml', normal: '6–8 ml/kg IBW', desc: '' },
      { name: 'O₂-Restvorrat', unit: 'l / min', normal: '–', desc: 'Flaschenvolumen (l) × Druck (bar) = verfügbare Liter.' }
    ],
    alarms: [
      { name: 'O₂-Druck niedrig', prio: 'high', cause: 'Flasche leer oder Ventil zu.', action: 'Flasche wechseln, ggf. Handbeatmung.' },
      { name: 'Diskonnektion', prio: 'high', cause: 'Schlauch gelöst.', action: 'Verbindung prüfen.' },
      { name: 'Akku schwach', prio: 'medium', cause: 'Lange Transporte.', action: 'Netz anschließen.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'Stationär O₂ aus der Wand, unterwegs aus der Flasche.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Transportmonitor mit Kapnographie zur Überwachung.' },
      { to: 'ventilator', type: 'Klinisch', desc: 'Übergabe an das Intensivbeatmungsgerät auf der ITS.' }
    ],
    safety: [
      'Vor dem Transport O₂-Vorrat und Akkustand berechnen bzw. prüfen – mit Reserve.',
      'Beatmungsbeutel und Maske immer mitführen.',
      'O₂-Flaschen sicher befestigen; Ventil langsam öffnen, fett- und ölfrei arbeiten.'
    ],
    sim: 'ventilation'
  });

  MT.registerArea({
    id: 'er', name: 'Notaufnahme', short: 'ZNA', icon: '🚑', color: '#d62839',
    sign: 'ZNA · Schockraum 1', signSub: 'Lernumgebung · fiktiver Patient',
    description: 'Der Schockraum der zentralen Notaufnahme: Hier werden kritisch kranke und verletzte Patienten in den ersten Minuten stabilisiert. Alles muss mobil, schnell und ausfallsicher sein.',
    patientInfo: 'Lernpatient „P-08“ (fiktiv) · 61 J. · ca. 85 kg · seit 40 min starke Brustschmerzen, kaltschweißig · per Rettungsdienst eingeliefert',
    room: { wall: '#f5eeee', wall2: '#ebdfe0', floor: '#cdd3da', floor2: '#b4bdc7', horizon: 640 },
    decor: [{ visual: 'cart', x: 225, y: 600, w: 160 }, { visual: 'dispenser', x: 640, y: 380, w: 40 }],
    placements: [
      { device: 'pendant', visual: 'pendant', x: 40, y: 34, w: 120, labelY: 470, labelX: 100 },
      { device: 'suction', visual: 'suction', x: 6, y: 600, w: 70 },
      { device: 'infusion-pump', visual: 'iv-pole', x: 900, y: 170, w: 105, opts: { bag: 'Ringer', rate: '100' } },
      { device: 'monitor', visual: 'monitor', x: 200, y: 96, w: 230, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'er-transport-ventilator', visual: 'transport-vent', x: 236, y: 512, w: 140 },
      { device: 'stretcher', visual: 'stretcher', x: 420, y: 520, w: 600 },
      { device: 'defibrillator', visual: 'defibrillator', x: 1050, y: 500, w: 140 },
      { device: 'ecg-12lead', visual: 'ecg-cart', x: 1215, y: 480, w: 150 },
      { device: 'ultrasound', visual: 'ultrasound', x: 1385, y: 420, w: 160 },
      { device: 'bga', visual: 'bga', x: 1120, y: 300, w: 130 }
    ],
    hosesBehind: [
      '<rect x="1090" y="430" width="200" height="12" rx="3" fill="#b9c3cc"/>',
      '<path d="M128 220 C 150 380, 200 420, 250 520" stroke="#fff" stroke-width="6" fill="none" filter="url(#f-soft)"/>',
      '<path d="M415 300 C 420 420, 520 470, 560 590" stroke="#59636e" stroke-width="3" fill="none"/>'
    ],
    hosesFront: [
      '<path d="M370 600 C 420 560, 460 580, 500 600" stroke="#8cc4f0" stroke-width="8" fill="none" stroke-linecap="round"/>',
      '<path d="M1360 580 C 1300 650, 900 640, 720 620" stroke="#2a3038" stroke-width="2.5" fill="none"/>',
      '<path d="M920 400 C 900 520, 760 560, 700 600" stroke="rgba(150,190,225,.95)" stroke-width="2.5" fill="none"/>'
    ],
    scenarios: ['er-chestpain', 'er-trauma'],
    learningGoals: [
      'Geräte des Schockraums und ihre Rolle in den ersten Minuten benennen',
      'Monitor-EKG und diagnostisches 12-Kanal-EKG unterscheiden',
      'STEMI-Pfad: Geräteverbund Notaufnahme → Herzkatheterlabor verstehen',
      'Defibrillator sicher einsetzen',
      'eFAST-Ultraschall und Transportbeatmung (O₂-Vorrat) einordnen'
    ],
    facts: [
      'Monitor-EKGs filtern stärker (ca. 0,5–40 Hz) als diagnostische 12-Kanal-EKGs (0,05–150 Hz) – ST-Strecken werden daher nur im Diagnosemodus zuverlässig beurteilt.',
      'O₂-Vorrat: Eine 10-l-Flasche mit 200 bar enthält ca. 2000 l Sauerstoff.',
      'Ultraschall nutzt keine ionisierende Strahlung und ist deshalb ideal für wiederholte Untersuchungen im Schockraum.'
    ],
    createState: function () {
      return { patient: MT.physio.createPatient({ hr: 98, rhythm: 'stemi', spo2: 94, sys: 138, dia: 84, rr: 22, etco2: 33, temp: 36.6, nibpSys: 140, nibpDia: 86, hasArt: true }), vent: null };
    }
  });

  MT.registerScenario({
    id: 'er-chestpain', area: 'er', title: 'Brustschmerz: Vom Monitor zum Herzkatheter', level: 'Fortgeschritten', duration: '8 min',
    summary: 'Ein Patient mit akutem Brustschmerz. Erkenne den Infarkt im EKG, handle beim Kammerflimmern und verstehe die Behandlungskette.',
    steps: [
      { type: 'info', title: 'Ankunft', text: '<p>Lernpatient „P-08“ (fiktiv) kommt mit starken Brustschmerzen in den Schockraum. Er wird auf die Notfalltrage umgelagert.</p>', enter: function (c) { c.reset(); } },
      { type: 'find', device: 'monitor', title: 'Erste Überwachung', prompt: 'Welches Gerät wird zuerst angeschlossen, um Rhythmus, Sättigung und Blutdruck kontinuierlich zu überwachen?', explain: 'Der <b>Patientenmonitor</b> überwacht kontinuierlich. Der Monitor meldet eine ST-Hebung – das muss diagnostisch abgeklärt werden.' },
      { type: 'find', device: 'ecg-12lead', title: 'Diagnostik', prompt: 'Mit welchem Gerät sicherst du den Verdacht auf einen Herzinfarkt?', explain: 'Das <b>12-Kanal-EKG</b> zeigt das Herz aus 12 Richtungen und erlaubt die Lokalisation der Ischämie.' },
      { type: 'quiz', title: 'Warum nicht einfach der Monitor?', question: 'Warum reicht das Monitor-EKG zur Infarktdiagnose nicht aus?', options: [
        { t: 'Der Monitor nutzt weniger Ableitungen und einen stärkeren Filter, der ST-Strecken verfälschen kann; erst 12 Ableitungen erlauben Diagnose und Lokalisation.', correct: true, fb: 'Richtig. Monitor = Überwachung, 12-Kanal-EKG = Diagnose.' },
        { t: 'Der Monitor kann keine Herzfrequenz messen.', correct: false, fb: 'Doch – die Herzfrequenz misst der Monitor zuverlässig.' },
        { t: 'Weil das 12-Kanal-EKG mit Röntgenstrahlen arbeitet.', correct: false, fb: 'Das EKG misst elektrische Spannungen, keine Strahlung.' }
      ] },
      { type: 'quiz', title: 'Behandlungspfad', question: 'Das 12-Kanal-EKG zeigt einen ST-Hebungsinfarkt (STEMI). Wie geht es weiter?', options: [
        { t: 'Schnellstmögliche Herzkatheteruntersuchung (PCI) – die Zeit bis zur Wiedereröffnung des Gefäßes ist entscheidend.', correct: true, fb: 'Richtig: „Time is muscle“. Das EKG kann oft schon vorab digital an das Herzkatheterteam übermittelt werden.' },
        { t: 'MRT zur Bestätigung abwarten.', correct: false, fb: 'Ein MRT würde wertvolle Zeit kosten.' },
        { t: 'Erst einmal nur weiter beobachten.', correct: false, fb: 'Beim STEMI zählt jede Minute.' }
      ] },
      { type: 'info', title: 'Plötzlich!', text: '<p>Noch während der Vorbereitung verdreht der Patient die Augen und reagiert nicht mehr. Der Monitor alarmiert rot.</p>', enter: function (c) { c.set({ rhythm: 'vf', hr: 0 }); c.alarmPulse('monitor', true); } },
      { type: 'find', device: 'defibrillator', title: 'Handeln', prompt: 'Kammerflimmern! Welches Gerät brauchst du sofort?', explain: '<b>Defibrillator</b>: Pads kleben, Rhythmus analysieren, Schock abgeben, sofort weiter Herzdruckmassage.' },
      { type: 'quiz', title: 'Sicherheit', question: 'Was ist unmittelbar vor der Schockabgabe am wichtigsten?', options: [
        { t: 'Laut ankündigen und sicherstellen, dass niemand Patient oder Trage berührt', correct: true, fb: 'Richtig. Danach sofort Thoraxkompressionen fortsetzen.' },
        { t: 'Das 12-Kanal-EKG ausdrucken', correct: false, fb: 'Das kostet Zeit – zuerst defibrillieren.' },
        { t: 'Die Trage hochfahren', correct: false, fb: 'Die Höhe ist für die Herzdruckmassage relevant, aber nicht der Sicherheitsschritt vor dem Schock.' }
      ], after: function (c) { c.set({ rhythm: 'stemi', hr: 104 }); c.alarmPulse('monitor', false); } },
      { type: 'info', title: 'ROSC und Weiterverlegung', text: '<p>Nach dem Schock kehrt ein Rhythmus mit Puls zurück. Der Patient wird mit Transportmonitor und Defibrillator ins <a href="#/area/cathlab">Herzkatheterlabor</a> gebracht.</p><p><b>Geräteverbund über Abteilungsgrenzen:</b> Monitor → 12-Kanal-EKG → Datenübertragung → Angiographieanlage.</p>' }
    ]
  });

  MT.registerScenario({
    id: 'er-trauma', area: 'er', title: 'Schockraum-Check und Transport', level: 'Einstieg', duration: '6 min',
    summary: 'Bereite den Schockraum für einen Unfallpatienten vor: Ultraschall, Transportbeatmung und Sauerstoffvorrat.',
    steps: [
      { type: 'info', title: 'Voranmeldung', text: '<p>Der Rettungsdienst meldet einen schwer verletzten, intubierten Patienten (fiktiv). Ankunft in 10 Minuten. Du prüfst die Geräte.</p>' },
      { type: 'find', device: 'ultrasound', title: 'Schnelle Bildgebung', prompt: 'Welches Gerät erlaubt in Minuten eine Suche nach freier Flüssigkeit im Bauch – ohne Strahlung und ohne Transport?', explain: 'Das <b>Ultraschallgerät</b> – im Schockraum als eFAST-Untersuchung (extended Focused Assessment with Sonography for Trauma).' },
      { type: 'quiz', title: 'Prinzip', question: 'Wie berechnet das Ultraschallgerät die Tiefe einer Struktur?', options: [
        { t: 'Aus der Laufzeit des Echos und der angenommenen Schallgeschwindigkeit im Gewebe (≈ 1540 m/s)', correct: true, fb: 'Richtig: Tiefe = c · t / 2 (hin und zurück).' },
        { t: 'Aus der Röntgenabsorption', correct: false, fb: 'Ultraschall nutzt keine Röntgenstrahlung.' },
        { t: 'Aus der Magnetfeldstärke', correct: false, fb: 'Das wäre MRT.' }
      ] },
      { type: 'find', device: 'er-transport-ventilator', title: 'Beatmung unterwegs', prompt: 'Der Patient wird nach der Erstversorgung zum CT gebracht. Mit welchem Gerät wird er währenddessen beatmet?', explain: 'Das <b>Transportbeatmungsgerät</b> läuft über Akku und O₂-Flasche.' },
      { type: 'quiz', title: 'O₂-Vorrat', question: 'Die 10-l-O₂-Flasche zeigt 150 bar. Das Gerät verbraucht bei FiO₂ 100 % etwa 10 l/min. Wie lange reicht der Vorrat ungefähr?', options: [
        { t: 'ca. 150 Minuten (10 l × 150 bar = 1500 l)', correct: true, fb: 'Richtig. In der Praxis plant man eine Reserve ein und berücksichtigt ggf. den Eigenverbrauch des Geräts.' },
        { t: 'ca. 15 Minuten', correct: false, fb: 'Rechne: 10 l × 150 bar = 1500 l; 1500 l / 10 l/min = 150 min.' },
        { t: 'ca. 1500 Minuten', correct: false, fb: '1500 sind die Liter, nicht die Minuten.' }
      ] },
      { type: 'find', device: 'suction', title: 'Atemweg', prompt: 'Welches Gerät muss für die Atemwegssicherung immer sofort einsatzbereit sein?', explain: 'Die <b>Absaugung</b> – Blut oder Erbrochenes im Rachen ist bei Traumapatienten häufig.' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Schockraum-Geräte müssen mobil, akkugepuffert und sofort einsatzbereit sein. Vor jedem Transport: Akkus, O₂-Vorrat und Notfallausrüstung prüfen.</p>' }
    ]
  });
})();
