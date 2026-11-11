/* =====================================================================
   Bereich: Herzkatheterlabor
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'angio-system', name: 'Angiographieanlage (Herzkatheter)', short: 'Angiographieanlage', category: 'Bildgebung',
    manufacturers: ['Siemens Healthineers', 'Philips', 'GE HealthCare', 'Canon Medical', 'Shimadzu'], mdr: 'IIb',
    standards: ['IEC 60601-2-43 (Röntgeneinrichtungen für interventionelle Verfahren)'],
    purpose: 'Darstellung der Herzkranzgefäße mit Kontrastmittel (Koronarangiographie) und Behandlung von Engstellen (PCI mit Ballon und Stent).',
    function: 'Ein deckenmontierter C-Bogen mit Röntgenröhre und Flachdetektor dreht sich um den Patienten, um die Gefäße aus verschiedenen Winkeln darzustellen. Durchleuchtung (Fluoroskopie) erfolgt gepulst mit niedriger Dosis zur Katheternavigation; Cine-Aufnahmen mit höherer Dosis dokumentieren die Kontrastmittelinjektionen. Die Anlage zeigt die Dosis (Dosisflächenprodukt, Referenzpunkt-Kerma) fortlaufend an.',
    components: [
      { name: 'Flachdetektor', desc: 'Möglichst nah am Patienten positionieren (weniger Dosis, schärferes Bild).' },
      { name: 'Röntgenröhre mit Kollimator', desc: 'Unter dem Tisch; Einblendung und Filter reduzieren die Dosis.' },
      { name: 'Patiententisch', desc: 'Schwimmende Tischplatte, röntgendurchlässig.' },
      { name: 'Strahlenschutzscheibe', desc: 'Deckenhängende Bleiglasscheibe und Tischunterkante (Bleilamellen) für das Personal.' },
      { name: 'Bedienmodul am Tisch', desc: 'Steuerung von C-Bogen, Tisch, Durchleuchtung.' }
    ],
    parts: [
      { name: 'Flachdetektor', x: 400, y: 120 },
      { name: 'Röntgenröhre mit Kollimator', x: 400, y: 418 },
      { name: 'Patiententisch', x: 520, y: 311 },
      { name: 'Strahlenschutzscheibe', x: 70, y: 120 }
    ],
    measurements: [
      { name: 'Dosisflächenprodukt', unit: 'cGy·cm²', normal: 'unter diagnostischem Referenzwert', desc: 'Dokumentationspflichtig.' },
      { name: 'Referenzpunkt-Kerma', unit: 'mGy', normal: '–', desc: 'Hinweis auf mögliche Hautdosis (Hautschäden ab mehreren Gy).' },
      { name: 'Durchleuchtungszeit', unit: 'min', normal: 'so kurz wie möglich', desc: '' },
      { name: 'Pulsrate', unit: 'Pulse/s', normal: '7,5–15', desc: 'Weniger Pulse = weniger Dosis.' }
    ],
    alarms: [
      { name: 'Dosisschwelle erreicht', prio: 'medium', cause: 'Kumulative Dosis über voreingestelltem Wert.', action: 'Dokumentieren, Projektion wechseln, Nachsorge der Haut planen.' },
      { name: 'Kollisionsschutz', prio: 'medium', cause: 'C-Bogen nähert sich Patient oder Tisch.', action: 'Bewegung stoppt automatisch.' }
    ],
    connections: [
      { to: 'contrast-injector', type: 'Daten', desc: 'Injektor und Anlage sind gekoppelt (Injektion und Aufnahme synchron).' },
      { to: 'hemo-system', type: 'Daten', desc: 'Hämodynamische Kurven und Bilder werden gemeinsam dokumentiert.' },
      { to: 'pacs-workstation', type: 'Daten', desc: 'Cine-Serien werden ins PACS übertragen.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Vitalparameter werden während der Intervention kontinuierlich überwacht.' }
    ],
    safety: [
      'Strahlenschutz für Personal: Schürze, Schilddrüsenschutz, Bleiglasscheibe, Unterkante, Dosimeter (ggf. Augenlinsendosimeter).',
      'Für Patienten: Pulsrate reduzieren, Einblenden, Detektor nah, Projektionen wechseln (Hautdosis verteilen).',
      'Fachkunde im Strahlenschutz für die Anwendung erforderlich (StrlSchG/StrlSchV).'
    ],
    sim: 'imaging'
  });

  R({
    id: 'hemo-system', name: 'Hämodynamik-Messplatz mit Großbildmonitor', short: 'Hämodynamik', category: 'Überwachung',
    manufacturers: ['Siemens Healthineers', 'Philips', 'GE HealthCare', 'Schwarzer Cardiotek', 'Mennen Medical'], mdr: 'IIb',
    standards: ['IEC 60601-2-34 (Invasive Blutdruckmessung)', 'IEC 60601-2-27 (EKG-Überwachung)'],
    purpose: 'Messung von Drücken direkt im Herzen und in den Gefäßen über den Katheter sowie Darstellung von Live-Bildern, Referenzbildern und Vitaldaten auf einem Großbildschirm.',
    function: 'Der Katheter ist flüssigkeitsgefüllt mit einem Druckwandler verbunden. So werden Aortendruck, linksventrikulärer Druck (z. B. LVEDP) oder Druckgradienten über Klappen gemessen. Spezielle Druckdrähte erlauben die FFR-Messung (fraktionelle Flussreserve) zur Bewertung einer Engstelle. Der Großbildmonitor bündelt Röntgenbild, EKG, Druckkurven und Dosisanzeige.',
    components: [
      { name: 'Großbildmonitor', desc: 'Frei konfigurierbare Bildflächen für Live-, Referenzbild und Kurven.' },
      { name: 'Druckwandler-Set', desc: 'Am Katheter, auf Herzhöhe genullt.' },
      { name: 'Aufzeichnungsrechner', desc: 'Protokoll, Messwerte, Berichte.' },
      { name: 'EKG-Modul', desc: '12-Kanal-EKG während der Untersuchung.' }
    ],
    measurements: [
      { name: 'Aortendruck', unit: 'mmHg', normal: '≈ 120/80', desc: 'Über den Führungskatheter.' },
      { name: 'LVEDP', unit: 'mmHg', normal: '< 12', desc: 'Linksventrikulärer enddiastolischer Druck.' },
      { name: 'FFR', unit: '–', normal: '> 0,80', desc: 'Verhältnis distaler Druck / Aortendruck unter maximaler Hyperämie; ≤ 0,80 spricht für eine relevante Stenose.' }
    ],
    alarms: [
      { name: 'Druck gedämpft (Ventrikularisierung)', prio: 'medium', cause: 'Katheterspitze verschließt das Koronarostium.', action: 'Katheter zurückziehen, Position korrigieren.' },
      { name: 'Nullabgleich fehlt', prio: 'low', cause: 'Wandler nicht genullt.', action: 'Nullabgleich auf Herzhöhe.' }
    ],
    connections: [
      { to: 'angio-system', type: 'Daten', desc: 'Bildintegration auf dem Großbildmonitor.' },
      { to: 'monitor', type: 'Daten', desc: 'Vitalparameter fließen in die Dokumentation.' },
      { to: 'iabp', type: 'Signal', desc: 'Druck- und EKG-Signale können zur IABP-Triggerung genutzt werden.' }
    ],
    safety: [
      'Druckwandler luftfrei füllen und auf Herzhöhe nullen.',
      'Bei gedämpfter Druckkurve keine Kontrastmittelinjektion (Gefahr der Koronardissektion).'
    ],
    sim: 'bloodpressure'
  });

  R({
    id: 'contrast-injector', name: 'Hochdruck-Kontrastmittelinjektor', short: 'KM-Injektor', category: 'Infusion',
    manufacturers: ['Bayer', 'Bracco', 'Guerbet', 'Ulrich Medical', 'Nemoto'], mdr: 'IIb',
    standards: ['IEC 60601-2-24'],
    purpose: 'Schnelle, exakt dosierte Injektion von Kontrastmittel (und Kochsalz) für CT, MRT und Angiographie.',
    function: 'Elektromotorisch angetriebene Kolben fördern Kontrastmittel und NaCl aus zwei Spritzen mit hohen Flussraten (z. B. 3–8 ml/s) bei Druckbegrenzung. Kontrastmittel ist viskos; es wird oft auf Körpertemperatur vorgewärmt. Der Injektor ist mit der Bildgebung gekoppelt, sodass Injektion und Aufnahme synchronisiert sind. Sensoren erkennen Luft in Spritze und Leitung.',
    components: [
      { name: 'Spritzen (KM und NaCl)', desc: 'Doppelkopf-System für Kontrastmittel und Kochsalznachspülung.' },
      { name: 'Antriebskopf', desc: 'Motoren mit Druck- und Flussregelung.' },
      { name: 'Bedieneinheit', desc: 'Protokolle mit Flussrate, Volumen, Druckgrenze, Verzögerung.' },
      { name: 'Luftdetektion', desc: 'Verhindert die Injektion von Luft.' },
      { name: 'Hochdruck-Leitung', desc: 'Druckfeste Verbindung zum Zugang/Katheter.' }
    ],
    parts: [
      { name: 'Spritzen (KM und NaCl)', x: 65, y: 45 },
      { name: 'Bedieneinheit', x: 40, y: 142 },
      { name: 'Antriebskopf', x: 65, y: 18 }
    ],
    measurements: [
      { name: 'Flussrate', unit: 'ml/s', normal: 'CT 3–6, Koronar ca. 3–5', desc: '' },
      { name: 'Volumen', unit: 'ml', normal: 'so wenig wie möglich', desc: 'Nierenschutz.' },
      { name: 'Druckgrenze', unit: 'psi / bar', normal: 'zugangsabhängig', desc: 'Schutz von Kanüle und Gefäß.' }
    ],
    alarms: [
      { name: 'Luft erkannt', prio: 'high', cause: 'Luft in Spritze oder Leitung.', action: 'Injektion gesperrt – entlüften.' },
      { name: 'Druckgrenze überschritten', prio: 'medium', cause: 'Zu kleine Kanüle, Knick, Paravasat.', action: 'Injektion stoppt; Zugang prüfen.' }
    ],
    connections: [
      { to: 'ct-scanner', type: 'Daten', desc: 'Kopplung für Bolustracking im CT.' },
      { to: 'angio-system', type: 'Daten', desc: 'Synchrone Injektion und Cine-Aufnahme.' },
      { to: 'infusion-pump', type: 'Klinisch', desc: 'Separater Zugang bevorzugt – nicht über laufende Medikamentenleitungen injizieren.' }
    ],
    safety: [
      'Luftfreiheit vor jeder Injektion kontrollieren (Luftembolie!).',
      'Zugang auf Durchgängigkeit testen; Paravasat erkennen und dokumentieren.',
      'Kontrastmittelallergie und Nierenfunktion vorher klären.'
    ]
  });

  R({
    id: 'iabp', name: 'Intraaortale Ballonpumpe (IABP)', short: 'IABP', category: 'Therapie',
    manufacturers: ['Getinge (Maquet/Datascope)', 'Teleflex (Arrow)', 'Insightra Medical', 'Tokai Medical', 'Zeon Medical'],
    standards: ['IEC 60601-1'],
    purpose: 'Mechanische Kreislaufunterstützung bei schwerer Herzschwäche – z. B. bei bestimmten Komplikationen nach Herzinfarkt (Indikation heute eng gestellt).',
    function: 'Ein Ballonkatheter in der absteigenden Aorta wird im Herzrhythmus mit Helium gefüllt und entleert (Gegenpulsation): Aufblasen in der Diastole (nach Aortenklappenschluss, dikrote Kerbe) erhöht den diastolischen Druck und damit die Koronarperfusion; schnelles Entleeren kurz vor der Systole senkt die Nachlast. Getriggert wird über das EKG (R-Zacke) oder die arterielle Druckkurve. Helium wird wegen seiner geringen Dichte (schnelles Füllen/Entleeren) verwendet.',
    components: [
      { name: 'Konsole mit Bildschirm', desc: 'EKG, arterielle Druckkurve mit Augmentation, Timing.' },
      { name: 'Heliumversorgung', desc: 'Gasflasche für die Ballonfüllung.' },
      { name: 'Ballonkatheter', desc: 'Liegt in der Aorta descendens unterhalb der linken A. subclavia.' },
      { name: 'Triggerauswahl', desc: 'EKG, Druck oder Schrittmacher; Verhältnis 1:1, 1:2, 1:3.' }
    ],
    parts: [
      { name: 'Konsole mit Bildschirm', x: 85, y: 55 },
      { name: 'Heliumversorgung', x: 54, y: 160 },
      { name: 'Triggerauswahl', x: 112, y: 150 }
    ],
    measurements: [
      { name: 'Augmentierter diastolischer Druck', unit: 'mmHg', normal: 'höher als der systolische Druck ohne Unterstützung', desc: '' },
      { name: 'Unterstützungsverhältnis', unit: '–', normal: '1:1 bis 1:3', desc: 'Jeder, jeder zweite … Herzschlag.' },
      { name: 'Heliumvorrat', unit: '%', normal: '–', desc: '' }
    ],
    alarms: [
      { name: 'Kein Trigger', prio: 'high', cause: 'EKG-Elektrode ab, Arrhythmie, Drucksignal fehlt.', action: 'Trigger-Quelle wechseln, Elektroden prüfen.' },
      { name: 'Heliumleck / Ballonruptur', prio: 'high', cause: 'Blut im Katheterschlauch, Gasverlust.', action: 'Pumpe sofort stoppen, Arzt informieren.' },
      { name: 'Timing-Fehler', prio: 'medium', cause: 'Zu frühe/zu späte Inflation oder Deflation.', action: 'Timing an der Druckkurve korrigieren.' }
    ],
    connections: [
      { to: 'monitor', type: 'Signal', desc: 'EKG- und Drucksignal (Slave-Ausgang des Monitors) als Trigger.' },
      { to: 'hemo-system', type: 'Signal', desc: 'Im Katheterlabor kann das Drucksignal des Messplatzes genutzt werden.' },
      { to: 'pendant', type: 'Strom', desc: 'Netz; interner Akku für Transporte.' }
    ],
    safety: [
      'Bei Defibrillation Hinweise des Herstellers zur Pumpe beachten.',
      'Durchblutung des Beins mit Kathetereinführung regelmäßig kontrollieren.',
      'Pumpe nicht längere Zeit stillstehen lassen (Thrombosegefahr am Ballon).'
    ]
  });

  R({
    id: 'cathlab-act', name: 'ACT-Messgerät (Gerinnungszeit, POCT)', short: 'ACT-Messung', category: 'Labor / POCT', visual: 'poc-device', visualOpts: { l1: 'ACT', l2: '268 s' },
    manufacturers: ['Werfen', 'Medtronic', 'Abbott', 'Roche', 'Helena Biosciences'], mdr: 'IVD (IVDR)',
    standards: ['Rili-BÄK (Qualitätssicherung POCT)'],
    purpose: 'Kontrolle der Gerinnungshemmung durch Heparin während der Intervention (Activated Clotting Time).',
    function: 'Vollblut wird mit einem Aktivator in einer Messkartusche gemischt; das Gerät erkennt optisch oder mechanisch den Zeitpunkt der Gerinnselbildung. Die Zeit in Sekunden spiegelt die Heparinwirkung wider.',
    components: [
      { name: 'Messkartusche', desc: 'Einweg mit Aktivator.' },
      { name: 'Messkammer / Detektor', desc: 'Erkennt die Gerinnung.' },
      { name: 'Display', desc: 'ACT in Sekunden.' }
    ],
    measurements: [
      { name: 'ACT', unit: 's', normal: 'ohne Heparin ca. 100–140; unter PCI-Heparinisierung zielbezogen höher (z. B. 250–300)', desc: 'Zielwerte nach Klinikstandard.' },
      { name: 'Messdauer', unit: 's', normal: 'bis Gerinnselbildung', desc: 'Ergebnis liegt in wenigen Minuten vor.' }
    ],
    alarms: [
      { name: 'Kartusche abgelaufen / QC fällig', prio: 'medium', cause: 'Qualitätskontrolle.', action: 'Neue Kartusche, QC durchführen.' },
      { name: 'Probenfehler', prio: 'low', cause: 'Zu wenig Blut, Luft.', action: 'Messung wiederholen.' }
    ],
    connections: [
      { to: 'syringe-pump', type: 'Klinisch', desc: 'Heparinbolus/-infusion wird anhand der ACT angepasst.' },
      { to: 'hemo-system', type: 'Daten', desc: 'Werte werden im Untersuchungsprotokoll dokumentiert.' }
    ],
    safety: ['Probe aus einer nicht mit Heparin gespülten Leitung entnehmen (Verfälschung!).', 'Qualitätssicherung nach Rili-BÄK.']
  });

  MT.registerArea({
    id: 'cathlab', name: 'Herzkatheterlabor', short: 'HKL', icon: '❤️', color: '#b7791f',
    sign: 'HKL · Messplatz 1', signSub: 'Kontrollbereich · Lernumgebung',
    description: 'Im Herzkatheterlabor werden verengte Herzkranzgefäße dargestellt und aufgedehnt. Röntgen, Kontrastmittel, Druckmessung und Notfalltechnik müssen perfekt zusammenspielen – rund um die Uhr für Herzinfarkt-Patienten.',
    patientInfo: 'Lernpatient „P-08“ (fiktiv) · 61 J. · ST-Hebungsinfarkt der Vorderwand · aus der Notaufnahme übernommen',
    room: { wall: '#f5f0e6', wall2: '#e8dfcc', floor: '#c9c6bd', floor2: '#b2ada1', horizon: 650 },
    decor: [{ visual: 'cart', x: 190, y: 640, w: 140 }],
    placements: [
      { device: 'monitor', visual: 'monitor', x: 40, y: 92, w: 210, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'hemo-system', visual: 'display-wall', x: 1120, y: 150, w: 320 },
      { device: 'angio-system', visual: 'angio', x: 250, y: 34, w: 880, labelY: 170, labelX: 760 },
      { device: 'contrast-injector', visual: 'injector', x: 1170, y: 470, w: 108 },
      { device: 'iabp', visual: 'iabp', x: 1310, y: 430, w: 150 },
      { device: 'defibrillator', visual: 'defibrillator', x: 30, y: 500, w: 140 },
      { device: 'cathlab-act', visual: 'poc-device', x: 205, y: 560, w: 110, opts: { l1: 'ACT', l2: '268 s' } }
    ],
    hosesBehind: [
      '<g transform="translate(1500,330)"><path d="M0 -26 L 23 14 L -23 14 Z" fill="#ffd400" stroke="#222" stroke-width="2"/><circle r="4" fill="#222"/><text x="-40" y="34" font-size="10" font-family="system-ui" fill="#333">Kontrollbereich</text></g>'
    ],
    hosesFront: [
      '<path d="M1200 520 C 1150 560, 1080 560, 1040 552" stroke="rgba(150,190,225,.95)" stroke-width="3" fill="none"/>',
      '<path d="M1330 560 C 1250 600, 1100 600, 1000 560" stroke="#7a7f88" stroke-width="3" fill="none"/>',
      '<path d="M170 600 C 260 600, 300 570, 360 555" stroke="#2a3038" stroke-width="2.5" fill="none"/>'
    ],
    scenarios: ['cathlab-pci'],
    learningGoals: [
      'Aufbau der Angiographieanlage und Strahlenschutz für Personal und Patient erklären',
      'Rolle von Kontrastmittelinjektor, Hämodynamik-Messplatz und ACT-Messung verstehen',
      'Prinzip der Gegenpulsation (IABP) beschreiben',
      'Notfallbereitschaft (Kammerflimmern bei Reperfusion) sicherstellen'
    ],
    facts: [
      'Beim STEMI zählt jede Minute bis zur Wiedereröffnung des Gefäßes („time is muscle“).',
      'Die meiste Streustrahlung entsteht dort, wo die Strahlung in den Patienten eintritt – auf der Röhrenseite.',
      'Helium wird in der IABP genutzt, weil es sehr leicht ist und der Ballon sich dadurch schnell füllen und entleeren lässt.'
    ],
    createState: function () {
      return { patient: MT.physio.createPatient({ hr: 92, rhythm: 'stemi', spo2: 95, sys: 118, dia: 72, rr: 18, etco2: 34, nibpSys: 120, nibpDia: 74 }), vent: null };
    }
  });

  MT.registerScenario({
    id: 'cathlab-pci', area: 'cathlab', title: 'STEMI: Akut-PCI im Herzkatheterlabor', level: 'Fortgeschritten', duration: '9 min',
    summary: 'Ein Patient mit Vorderwandinfarkt wird interventionell behandelt. Strahlenschutz, Kontrastmittel, Gerinnung – und ein Notfall bei der Reperfusion.',
    steps: [
      { type: 'info', title: 'Übernahme', text: '<p>Lernpatient „P-08“ (fiktiv) kommt aus der Notaufnahme. Das 12-Kanal-EKG zeigt eine Vorderwand-ST-Hebung. Das Team legt Bleischürzen an.</p>', enter: function (c) { c.reset(); } },
      { type: 'find', device: 'angio-system', title: 'Bildgebung', prompt: 'Mit welcher Anlage werden die Herzkranzgefäße dargestellt?', explain: 'Die <b>Angiographieanlage</b>: C-Bogen mit Flachdetektor, Durchleuchtung und Cine-Aufnahmen.' },
      { type: 'quiz', multi: true, title: 'Strahlenschutz Personal', question: 'Welche Maßnahmen schützen das Team?', options: [
        { t: 'Bleischürze und Schilddrüsenschutz', correct: true }, { t: 'Deckenhängende Bleiglasscheibe und Unterkante am Tisch', correct: true },
        { t: 'Personendosimeter tragen', correct: true }, { t: 'Detektor möglichst weit vom Patienten entfernt', correct: false }
      ], fb: 'Der Detektor gehört möglichst NAH an den Patienten – das senkt Dosis und Streustrahlung.' },
      { type: 'find', device: 'cathlab-act', title: 'Gerinnung', prompt: 'Der Patient erhält Heparin. Womit wird die Wirkung während der Intervention kontrolliert?', explain: 'Das <b>ACT-Messgerät</b> bestimmt die aktivierte Gerinnungszeit direkt im Labor.' },
      { type: 'find', device: 'contrast-injector', title: 'Kontrastmittel', prompt: 'Welches Gerät gibt das Kontrastmittel synchron zur Aufnahme?', explain: 'Der <b>Kontrastmittelinjektor</b> – mit Luftdetektion und Druckbegrenzung.' },
      { type: 'quiz', title: 'Druckkurve', question: 'Beim Sondieren der Koronararterie wird die Druckkurve am Hämodynamik-Messplatz plötzlich gedämpft. Was bedeutet das?', options: [
        { t: 'Die Katheterspitze verlegt möglicherweise das Gefäßostium – vor einer Injektion muss die Position korrigiert werden.', correct: true, fb: 'Richtig. Eine Injektion in dieser Lage könnte das Gefäß schädigen oder die Durchblutung unterbrechen.' },
        { t: 'Der Blutdruck des Patienten ist normalisiert.', correct: false, fb: 'Eine gedämpfte Kurve ist ein Warnsignal, keine Entwarnung.' },
        { t: 'Das Kontrastmittel ist zu warm.', correct: false, fb: 'Die Temperatur des Kontrastmittels hat keinen Einfluss auf die Druckkurve.' }
      ] },
      { type: 'info', title: 'Reperfusion', text: '<p>Der Verschluss wird mit dem Ballon eröffnet. Kurz darauf: Alarm am Monitor!</p>', enter: function (c) { c.set({ rhythm: 'vf', hr: 0 }); c.alarmPulse('monitor', true); } },
      { type: 'find', device: 'defibrillator', title: 'Kammerflimmern', prompt: 'Reperfusionsarrhythmie – welches Gerät wird sofort eingesetzt?', explain: 'Der <b>Defibrillator</b> – im Herzkatheterlabor sind die Klebeelektroden oft bereits vor Beginn angelegt (röntgendurchlässige Pads).', after: function (c) { c.set({ rhythm: 'sinus', hr: 96 }); c.alarmPulse('monitor', false); c.animate({ sys: 92, dia: 58 }, 4); } },
      { type: 'quiz', title: 'Kreislaufunterstützung', question: 'Nach dem Schock ist der Rhythmus stabil, der Blutdruck aber niedrig. Wie wirkt eine intraaortale Ballonpumpe?', options: [
        { t: 'Ballon füllt sich in der Diastole (mehr Koronardurchblutung) und entleert sich vor der Systole (weniger Nachlast).', correct: true, fb: 'Richtig – das Prinzip der Gegenpulsation. Die Indikation wird heute aber eng gestellt.' },
        { t: 'Der Ballon pumpt Blut aktiv in die Lunge.', correct: false, fb: 'Die IABP liegt in der Aorta und unterstützt den großen Kreislauf.' },
        { t: 'Der Ballon füllt sich in der Systole, um den Blutdruck zu erhöhen.', correct: false, fb: 'Gerade umgekehrt: Füllen in der Systole würde die Nachlast erhöhen.' }
      ] },
      { type: 'find', device: 'iabp', title: 'Gerät', prompt: 'Wo steht die Ballonpumpe?', explain: 'Die <b>IABP-Konsole</b> wird über EKG oder arteriellen Druck getriggert.' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Im HKL arbeiten Bildgebung, Injektor, Druckmessung, Gerinnungsmessung und Notfalltechnik eng zusammen. Strahlenschutz betrifft Patient UND Team. Nach der Intervention wird der Patient auf die <a href="#/area/icu">Intensivstation</a> verlegt.</p>' }
    ]
  });
})();
