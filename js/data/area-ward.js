/* =====================================================================
   Bereich: Normalstation
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'ward-bed', name: 'Pflegebett (Krankenhausbett)', short: 'Pflegebett', category: 'Lagerung',
    manufacturers: ['Stiegelmeyer', 'Völker', 'Hillrom (Baxter)', 'Linet', 'Arjo'], mdr: 'I',
    standards: ['IEC 60601-2-52 (Medizinische Betten)'],
    purpose: 'Sichere Lagerung, Mobilisation und Pflege von Patientinnen und Patienten.',
    function: 'Elektromotorische Verstellung von Höhe, Rücken- und Beinteil; Seitengitter als Sturzschutz; Zentralbremse; teilweise Bettausstiegsüberwachung. Die Niedrigposition reduziert Sturzfolgen.',
    components: [
      { name: 'Antriebe & Handschalter', desc: 'Mit Sperrfunktion für einzelne Bewegungen.' },
      { name: 'Seitengitter', desc: 'Nur nach Indikation (freiheitsentziehende Maßnahme beachten).' },
      { name: 'Liegefläche & Matratze', desc: 'Ggf. Dekubitus-Weichlagerung.' },
      { name: 'Zentralbremse', desc: 'Feststellen beim Transfer.' }
    ],
    measurements: [
      { name: 'Liegeflächenhöhe', unit: 'cm', normal: 'Niedrigposition zur Sturzprophylaxe', desc: '' },
      { name: 'Sichere Arbeitslast', unit: 'kg', normal: 'gerätespezifisch', desc: '' }
    ],
    alarms: [
      { name: 'Bettausstieg', prio: 'medium', cause: 'Sturzgefährdeter Patient verlässt das Bett.', action: 'Patient aufsuchen.' },
      { name: 'Bremse gelöst', prio: 'low', cause: 'Bremse nicht arretiert.', action: 'Feststellen.' }
    ],
    connections: [
      { to: 'nurse-call', type: 'Signal', desc: 'Bettausstiegsalarm kann über die Rufanlage gemeldet werden.' },
      { to: 'pca-pump', type: 'Klinisch', desc: 'Infusionsleitungen bei Verstellung nicht einklemmen.' }
    ],
    safety: ['Einklemmgefahr an Seitengittern und Gelenken beachten.', 'Handschalter für nicht einsichtsfähige Patienten sperren.', 'Netzkabel nicht überrollen.']
  });

  R({
    id: 'spot-monitor', name: 'Vitaldatenmessgerät (Spot-Check)', short: 'Vitaldatenmessgerät', category: 'Überwachung',
    manufacturers: ['Welch Allyn (Baxter)', 'Philips', 'Mindray', 'GE HealthCare', 'Nihon Kohden'], mdr: 'IIa',
    standards: ['IEC 80601-2-30 (automatische nicht-invasive Blutdruckmessgeräte)', 'ISO 80601-2-61 (Pulsoximeter)', 'ISO 80601-2-56 (Thermometer)'],
    purpose: 'Schnelle, punktuelle Messung der Vitalzeichen auf Normalstation – Grundlage für Frühwarnscores wie NEWS2.',
    function: 'Ein fahrbares Gerät misst nicht-invasiv den Blutdruck (oszillometrisch über eine Manschette), die Sauerstoffsättigung (Pulsoximetrie), den Puls und die Temperatur (z. B. Infrarot-Ohr- oder Kontaktthermometer). Werte werden digital ins Krankenhausinformationssystem übertragen, oft mit automatischer Score-Berechnung.',
    components: [
      { name: 'Display', desc: 'Messwerte und Score.' },
      { name: 'NIBP-Manschette', desc: 'Verschiedene Größen (Kinder, Erwachsene, adipöse Patienten).' },
      { name: 'SpO₂-Fingerclip', desc: 'Rot-/Infrarot-LEDs und Fotodiode.' },
      { name: 'Thermometer', desc: 'Mit Einweg-Schutzhüllen.' },
      { name: 'Fahrstativ mit Korb', desc: 'Mobil von Zimmer zu Zimmer.' }
    ],
    parts: [
      { name: 'Display', x: 65, y: 44 },
      { name: 'NIBP-Manschette', x: 113, y: 206 },
      { name: 'Fahrstativ mit Korb', x: 65, y: 200 }
    ],
    measurements: [
      { name: 'Blutdruck (NIBP)', unit: 'mmHg', normal: '≈ 120/80', desc: '' },
      { name: 'SpO₂', unit: '%', normal: '≥ 96 (NEWS2 Skala 1)', desc: '' },
      { name: 'Puls', unit: '/min', normal: '51–90 (NEWS2 0 Punkte)', desc: '' },
      { name: 'Temperatur', unit: '°C', normal: '36,1–38,0', desc: '' },
      { name: 'Atemfrequenz (manuell)', unit: '/min', normal: '12–20', desc: 'Wird meist gezählt – ein wichtiger, oft unterschätzter Frühwarnparameter.' }
    ],
    alarms: [
      { name: 'NIBP-Messung fehlgeschlagen', prio: 'low', cause: 'Bewegung, falsche Manschettengröße, Arrhythmie.', action: 'Wiederholen, Manschette prüfen.' },
      { name: 'Grenzwertüberschreitung', prio: 'medium', cause: 'Messwert außerhalb des Normbereichs.', action: 'Nachmessen, Score berechnen, eskalieren.' }
    ],
    connections: [
      { to: 'nurse-call', type: 'Klinisch', desc: 'Bei hohem Score Hilfe/Notfallteam anfordern.' },
      { to: 'central-station', type: 'Daten', desc: 'Werte werden in die elektronische Kurve übertragen.' },
      { to: 'ward-o2-flowmeter', type: 'Klinisch', desc: 'O₂-Gabe beeinflusst Sättigung und Score (Zusatzpunkte für Sauerstoff).' }
    ],
    safety: [
      'Passende Manschettengröße wählen; nicht am Shunt- oder Lymphödemarm messen.',
      'Desinfektion zwischen Patienten.',
      'NIBP-Messfunktion unterliegt der messtechnischen Kontrolle (MTK).'
    ],
    sim: 'bloodpressure'
  });

  R({
    id: 'pca-pump', name: 'PCA-Pumpe (patientenkontrollierte Analgesie)', short: 'PCA-Pumpe', category: 'Infusion',
    manufacturers: ['B. Braun', 'BD', 'ICU Medical', 'Fresenius Kabi', 'Baxter'], mdr: 'IIb',
    standards: ['IEC 60601-2-24'],
    purpose: 'Ermöglicht Patientinnen und Patienten, sich selbst innerhalb ärztlich festgelegter Grenzen Schmerzmittel (meist Opioide) zu verabreichen.',
    function: 'Auf Knopfdruck gibt die Pumpe einen voreingestellten Bolus ab. Eine Sperrzeit (Lockout) verhindert weitere Boli, bis das Medikament wirkt; ein Höchstwert pro Zeit (z. B. 4-h-Limit) begrenzt die Gesamtdosis. Optional läuft eine Basalrate. Das Gerät protokolliert angeforderte und abgegebene Boli. Die Programmierung ist durch Schlüssel/Code gesichert.',
    components: [
      { name: 'Pumpe mit gesichertem Reservoir', desc: 'Abschließbar gegen Manipulation.' },
      { name: 'Patiententaster', desc: 'Bolusanforderung durch den Patienten selbst.' },
      { name: 'Programmierung mit Zugangscode', desc: 'Bolus, Sperrzeit, Limits.' },
      { name: 'Ereignisprotokoll', desc: 'Anforderungen vs. abgegebene Boli.' }
    ],
    measurements: [
      { name: 'Bolusdosis', unit: 'mg', normal: 'nach Verordnung', desc: '' },
      { name: 'Sperrzeit', unit: 'min', normal: 'typ. 5–15', desc: '' },
      { name: 'Anforderungen / Gaben', unit: 'Anzahl', normal: '–', desc: 'Viele Anforderungen bei wenigen Gaben → unzureichende Schmerztherapie?' }
    ],
    alarms: [
      { name: 'Okklusion', prio: 'high', cause: 'Leitung abgeknickt, Zugang verschlossen.', action: 'Leitung prüfen.' },
      { name: 'Reservoir fast leer', prio: 'low', cause: 'Medikament verbraucht.', action: 'Neues Reservoir nach Verordnung.' },
      { name: 'Dosislimit erreicht', prio: 'low', cause: 'Maximaldosis im Zeitraum erreicht.', action: 'Schmerz und Vigilanz beurteilen, Arzt informieren.' }
    ],
    connections: [
      { to: 'spot-monitor', type: 'Klinisch', desc: 'Opioide können die Atmung dämpfen – regelmäßige Kontrolle von Atemfrequenz, SpO₂ und Vigilanz.' },
      { to: 'ward-o2-flowmeter', type: 'Klinisch', desc: 'Sauerstoffgabe kann eine Atemdepression in der SpO₂ verschleiern.' },
      { to: 'infusion-pump', type: 'Fluid', desc: 'PCA-Leitung mit Rückschlagventil an Trägerlösung anschließen.' }
    ],
    safety: [
      '„PCA by proxy“ vermeiden: Nur der Patient selbst drückt den Taster!',
      'Atemfrequenz und Sedierungsgrad regelmäßig erfassen.',
      'Programmierung im Vier-Augen-Prinzip kontrollieren.'
    ],
    sim: 'infusion'
  });

  R({
    id: 'nurse-call', name: 'Patientenrufanlage', short: 'Rufanlage', category: 'IT & Vernetzung',
    manufacturers: ['Ackermann (Honeywell)', 'Schrack Seconet', 'Tunstall', 'Hillrom (Baxter)', 'Siemens'],
    standards: ['DIN VDE 0834 (Rufanlagen in Krankenhäusern)'],
    purpose: 'Ermöglicht Patienten, jederzeit Pflegepersonal zu rufen; leitet auch Alarme von Geräten und Notrufe weiter.',
    function: 'Ein Ruf am Bett oder im Bad wird über ein Bussystem an Dienstzimmer, Flurlampen und mobile Endgeräte gemeldet. Eine Anwesenheitstaste quittiert die Präsenz im Zimmer. Ein Herzalarm-/Notruf hat höhere Priorität und erreicht das Reanimationsteam. Die Anlage ist eine sicherheitsrelevante Kommunikationseinrichtung.',
    components: [
      { name: 'Ruftaster (Birne)', desc: 'Am Bett, griffbereit für den Patienten.' },
      { name: 'Zimmerterminal', desc: 'Ruf, Anwesenheit, Notruf.' },
      { name: 'Flurlampe', desc: 'Zeigt Rufe optisch auf dem Flur.' },
      { name: 'Zentrale / Server', desc: 'Weiterleitung an Dienstzimmer und Telefone.' }
    ],
    measurements: [
      { name: 'Reaktionszeit', unit: 's', normal: 'möglichst kurz', desc: 'Wird teils protokolliert.' },
      { name: 'Rufart', unit: '–', normal: 'Normal-/WC-/Notruf', desc: '' }
    ],
    alarms: [
      { name: 'Notruf / Herzalarm', prio: 'high', cause: 'Notfall im Zimmer.', action: 'Sofort hingehen, Reanimationsteam alarmieren.' },
      { name: 'Störung der Rufanlage', prio: 'medium', cause: 'Technischer Defekt.', action: 'Haustechnik, Ersatzlösung (z. B. Handglocke), engmaschige Kontrollen.' }
    ],
    connections: [
      { to: 'ward-bed', type: 'Signal', desc: 'Bettausstiegsmeldung über die Rufanlage.' },
      { to: 'spot-monitor', type: 'Klinisch', desc: 'Auffällige Vitalwerte → Arzt bzw. Notfallteam rufen.' }
    ],
    safety: ['Ruftaster immer in Reichweite des Patienten.', 'Funktion regelmäßig prüfen.']
  });

  R({
    id: 'ward-o2-flowmeter', name: 'Sauerstoff-Flowmeter (Wandentnahme)', short: 'O₂-Flowmeter', category: 'Atmung',
    manufacturers: ['Dräger', 'GCE', 'Precision Medical', 'Amvex', 'Ohio Medical'], mdr: 'IIa',
    standards: ['ISO 15002 (Durchflussmessgeräte für Entnahmestellen)'],
    purpose: 'Dosierte Gabe von Sauerstoff über Nasenbrille oder Maske.',
    function: 'Das Flowmeter wird in die O₂-Entnahmestelle gesteckt. Ein Nadelventil stellt den Flow (l/min) ein, ein Schwebekörper in einem konischen Glasrohr zeigt ihn an. Bei Bedarf wird über einen Sprudelbefeuchter angefeuchtet. Nasenbrille: ca. 1–4 l/min, einfache Maske: ca. 5–10 l/min.',
    components: [
      { name: 'Steckkupplung', desc: 'Gasartspezifisch für die O₂-Wanddose.' },
      { name: 'Messrohr mit Schwebekörper', desc: 'Ablesen in l/min (Kugelmitte bzw. Oberkante je nach Hersteller).' },
      { name: 'Regelventil', desc: 'Einstellung des Flows.' },
      { name: 'Anschluss für Nasenbrille/Maske', desc: 'Ggf. mit Befeuchter.' }
    ],
    measurements: [
      { name: 'O₂-Flow', unit: 'l/min', normal: 'nach Verordnung / SpO₂-Ziel', desc: 'Ziel meist 94–98 %, bei Hyperkapnie-Risiko (COPD) oft 88–92 %.' },
      { name: 'Ungefähre FiO₂ (Nasenbrille)', unit: '%', normal: 'ca. 24–40', desc: 'Faustregel: +3–4 % pro l/min.' }
    ],
    alarms: [
      { name: 'Kein Flow', prio: 'medium', cause: 'Nicht richtig eingesteckt, zentrale Versorgung gestört.', action: 'Anschluss prüfen; Wanddose testen.' },
      { name: 'Befeuchter leer / Leck', prio: 'low', cause: 'Wasser verbraucht, Deckel undicht.', action: 'Wechseln.' }
    ],
    connections: [
      { to: 'spot-monitor', type: 'Klinisch', desc: 'SpO₂-Messung steuert die O₂-Dosierung.' },
      { to: 'pca-pump', type: 'Klinisch', desc: 'Unter Opioiden kann Sauerstoff eine Hypoventilation in der SpO₂ verbergen.' }
    ],
    safety: ['Sauerstoff ist ein Medikament – nur nach Verordnung mit Zielbereich.', 'Brandgefahr: nicht rauchen, keine fetthaltigen Salben im Gesicht, Funkenquellen vermeiden.']
  });

  R({
    id: 'ward-glucometer', name: 'Blutzuckermessgerät (POCT)', short: 'Blutzuckermessgerät', category: 'Labor / POCT',
    manufacturers: ['Roche', 'Abbott', 'Nova Biomedical', 'Ascensia', 'LifeScan'], mdr: 'IVD (IVDR)',
    standards: ['ISO 15197 (Blutzuckermesssysteme)', 'Rili-BÄK (POCT-Qualitätssicherung)'],
    purpose: 'Schnelle Bestimmung des Blutzuckers aus Kapillarblut am Patientenbett.',
    function: 'Ein Teststreifen enthält ein Enzym (Glukoseoxidase oder Glukosedehydrogenase). Die Reaktion mit Glukose erzeugt einen elektrischen Strom (amperometrisch), der proportional zur Konzentration ist. Klinikgeräte sind vernetzt, speichern Patienten-ID, Bediener und Qualitätskontrollen.',
    components: [
      { name: 'Messgerät mit Display', desc: 'Ergebnis in mg/dl oder mmol/l.' },
      { name: 'Teststreifen', desc: 'Chargenabhängig, Haltbarkeit beachten.' },
      { name: 'Barcode-/Dockingstation', desc: 'Patienten-ID und Datenübertragung.' }
    ],
    measurements: [
      { name: 'Blutglukose', unit: 'mg/dl (mmol/l)', normal: 'nüchtern ca. 70–100 (3,9–5,6)', desc: '' },
      { name: 'Qualitätskontrolle', unit: '–', normal: 'im Sollbereich', desc: 'Nach Rili-BÄK.' }
    ],
    alarms: [
      { name: 'Wert außerhalb Messbereich (HI/LO)', prio: 'high', cause: 'Extreme Hypo- oder Hyperglykämie.', action: 'Sofort Arzt, Laborkontrolle.' },
      { name: 'QK fällig / Streifen abgelaufen', prio: 'medium', cause: 'Qualitätssicherung.', action: 'Gerät gesperrt bis QK.' }
    ],
    connections: [
      { to: 'infusion-pump', type: 'Klinisch', desc: 'Insulin-/Glukosetherapie wird nach dem Wert angepasst.' },
      { to: 'central-station', type: 'Daten', desc: 'Werte werden in die Patientenakte übertragen.' }
    ],
    safety: ['Patientenidentifikation vor der Messung.', 'Hände des Patienten reinigen (Zuckerreste verfälschen).', 'Kapillarmessung bei Schock/Zentralisation unzuverlässig.']
  });

  MT.registerArea({
    id: 'ward', name: 'Normalstation', short: 'Station', icon: '🛏️', color: '#3a9d5d',
    sign: 'Station 4B · Zimmer 214', signSub: 'Lernumgebung · fiktive Patienten',
    description: 'Ein Zweibettzimmer der chirurgischen Normalstation. Hier gibt es keine Dauerüberwachung – umso wichtiger sind regelmäßige Vitalzeichenkontrollen, Frühwarnscores und die Rufanlage.',
    patientInfo: 'Bett A: Lernpatient „P-52“ (fiktiv) · 72 J. · 2. Tag nach Hüft-TEP · PCA-Pumpe mit Opioid · O₂ 2 l/min über Nasenbrille',
    room: { wall: '#eef6f0', wall2: '#dceadf', floor: '#d6cfc2', floor2: '#c2b9aa', horizon: 640 },
    decor: [{ visual: 'window', x: 640, y: 110, w: 240 }, { visual: 'cart', x: 1440, y: 640, w: 130 }, { visual: 'dispenser', x: 600, y: 360, w: 36 }],
    placements: [
      { device: 'nurse-call', visual: 'nurse-call', x: 40, y: 330, w: 90 },
      { device: 'ward-o2-flowmeter', visual: 'o2-flowmeter', x: 150, y: 320, w: 56 },
      { device: 'suction', visual: 'suction', x: 225, y: 300, w: 62 },
      { device: 'pca-pump', visual: 'iv-pole', x: 470, y: 190, w: 105, opts: { bag: 'PCA', rate: 'PCA' } },
      { device: 'ward-bed', visual: 'ward-bed', x: 60, y: 520, w: 540 },
      { device: 'spot-monitor', visual: 'spot-monitor', x: 690, y: 430, w: 120 },
      { device: 'ward-bed', visual: 'ward-bed', x: 880, y: 520, w: 540 },
      { device: 'ward-glucometer', visual: 'glucometer', x: 1475, y: 570, w: 66 }
    ],
    hosesBehind: [
      '<rect x="20" y="300" width="300" height="12" rx="4" fill="#c8d5cb"/>',
      '<path d="M170 506 C 160 560, 130 600, 135 625" stroke="#bfe0f7" stroke-width="3" fill="none"/>'
    ],
    hosesFront: [
      '<path d="M490 420 C 470 520, 260 560, 160 600" stroke="rgba(150,190,225,.95)" stroke-width="2.5" fill="none"/>',
      '<path d="M90 420 C 70 520, 110 560, 130 600" stroke="#7d8894" stroke-width="2" fill="none"/>'
    ],
    scenarios: ['ward-news'],
    learningGoals: [
      'Vitalzeichenkontrolle und NEWS2-Frühwarnscore anwenden',
      'Funktionsweise und Sicherheitskonzept der PCA-Pumpe erklären',
      'Sauerstoffgabe über Flowmeter richtig einordnen',
      'Rufanlage als Teil der Patientensicherheit verstehen'
    ],
    facts: [
      'Die Atemfrequenz ist einer der empfindlichsten Frühwarnparameter – und wird am häufigsten nicht gemessen.',
      'Bei der PCA verhindert die Sperrzeit, dass sich Patienten Boli schneller geben, als das Medikament wirken kann.',
      'NEWS2 vergibt für jeden Vitalparameter 0–3 Punkte; ab 7 Punkten besteht ein hohes Risiko.'
    ]
  });

  MT.registerScenario({
    id: 'ward-news', area: 'ward', title: 'Spätdienst: Verschlechterung früh erkennen', level: 'Einstieg', duration: '9 min',
    summary: 'Eine Vitalzeichenrunde mit NEWS2, eine PCA-Pumpe mit Opioid und die richtige Eskalation.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Lernpatient „P-52“ (fiktiv), 72 J., 2. Tag nach Hüftoperation. Er hat eine PCA-Pumpe mit Opioid und erhält 2 l/min O₂ über eine Nasenbrille. Er klingelt und fühlt sich „nicht gut“.</p>' },
      { type: 'find', device: 'nurse-call', title: 'Der Ruf', prompt: 'Über welches System hat sich der Patient gemeldet?', explain: 'Über die <b>Patientenrufanlage</b>. Im Zimmer drückst du die Anwesenheitstaste.' },
      { type: 'find', device: 'spot-monitor', title: 'Messen', prompt: 'Womit misst du Blutdruck, SpO₂, Puls und Temperatur?', explain: 'Mit dem <b>Vitaldatenmessgerät</b>. Die Atemfrequenz zählst du selbst.' },
      { type: 'info', title: 'Messwerte (fiktiv)', text: '<table class="meas-table"><tr><td>Atemfrequenz</td><td><b>24/min</b></td></tr><tr><td>SpO₂</td><td><b>92 %</b> unter 2 l/min O₂</td></tr><tr><td>Blutdruck</td><td><b>98/60 mmHg</b></td></tr><tr><td>Puls</td><td><b>112/min</b></td></tr><tr><td>Bewusstsein</td><td>wach, orientiert</td></tr><tr><td>Temperatur</td><td><b>38,6 °C</b></td></tr></table>' },
      { type: 'quiz', title: 'NEWS2', question: 'Berechne den NEWS2 (Skala 1): AF 24 → 2, SpO₂ 92 → 2, Sauerstoff → 2, Systole 98 → 2, Puls 112 → 2, wach → 0, Temperatur 38,6 → 1. Wie hoch ist der Score?', options: [
        { t: '11 Punkte – hohes Risiko, sofortige ärztliche Beurteilung / Notfallteam', correct: true, fb: 'Richtig. Ab 7 Punkten: Notfallreaktion, Verlegung auf eine Überwachungs- oder Intensivstation prüfen.' },
        { t: '5 Punkte – mittleres Risiko, in 4 Stunden erneut messen', correct: false, fb: 'Nachrechnen: 2+2+2+2+2+0+1 = 11.' },
        { t: '2 Punkte – kein Handlungsbedarf', correct: false, fb: 'Der Patient ist deutlich gefährdet.' }
      ] },
      { type: 'find', device: 'pca-pump', title: 'Schmerztherapie', prompt: 'Welches Gerät gibt dem Patienten auf Knopfdruck Opioid-Boli?', explain: 'Die <b>PCA-Pumpe</b> mit Bolus, Sperrzeit und Dosislimit.' },
      { type: 'quiz', title: 'Sicherheitskonzept', question: 'Wofür ist die Sperrzeit (Lockout) der PCA-Pumpe da?', options: [
        { t: 'Sie verhindert weitere Boli, bevor der vorherige Bolus seine Wirkung entfaltet hat – Schutz vor Überdosierung.', correct: true, fb: 'Richtig. Zusätzlich begrenzt ein Höchstwert pro Zeitraum die Gesamtdosis.' },
        { t: 'Damit die Pumpe abkühlen kann.', correct: false, fb: 'Es geht um Pharmakologie, nicht um Technik.' },
        { t: 'Damit Angehörige in der Zeit drücken dürfen.', correct: false, fb: 'Nein! „PCA by proxy“ ist gefährlich – nur der Patient selbst drückt.' }
      ] },
      { type: 'quiz', title: 'Fallstrick Sauerstoff', question: 'Warum ist eine „gute“ SpO₂ unter Sauerstoff bei einem Patienten mit Opioid-PCA kein sicherer Beweis für eine ausreichende Atmung?', options: [
        { t: 'Sauerstoff hält die Sättigung hoch, obwohl CO₂ durch Hypoventilation ansteigt – Atemfrequenz und Vigilanz sind wichtiger.', correct: true, fb: 'Richtig. Die Pulsoximetrie misst die Oxygenierung, nicht die Ventilation.' },
        { t: 'Weil Pulsoximeter unter Sauerstoff nicht funktionieren.', correct: false, fb: 'Sie funktionieren – messen aber nur die Sättigung.' },
        { t: 'Das stimmt nicht – eine gute SpO₂ schließt jede Atemdepression aus.', correct: false, fb: 'Gerade unter O₂-Gabe kann eine Hypoventilation lange unbemerkt bleiben.' }
      ] },
      { type: 'find', device: 'ward-o2-flowmeter', title: 'Sauerstoff', prompt: 'Wo wird der Sauerstoff-Flow eingestellt?', explain: 'Am <b>O₂-Flowmeter</b> an der Wandentnahme – Ablesen am Schwebekörper.' },
      { type: 'find', device: 'ward-glucometer', title: 'Noch ein Wert', prompt: 'Der Patient ist Diabetiker und schwitzt. Womit prüfst du schnell den Blutzucker?', explain: 'Mit dem <b>Blutzuckermessgerät</b> – Hypoglykämie ist eine wichtige Differenzialdiagnose bei „geht nicht gut“.' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Auf der Normalstation ersetzt der Mensch die Dauerüberwachung: regelmäßig messen, Scores berechnen, früh eskalieren. Geräte wie PCA-Pumpe und O₂-Flowmeter wirken direkt auf die Vitalwerte – das muss man zusammen denken.</p>' }
    ]
  });
})();
