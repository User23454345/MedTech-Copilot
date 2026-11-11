/* =====================================================================
   Bereich: Neonatologie (neonatologische Intensivstation)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'incubator', name: 'Inkubator', short: 'Inkubator', category: 'Thermoregulation',
    manufacturers: ['Dräger', 'GE HealthCare', 'Atom Medical', 'Natus', 'Mediprema'], mdr: 'IIb',
    standards: ['IEC 60601-2-19 (Säuglingsinkubatoren)'],
    purpose: 'Schafft für Früh- und kranke Neugeborene eine geschützte, warme und feuchte Umgebung, um Wärme- und Flüssigkeitsverluste zu minimieren.',
    function: 'Eine Heizung erwärmt umgewälzte Luft unter der transparenten Haube. Geregelt wird entweder auf die Lufttemperatur (Luftservo) oder auf die über einen Hautsensor gemessene Körpertemperatur des Kindes (Hautservo). Ein Befeuchter erhöht die relative Luftfeuchte (in den ersten Lebenstagen sehr unreifer Frühgeborener oft 70–80 %), um Verdunstungsverluste über die dünne Haut zu senken. Wärmeverlust erfolgt über Konvektion, Konduktion, Strahlung und Evaporation – der Inkubator reduziert alle vier. Ggf. wird zusätzlich Sauerstoff geregelt zugeführt.',
    components: [
      { name: 'Haube mit Handöffnungen', desc: 'Doppelwandige, transparente Haube; Handöffnungen erlauben Pflege ohne Wärmeverlust.' },
      { name: 'Hautsensor', desc: 'Misst die Hauttemperatur für den Hautservo-Modus.' },
      { name: 'Bedien- und Anzeigeeinheit', desc: 'Soll-/Ist-Temperatur, Feuchte, O₂, Alarme.' },
      { name: 'Liegefläche mit Waage', desc: 'Neigbar, oft mit integrierter Waage.' },
      { name: 'Heizung, Lüfter & Befeuchter', desc: 'Erzeugen das Mikroklima.' }
    ],
    parts: [
      { name: 'Haube mit Handöffnungen', x: 90, y: 150 },
      { name: 'Bedien- und Anzeigeeinheit', x: 205, y: 234 },
      { name: 'Liegefläche mit Waage', x: 160, y: 191 },
      { name: 'Heizung, Lüfter & Befeuchter', x: 90, y: 245 }
    ],
    measurements: [
      { name: 'Hauttemperatur', unit: '°C', normal: '36,5–37,0 (Zielbereich nach Standard)', desc: '' },
      { name: 'Lufttemperatur', unit: '°C', normal: 'abhängig von Gewicht und Alter (oft 32–37)', desc: '' },
      { name: 'Relative Luftfeuchte', unit: '%', normal: '50–80', desc: '' },
      { name: 'Gewicht', unit: 'g', normal: '–', desc: 'Integrierte Waage.' }
    ],
    alarms: [
      { name: 'Hauttemperatur außerhalb Bereich', prio: 'medium', cause: 'Sensor gelöst, Hauben-/Klappenöffnung, Fieber.', action: 'Sensorlage prüfen, Kind beurteilen.' },
      { name: 'Übertemperatur Luft', prio: 'high', cause: 'Regelungsfehler.', action: 'Kind sofort beurteilen, ggf. Gerät wechseln.' },
      { name: 'Wasserbehälter leer', prio: 'low', cause: 'Befeuchtung erschöpft.', action: 'Steriles Wasser nachfüllen.' },
      { name: 'Netzausfall', prio: 'high', cause: 'Keine Stromversorgung.', action: 'Wärmeverlust droht – Strom sicherstellen, Kind zudecken.' }
    ],
    connections: [
      { to: 'monitor', type: 'Klinisch', desc: 'Temperaturinstabilität zeigt sich in Herzfrequenz und Atmung.' },
      { to: 'phototherapy', type: 'Klinisch', desc: 'Phototherapie kann durch die Haube erfolgen; Wärmeeintrag beachten.' },
      { to: 'neo-ventilator', type: 'Klinisch', desc: 'CPAP-/Beatmungsschläuche werden durch Durchführungen geführt.' },
      { to: 'pendant', type: 'Strom', desc: 'Stromversorgung (Sicherheitsstromversorgung).' }
    ],
    safety: [
      'Hautsensor korrekt platzieren (nicht auf der Liegeseite, nicht unter Wärmequelle).',
      'Handöffnungen geschlossen halten; Wärmeverlust bei Pflege minimieren.',
      'Befeuchterwasser steril, Hygieneintervalle beachten (Keimrisiko).',
      'Säuglingsinkubatoren fallen unter MPBetreibV Anlage 1 (Einweisung, STK).'
    ]
  });

  R({
    id: 'radiant-warmer', name: 'Reanimationseinheit mit Wärmestrahler', short: 'Wärmebett', category: 'Thermoregulation',
    manufacturers: ['Dräger', 'GE HealthCare', 'Atom Medical', 'Fisher & Paykel Healthcare', 'Phoenix Medical Systems'], mdr: 'IIb',
    standards: ['IEC 60601-2-21 (Säuglingswärmestrahler)'],
    purpose: 'Offener Arbeitsplatz zur Erstversorgung und Reanimation von Neugeborenen mit Wärmezufuhr über Infrarotstrahlung.',
    function: 'Ein Infrarotstrahler über der Liegefläche gibt Wärme ab. Die Leistung wird manuell oder über einen Hautsensor (Servo) geregelt. Integriert sind oft Absaugung, O₂/Luft-Mischer, T-Stück-Beatmung und eine APGAR-Uhr.',
    components: [
      { name: 'Infrarot-Heizstrahler', desc: 'Strahlungswärme von oben.' },
      { name: 'Steuerung mit Hautsensor', desc: 'Manuell oder Servo-geregelt.' },
      { name: 'Liegefläche', desc: 'Mit klappbaren Seitenwänden, röntgendurchlässig.' },
      { name: 'Reanimationsmodul', desc: 'O₂-Mischer, Beatmung (T-Stück), Absaugung.' }
    ],
    parts: [
      { name: 'Infrarot-Heizstrahler', x: 150, y: 32 },
      { name: 'Steuerung mit Hautsensor', x: 213, y: 145 },
      { name: 'Liegefläche', x: 150, y: 250 }
    ],
    measurements: [
      { name: 'Hauttemperatur', unit: '°C', normal: '36,5–37,5', desc: '' },
      { name: 'Heizleistung', unit: '%', normal: '–', desc: '' },
      { name: 'APGAR-Timer', unit: 'min', normal: '1 / 5 / 10', desc: 'Zeitpunkte der APGAR-Bewertung.' }
    ],
    alarms: [
      { name: 'Manueller Modus – Kontrolle', prio: 'medium', cause: 'Im manuellen Betrieb erinnert das Gerät regelmäßig (Überhitzungsgefahr).', action: 'Temperatur des Kindes prüfen.' },
      { name: 'Hautsensor gelöst', prio: 'medium', cause: 'Sensor ab.', action: 'Neu fixieren.' }
    ],
    connections: [
      { to: 'neo-ventilator', type: 'Klinisch', desc: 'Atemunterstützung während der Erstversorgung.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Pulsoximetrie (präduktal, rechte Hand) zur Steuerung der O₂-Gabe.' },
      { to: 'pendant', type: 'Gas', desc: 'O₂, Druckluft und Vakuum aus der Wandversorgung.' }
    ],
    safety: [
      'Bei Strahlerbetrieb keine Abdeckungen zwischen Strahler und Kind (Wärmeabschirmung) bzw. auf Überhitzung achten.',
      'Verdunstungsverlust ist offen höher als im Inkubator – sehr kleine Frühgeborene ggf. in Folie.',
      'Funktionscheck vor jeder Geburt.'
    ]
  });

  R({
    id: 'phototherapy', name: 'Phototherapiegerät', short: 'Phototherapie', category: 'Therapie',
    manufacturers: ['Dräger', 'GE HealthCare', 'Natus', 'Atom Medical', 'Medela'], mdr: 'IIb',
    standards: ['IEC 60601-2-50 (Phototherapie-Geräte für Säuglinge)'],
    purpose: 'Behandlung der Neugeborenengelbsucht (Hyperbilirubinämie), um eine Schädigung des Gehirns (Kernikterus) zu verhindern.',
    function: 'Blaues Licht (Wellenlänge um ca. 460 nm) wird vom Bilirubin in der Haut absorbiert und wandelt es in wasserlösliche Isomere um (Photoisomerisierung), die ohne Glucuronidierung über Galle und Urin ausgeschieden werden. Die Wirksamkeit hängt von der Bestrahlungsstärke (µW/cm²/nm) und der bestrahlten Hautfläche ab. Moderne Geräte nutzen LEDs mit geringer Wärmeentwicklung.',
    components: [
      { name: 'Lampenkopf mit LEDs', desc: 'Blaues Licht schmalbandig.' },
      { name: 'Stativ / Halterung', desc: 'Abstand zum Kind einstellbar.' },
      { name: 'Bedienteil mit Timer', desc: 'Intensität und Behandlungsstunden.' },
      { name: 'Augenschutz (Zubehör)', desc: 'Schutz der Netzhaut.' }
    ],
    parts: [
      { name: 'Lampenkopf mit LEDs', x: 80, y: 30 },
      { name: 'Stativ / Halterung', x: 80, y: 200 }
    ],
    measurements: [
      { name: 'Bestrahlungsstärke', unit: 'µW/cm²/nm', normal: 'intensiv ≥ 30', desc: 'Mit Radiometer geprüft.' },
      { name: 'Wellenlänge', unit: 'nm', normal: 'ca. 460–490', desc: '' },
      { name: 'Behandlungsdauer', unit: 'h', normal: '–', desc: '' }
    ],
    alarms: [
      { name: 'Lampenstunden überschritten', prio: 'low', cause: 'Leistung lässt nach.', action: 'Wartung, Bestrahlungsstärke messen.' },
      { name: 'Übertemperatur', prio: 'medium', cause: 'Lüfter blockiert.', action: 'Gerät prüfen.' }
    ],
    connections: [
      { to: 'incubator', type: 'Klinisch', desc: 'Bestrahlung durch die Haube; Temperatur des Kindes engmaschig kontrollieren.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Überwachung während der Therapie; blaues Licht kann die visuelle Beurteilung der Hautfarbe erschweren.' }
    ],
    safety: [
      'Augen des Kindes mit Augenschutz abdecken.',
      'Flüssigkeitsbilanz und Temperatur überwachen.',
      'Bilirubin im Blut kontrollieren – die Hautfarbe ist unter Phototherapie kein verlässlicher Indikator.'
    ]
  });

  R({
    id: 'neo-ventilator', name: 'Neonatales Beatmungsgerät / CPAP', short: 'Neo-Beatmung', category: 'Atmung',
    manufacturers: ['Dräger', 'Fritz Stephan', 'SLE', 'Vyaire Medical', 'Hamilton Medical'], mdr: 'IIb',
    standards: ['ISO 80601-2-12'],
    purpose: 'Atemunterstützung für Früh- und Neugeborene – häufig nicht-invasiv mit CPAP über Nasenprongs oder Maske, bei Bedarf invasive Beatmung oder Hochfrequenzoszillation.',
    function: 'Ein kontinuierlicher Gasfluss erzeugt einen positiven Atemwegsdruck (CPAP, typ. 5–8 cmH₂O), der die kleinen, kollapsgefährdeten Alveolen offen hält. Die Sauerstoffkonzentration wird präzise gemischt. Sehr kleine Tidalvolumina (wenige Milliliter) erfordern hochempfindliche Flowsensoren nahe am Patienten. Das Atemgas wird aktiv erwärmt und befeuchtet.',
    components: [
      { name: 'Bildschirm', desc: 'Kurven, Drücke, FiO₂, Leckage.' },
      { name: 'Gasmischer', desc: 'O₂/Luft, FiO₂ 21–100 %.' },
      { name: 'Aktiver Befeuchter', desc: 'Atemgas ca. 37 °C, gesättigt.' },
      { name: 'Patienteninterface', desc: 'Nasale Prongs oder Maske (CPAP), Tubus (invasiv).' },
      { name: 'Proximaler Flowsensor', desc: 'Misst Volumina im Milliliterbereich.' }
    ],
    parts: [
      { name: 'Bildschirm', x: 75, y: 55 },
      { name: 'Aktiver Befeuchter', x: 76, y: 198 },
      { name: 'Gasmischer', x: 50, y: 150 }
    ],
    measurements: [
      { name: 'CPAP / PEEP', unit: 'cmH₂O', normal: '5–8', desc: '' },
      { name: 'FiO₂', unit: '%', normal: 'so niedrig wie möglich', desc: 'Nach SpO₂-Zielbereich titriert.' },
      { name: 'Tidalvolumen', unit: 'ml/kg', normal: '4–6', desc: 'Bei 1 kg also nur 4–6 ml!' },
      { name: 'Atemfrequenz', unit: '/min', normal: '40–60', desc: '' }
    ],
    alarms: [
      { name: 'Druck niedrig / Leckage', prio: 'high', cause: 'Prongs verrutscht, Mund offen.', action: 'Interface korrigieren.' },
      { name: 'Apnoe', prio: 'high', cause: 'Unreife des Atemzentrums (Apnoe-Bradykardie-Syndrom).', action: 'Kind stimulieren, ggf. Atemunterstützung erhöhen.' },
      { name: 'FiO₂-Abweichung', prio: 'medium', cause: 'Gasversorgung, Sensor.', action: 'O₂-Sensor kalibrieren.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'O₂ und Druckluft aus der Wandversorgung.' },
      { to: 'monitor', type: 'Klinisch', desc: 'SpO₂ steuert die FiO₂-Einstellung.' },
      { to: 'incubator', type: 'Klinisch', desc: 'Schläuche werden durch Haubendurchführungen geführt.' }
    ],
    safety: [
      'SpO₂-Zielbereich bei Frühgeborenen eng einhalten – Hyperoxie fördert die Frühgeborenen-Retinopathie (ROP).',
      'Nasale Druckstellen durch Prongs vermeiden.',
      'Beatmungsbeutel/T-Stück mit passender Maskengröße bereithalten.'
    ],
    sim: 'ventilation'
  });

  R({
    id: 'neo-tcm', name: 'Transkutane Blutgasmessung (tcPO₂/tcPCO₂)', short: 'Transkutan-Monitor', category: 'Überwachung', visual: 'poc-device', visualOpts: { l1: 'tcPCO2 46', l2: 'tcPO2 62' },
    manufacturers: ['Radiometer', 'SenTec', 'Philips', 'Dräger', 'Medtronic'], mdr: 'IIb',
    standards: ['ISO 80601-2-61 (für kombinierte SpO₂-Sensoren)'],
    purpose: 'Nicht-invasive, kontinuierliche Abschätzung von Sauerstoff- und Kohlendioxidpartialdruck – reduziert Blutentnahmen bei Frühgeborenen.',
    function: 'Ein auf ca. 42–44 °C beheizter Sensor erhöht die lokale Hautdurchblutung (Arterialisierung). O₂ und CO₂ diffundieren durch die Haut zum Sensor und werden elektrochemisch gemessen (Clark- bzw. Severinghaus-Prinzip). Wegen der Hitze muss die Messstelle regelmäßig gewechselt werden.',
    components: [
      { name: 'Beheizter Sensor', desc: 'Mit Kontaktgel und Klebering.' },
      { name: 'Monitor', desc: 'Anzeige und Trends.' },
      { name: 'Kalibriereinheit', desc: 'Kalibriert den Sensor mit Testgas.' }
    ],
    measurements: [
      { name: 'tcPCO₂', unit: 'mmHg', normal: 'ca. 40–55 (Zielwerte individuell)', desc: '' },
      { name: 'tcPO₂', unit: 'mmHg', normal: 'ca. 50–80', desc: '' },
      { name: 'Sensortemperatur', unit: '°C', normal: '42–44', desc: '' }
    ],
    alarms: [
      { name: 'Messstelle wechseln', prio: 'low', cause: 'Maximale Messzeit an einer Stelle erreicht.', action: 'Sensor umsetzen (Verbrennungsschutz).' },
      { name: 'Kalibrierung erforderlich', prio: 'low', cause: 'Drift.', action: 'Kalibrieren.' }
    ],
    connections: [
      { to: 'neo-ventilator', type: 'Klinisch', desc: 'CO₂-Trend unterstützt die Steuerung der Atemunterstützung.' },
      { to: 'bga', type: 'Klinisch', desc: 'Regelmäßiger Abgleich mit einer Blutgasanalyse.' }
    ],
    safety: ['Messdauer pro Hautstelle begrenzen (Verbrennungsgefahr bei unreifer Haut).', 'Werte regelmäßig mit BGA abgleichen.']
  });

  MT.registerArea({
    id: 'neo', name: 'Neonatologie', short: 'Neo-ITS', icon: '👶', color: '#f06292',
    sign: 'Neo-ITS · Platz 4', signSub: 'Lernumgebung · fiktives Frühgeborenes',
    description: 'Ein Intensivplatz für Frühgeborene: Wärme, Feuchte, behutsame Atemunterstützung und Infusionen mit winzigen Raten. Alle Geräte sind auf sehr kleine Patienten abgestimmt.',
    patientInfo: 'Lern-Frühgeborenes „N-12“ (fiktiv) · 29+3 SSW · 1200 g · 4. Lebenstag · nasaler CPAP · Phototherapie wegen Hyperbilirubinämie',
    room: { wall: '#fdf0f5', wall2: '#f6dfe9', floor: '#d9d3dc', floor2: '#c4bcc8', horizon: 640 },
    decor: [{ visual: 'window', x: 1240, y: 150, w: 280 }],
    placements: [
      { device: 'pendant', visual: 'pendant', x: 40, y: 34, w: 110, labelY: 450, labelX: 95 },
      { device: 'neo-tcm', visual: 'poc-device', x: 175, y: 300, w: 120, opts: { l1: 'tcPCO2 46', l2: 'tcPO2 62' } },
      { device: 'monitor', visual: 'monitor', x: 320, y: 100, w: 230, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'syringe-pump', visual: 'pump-stack', x: 1110, y: 220, w: 125, opts: { noIV: true, pumps: [{ label: 'Glucose 10 %', rate: '4,8', color: 'rgba(255,255,255,.95)', fill: 60 }, { label: 'Aminosäuren', rate: '2,1', color: 'rgba(255,250,210,.95)', fill: 45 }, { label: 'Koffeincitrat', rate: '0,1', color: 'rgba(220,240,255,.9)', fill: 25 }, { label: 'Lipide', rate: '0,6', color: 'rgba(255,255,240,.95)', fill: 35 }] } },
      { device: 'neo-ventilator', visual: 'neo-vent', x: 300, y: 450, w: 150 },
      { device: 'phototherapy', visual: 'phototherapy', x: 615, y: 196, w: 150, labelY: 186 },
      { device: 'incubator', visual: 'incubator', x: 500, y: 390, w: 380 },
      { device: 'radiant-warmer', visual: 'warmer', x: 1240, y: 390, w: 300 }
    ],
    hosesBehind: [
      '<rect x="170" y="400" width="140" height="10" rx="3" fill="#cdbfcc"/>',
      '<path d="M90 220 C 120 380, 250 420, 330 480" stroke="#fff" stroke-width="6" fill="none" filter="url(#f-soft)"/>',
      '<path d="M540 300 C 560 420, 610 500, 640 540" stroke="#59636e" stroke-width="2.5" fill="none"/>'
    ],
    hosesFront: [
      '<path d="M440 560 C 500 540, 560 540, 610 545" stroke="#8cc4f0" stroke-width="7" fill="none" stroke-linecap="round"/>',
      '<path d="M1140 420 C 1050 470, 820 500, 680 548" stroke="rgba(150,190,225,.95)" stroke-width="2" fill="none"/>',
      '<path d="M240 400 C 300 480, 560 520, 630 548" stroke="#c18bff" stroke-width="2" fill="none"/>'
    ],
    scenarios: ['neo-episode'],
    learningGoals: [
      'Wärmeverlustmechanismen und die Regelung von Inkubator und Wärmebett erklären',
      'Neonatale Normwerte und Alarmgrenzen am Monitor einordnen',
      'CPAP und SpO₂-Zielbereiche bei Frühgeborenen verstehen',
      'Besonderheiten sehr kleiner Infusionsraten (Anlaufverzögerung, Siphon-Effekt) kennen',
      'Wirkprinzip und Sicherheit der Phototherapie beschreiben'
    ],
    facts: [
      'Ein Frühgeborenes mit 1000 g hat im Verhältnis zum Körpergewicht eine etwa dreimal so große Körperoberfläche wie ein Erwachsener – und verliert entsprechend schnell Wärme.',
      'Die normale Herzfrequenz eines Neugeborenen liegt bei etwa 120–160/min.',
      'Bei einer Rate von 0,1 ml/h werden in einer Stunde nur 100 µl gefördert – zwei Tropfen.'
    ],
    monitorTitle: 'Neo-ITS Platz 4 · fiktiv',
    createState: function () {
      return {
        patient: MT.physio.createPatient({ hr: 152, spo2: 92, sys: 50, dia: 29, rr: 48, etco2: 44, temp: 36.8, nibpSys: 52, nibpDia: 30,
          limits: { hr: [100, 190], spo2: [88, 101], sys: [35, 80], map: [28, 60], etco2: [30, 60], rr: [20, 80] } }),
        vent: null
      };
    }
  });

  MT.registerScenario({
    id: 'neo-episode', area: 'neo', title: 'Frühgeborenes: Bradykardie-Episode und Pflegerunde', level: 'Fortgeschritten', duration: '10 min',
    summary: 'Ein Frühgeborenes hat eine Episode mit Bradykardie und Sättigungsabfall. Danach gehst du die Geräte am Platz durch.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Lern-Frühgeborenes „N-12“ (fiktiv), 29+3 SSW, 1200 g, liegt im Inkubator unter Phototherapie und erhält nasalen CPAP. Beachte die neonatalen Alarmgrenzen: HF 100–190/min, SpO₂-Zielbereich ca. 90–94 %.</p>', enter: function (c) { c.reset(); } },
      { type: 'info', title: 'Alarm!', text: '<p>Der Monitor alarmiert: Die Herzfrequenz fällt, die Sättigung sinkt.</p>', enter: function (c) { c.animate({ hr: 74, spo2: 76 }, 5); c.alarmPulse('monitor', true); } },
      { type: 'find', device: 'monitor', title: 'Wo siehst du es?', prompt: 'Welches Gerät zeigt die Episode an?', explain: 'Der <b>Monitor</b> zeigt Bradykardie und Desaturation – typisch für eine Apnoe-Bradykardie-Episode bei Frühgeborenen.' },
      { type: 'quiz', title: 'Erste Maßnahme', question: 'Was ist die sinnvollste erste Reaktion?', options: [
        { t: 'Kind ansehen, sanft taktil stimulieren und den Sitz der CPAP-Prongs prüfen', correct: true, fb: 'Richtig. Häufig reicht Stimulation; verrutschte Prongs (Leckage) sind eine häufige technische Ursache.' },
        { t: 'Sofort die Alarmgrenzen für HF auf 60/min senken', correct: false, fb: 'Gefährlich – das verdeckt das Problem.' },
        { t: 'Die Phototherapie ausschalten', correct: false, fb: 'Die Phototherapie ist nicht die Ursache.' }
      ], after: function (c) { c.animate({ hr: 150, spo2: 92 }, 6); c.alarmPulse('monitor', false); } },
      { type: 'find', device: 'neo-ventilator', title: 'Atemunterstützung', prompt: 'Welches Gerät erzeugt den CPAP?', explain: 'Das <b>neonatale Beatmungsgerät</b> erzeugt einen kontinuierlichen positiven Atemwegsdruck und mischt O₂ präzise zu.' },
      { type: 'quiz', title: 'Sauerstoff – nicht zu viel!', question: 'Warum wird die SpO₂ bei Frühgeborenen nicht einfach auf 100 % „hochgefahren“?', options: [
        { t: 'Hyperoxie schädigt unreifes Gewebe – u. a. Risiko für Frühgeborenen-Retinopathie (ROP); deshalb gilt ein enger Zielbereich.', correct: true, fb: 'Richtig. Sowohl zu wenig als auch zu viel Sauerstoff schadet.' },
        { t: 'Weil das Pulsoximeter keine Werte über 95 % messen kann.', correct: false, fb: 'Pulsoximeter messen bis 100 %, oberhalb wird die Messung aber ungenauer.' },
        { t: 'Sauerstoff ist auf der Neo-ITS knapp.', correct: false, fb: 'Es geht um die Sicherheit des Kindes.' }
      ] },
      { type: 'find', device: 'incubator', title: 'Wärme', prompt: 'Welches Gerät schützt das Kind vor Wärme- und Flüssigkeitsverlust?', explain: 'Der <b>Inkubator</b> mit Haut- oder Luftservo-Regelung und Befeuchtung.' },
      { type: 'quiz', title: 'Verdunstung', question: 'Über welchen Mechanismus verlieren sehr unreife Frühgeborene in den ersten Lebenstagen besonders viel Wärme und Wasser?', options: [
        { t: 'Evaporation über die sehr dünne, durchlässige Haut – deshalb hohe Luftfeuchte im Inkubator', correct: true, fb: 'Richtig. Die Befeuchtung des Inkubators reduziert diese Verluste.' },
        { t: 'Konduktion über die Matratze', correct: false, fb: 'Spielt eine Rolle, ist aber durch die beheizte Liegefläche gering.' },
        { t: 'Über die Atemwege allein', correct: false, fb: 'Über die Haut ist der Verlust bei Unreife deutlich größer.' }
      ] },
      { type: 'find', device: 'syringe-pump', title: 'Mini-Raten', prompt: 'Koffeincitrat läuft mit 0,1 ml/h. Welches Gerät fördert so kleine Mengen?', explain: 'Die <b>Spritzenpumpen</b> – bei so kleinen Raten wirken sich mechanisches Spiel und Höhenunterschiede stark aus.' },
      { type: 'quiz', title: 'Siphon-Effekt', question: 'Beim Umlagern wird der Pumpenturm deutlich höher als der Inkubator gestellt, die Spritze ist nicht korrekt im Antrieb fixiert. Was droht?', options: [
        { t: 'Ein unkontrollierter Fluss (Siphon-Effekt) – im Extremfall Bolusgabe', correct: true, fb: 'Richtig. Spritzen müssen sicher fixiert sein und die Pumpen möglichst auf Patientenhöhe stehen.' },
        { t: 'Die Pumpe fördert dann gar nichts mehr.', correct: false, fb: 'Eher das Gegenteil – Flüssigkeit kann unkontrolliert nachlaufen.' },
        { t: 'Das Medikament wird wärmer.', correct: false, fb: 'Die Höhe ändert nicht die Temperatur.' }
      ] },
      { type: 'find', device: 'phototherapy', title: 'Gelbsucht', prompt: 'Welches Gerät behandelt die Hyperbilirubinämie?', explain: 'Die <b>Phototherapie</b> mit blauem Licht (um ca. 460 nm).' },
      { type: 'quiz', multi: true, title: 'Phototherapie sicher', question: 'Was gehört zur sicheren Phototherapie?', options: [
        { t: 'Augenschutz', correct: true }, { t: 'Temperatur- und Flüssigkeitsbilanzkontrolle', correct: true },
        { t: 'Bilirubinkontrolle im Blut statt nach Hautfarbe', correct: true }, { t: 'Rotes Licht für bessere Wirkung', correct: false }
      ], fb: 'Wirksam ist blaues Licht; rotes Licht wird vom Bilirubin kaum absorbiert.' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>In der Neonatologie wirkt jede Geräteeinstellung auf einen sehr kleinen, empfindlichen Organismus: enge Alarmgrenzen, präzise O₂-Dosierung, sorgfältiges Wärmemanagement und Infusionen im Mikroliterbereich.</p>' }
    ]
  });
})();
