/* =====================================================================
   Bereich: Radiologie (Röntgen, CT, MRT, Befundung)
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'xray-system', name: 'Röntgenarbeitsplatz (Projektionsradiographie)', short: 'Röntgen', category: 'Bildgebung',
    manufacturers: ['Siemens Healthineers', 'Philips', 'GE HealthCare', 'Canon Medical', 'Agfa HealthCare'], mdr: 'IIb',
    standards: ['IEC 60601-2-54 (Radiographie und Durchleuchtung)', 'IEC 60601-1-3 (Strahlenschutz in diagnostischen Röntgeneinrichtungen)'],
    purpose: 'Zweidimensionale Röntgenaufnahmen, z. B. Thorax, Skelett, Abdomen.',
    function: 'In der Röntgenröhre werden Elektronen von der Kathode zur Anode beschleunigt (Röhrenspannung kV); beim Abbremsen entsteht Röntgenstrahlung. Die Strahlung wird im Körper unterschiedlich geschwächt (I = I₀·e^(−μx)): Knochen stark, Lunge kaum. Ein digitaler Flachdetektor misst das Restsignal. Ein Streustrahlenraster verbessert den Kontrast, die Belichtungsautomatik schaltet bei ausreichender Dosis ab. kV bestimmt Härte und Kontrast, mAs die Photonenmenge (Rauschen, Dosis).',
    components: [
      { name: 'Röntgenröhre mit Blende', desc: 'Am Deckenstativ; Tiefenblende begrenzt das Strahlenfeld (Lichtvisier).' },
      { name: 'Hochspannungsgenerator', desc: 'Liefert Röhrenspannung (40–150 kV) und -strom.' },
      { name: 'Rasterwandstativ mit Detektor', desc: 'Für Aufnahmen im Stehen (z. B. Thorax p.a.).' },
      { name: 'Belichtungsautomatik', desc: 'Messkammern beenden die Aufnahme bei Erreichen der Zieldosis am Detektor.' },
      { name: 'Bedienkonsole', desc: 'Hinter Strahlenschutzwand; Organprogramme, Auslösung.' }
    ],
    parts: [
      { name: 'Röntgenröhre mit Blende', x: 100, y: 215 },
      { name: 'Rasterwandstativ mit Detektor', x: 345, y: 320 },
      { name: 'Hochspannungsgenerator', x: 100, y: 265 }
    ],
    measurements: [
      { name: 'Röhrenspannung', unit: 'kV', normal: 'Thorax ca. 110–125 (Hartstrahltechnik)', desc: '' },
      { name: 'Strom-Zeit-Produkt', unit: 'mAs', normal: 'organabhängig', desc: '' },
      { name: 'Dosisflächenprodukt', unit: 'cGy·cm²', normal: 'unter diagnostischem Referenzwert', desc: 'Wird dokumentiert.' },
      { name: 'Expositionsindex', unit: '–', normal: 'Zielbereich', desc: 'Zeigt Über-/Unterbelichtung des Detektors.' }
    ],
    alarms: [
      { name: 'Röhre überlastet / Abkühlung', prio: 'medium', cause: 'Hohe Aufnahmefolge.', action: 'Wartezeit einhalten.' },
      { name: 'Detektor nicht bereit', prio: 'low', cause: 'Akku/WLAN des mobilen Detektors.', action: 'Detektor laden/verbinden.' }
    ],
    connections: [
      { to: 'pacs-workstation', type: 'Daten', desc: 'Bilder gehen als DICOM ins PACS zur Befundung.' },
      { to: 'stretcher', type: 'Strahlung', desc: 'Liegendaufnahmen durch die röntgendurchlässige Liege.' },
      { to: 'ct-scanner', type: 'Klinisch', desc: 'Bei unklarem Befund folgt oft eine Schnittbildgebung (CT).' }
    ],
    safety: [
      'Rechtfertigende Indikation durch fachkundige Ärztin/fachkundigen Arzt (StrlSchG).',
      'Einblenden auf das Untersuchungsfeld; Gonaden- und Schilddrüsenschutz nach aktueller Empfehlung.',
      'Schwangerschaft vor der Untersuchung erfragen.',
      'Kontrollbereich nur mit Berechtigung; Personal hinter Schutzwand.'
    ],
    sim: 'imaging'
  });

  R({
    id: 'ct-scanner', name: 'Computertomograph (CT)', short: 'CT', category: 'Bildgebung',
    manufacturers: ['Siemens Healthineers', 'GE HealthCare', 'Philips', 'Canon Medical', 'United Imaging'], mdr: 'IIb',
    standards: ['IEC 60601-2-44 (Röntgeneinrichtungen für Computertomographie)'],
    purpose: 'Überlagerungsfreie Schnittbilder des Körpers in Sekunden – z. B. Schlaganfall, Polytrauma, Lungenembolie, Tumorsuche.',
    function: 'Röntgenröhre und gegenüberliegender Detektorbogen rotieren in der Gantry (eine Umdrehung in ca. 0,25–0,5 s), während der Tisch durch die Öffnung fährt (Spiral-CT). Aus Tausenden Schwächungsprofilen berechnet der Rechner Schnittbilder (Rekonstruktion). Jedes Voxel erhält einen Hounsfield-Wert (Luft −1000, Wasser 0, Knochen > +1000). Jodhaltiges Kontrastmittel macht Gefäße und durchblutete Organe sichtbar.',
    components: [
      { name: 'Gantry mit Röhre und Detektor', desc: 'Rotierendes System in der ringförmigen Öffnung.' },
      { name: 'Patiententisch', desc: 'Bewegt den Patienten präzise durch die Gantry.' },
      { name: 'Rekonstruktionsrechner', desc: 'Berechnet die Schnittbilder (gefilterte Rückprojektion/iterativ/KI-gestützt).' },
      { name: 'Bedienkonsole', desc: 'Protokolle, Dosisanzeige, Start.' }
    ],
    parts: [
      { name: 'Gantry mit Röhre und Detektor', x: 165, y: 170 },
      { name: 'Patiententisch', x: 400, y: 238 }
    ],
    measurements: [
      { name: 'CTDIvol', unit: 'mGy', normal: 'protokollabhängig, unter Referenzwert', desc: 'Dosisindex pro Schicht.' },
      { name: 'DLP', unit: 'mGy·cm', normal: '–', desc: 'Dosislängenprodukt = CTDIvol × Scanlänge.' },
      { name: 'Hounsfield-Einheiten', unit: 'HU', normal: 'Wasser 0, Luft −1000', desc: '' },
      { name: 'Schichtdicke', unit: 'mm', normal: '0,5–5', desc: '' }
    ],
    alarms: [
      { name: 'Dosisbenachrichtigung / -alarm', prio: 'medium', cause: 'Geplante Dosis über festgelegtem Wert (Dose Notification/Alert).', action: 'Protokoll prüfen, Begründung dokumentieren.' },
      { name: 'Tischkollision', prio: 'medium', cause: 'Lagerungshilfen oder Leitungen stoßen an die Gantry.', action: 'Stopp, Lagerung korrigieren.' }
    ],
    connections: [
      { to: 'contrast-injector', type: 'Daten', desc: 'Der Injektor ist mit dem CT gekoppelt: Kontrastmittelgabe und Scanstart werden synchronisiert (Bolustracking).' },
      { to: 'pacs-workstation', type: 'Daten', desc: 'Schnittbilder und Dosisbericht gehen ins PACS.' },
      { to: 'er-transport-ventilator', type: 'Klinisch', desc: 'Beatmete Patienten werden mit Transportbeatmung im CT untersucht.' }
    ],
    safety: [
      'Rechtfertigende Indikation; Protokolle an Körpergröße und Fragestellung anpassen (Dosisoptimierung).',
      'Vor Kontrastmittel: Nierenfunktion, Allergieanamnese, Schilddrüsenfunktion (Jod) beachten.',
      'Leitungen und Schläuche so führen, dass sie bei der Tischbewegung nicht abreißen.',
      'Kontrollbereich: Personal während des Scans außerhalb des Raums.'
    ],
    sim: 'imaging'
  });

  R({
    id: 'mri-scanner', name: 'Magnetresonanztomograph (MRT)', short: 'MRT', category: 'Bildgebung',
    manufacturers: ['Siemens Healthineers', 'GE HealthCare', 'Philips', 'Canon Medical', 'United Imaging'], mdr: 'IIb',
    standards: ['IEC 60601-2-33 (MR-Geräte)'],
    purpose: 'Schnittbilder mit exzellentem Weichteilkontrast ohne ionisierende Strahlung – z. B. Gehirn, Rückenmark, Gelenke, Herz.',
    function: 'Ein supraleitender Magnet (mit flüssigem Helium auf ca. −269 °C gekühlt) erzeugt ein starkes, dauerhaftes Magnetfeld (z. B. 1,5 oder 3 T). Hochfrequenzpulse regen Wasserstoffkerne an; deren Signal wird von Empfangsspulen gemessen. Gradientenspulen kodieren den Ort (laut klopfend). Unterschiede in Protonendichte, T1 und T2 erzeugen den Bildkontrast.',
    components: [
      { name: 'Supraleitender Magnet', desc: 'Feld ist IMMER eingeschaltet.' },
      { name: 'Gradientenspulen', desc: 'Ortskodierung; verursachen Lärm (Gehörschutz!).' },
      { name: 'Hochfrequenzspulen', desc: 'Senden und empfangen; Oberflächenspulen am Patienten.' },
      { name: 'Patiententisch', desc: 'MR-tauglich, fährt in die Röhre.' },
      { name: 'Faraday-Käfig', desc: 'Abschirmung des Raums gegen äußere HF-Störungen.' },
      { name: 'Quench-Taster', desc: 'Notabschaltung des Magnetfelds (Helium entweicht über Abgasrohr).' }
    ],
    parts: [
      { name: 'Supraleitender Magnet', x: 190, y: 100 },
      { name: 'Patiententisch', x: 470, y: 247 }
    ],
    measurements: [
      { name: 'Feldstärke', unit: 'T', normal: '1,5 / 3', desc: 'Erdmagnetfeld ≈ 0,00005 T.' },
      { name: 'SAR', unit: 'W/kg', normal: 'unter Grenzwert', desc: 'Spezifische Absorptionsrate – HF-Erwärmung.' },
      { name: 'TR / TE', unit: 'ms', normal: 'sequenzabhängig', desc: 'Bestimmen T1-/T2-Wichtung.' }
    ],
    alarms: [
      { name: 'Heliumfüllstand niedrig', prio: 'medium', cause: 'Kühlungsproblem.', action: 'Service informieren.' },
      { name: 'SAR-Grenze erreicht', prio: 'medium', cause: 'Sequenz zu energiereich für das Patientengewicht.', action: 'Parameter anpassen.' },
      { name: 'Patientenrufball ausgelöst', prio: 'high', cause: 'Patient meldet sich (Angst, Wärme, Schmerz).', action: 'Messung stoppen, Patient ansprechen.' }
    ],
    connections: [
      { to: 'pacs-workstation', type: 'Daten', desc: 'Bilder ins PACS.' },
      { to: 'contrast-injector', type: 'Fluid', desc: 'MR-taugliche Injektoren geben gadoliniumhaltiges Kontrastmittel.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Nur MR-taugliche („MR Conditional“) Monitore und Pumpen dürfen in den Untersuchungsraum.' }
    ],
    safety: [
      'Das Magnetfeld ist immer an: Ferromagnetische Gegenstände (Stahl-O₂-Flaschen, Scheren, Stethoskope, Betten) werden zu Geschossen!',
      'Zugangskontrolle mit Zonen; Sicherheitsfragebogen zu Implantaten, Schrittmachern, Metallsplittern.',
      'Implantate nur gemäß Kennzeichnung „MR safe“ / „MR conditional“ (Bedingungen beachten).',
      'Gehörschutz für Patient und Personal; HF-Verbrennungen durch Leiterschleifen vermeiden.',
      'Quench nur im Notfall (Person eingeklemmt durch ferromagnetischen Gegenstand) – dann sofortige Raumevakuierung.'
    ],
    sim: 'imaging'
  });

  R({
    id: 'pacs-workstation', name: 'Befundungsarbeitsplatz / PACS', short: 'PACS-Befundung', category: 'IT & Vernetzung',
    manufacturers: ['Sectra', 'Agfa HealthCare', 'Philips', 'GE HealthCare', 'Siemens Healthineers'], mdr: 'IIa',
    standards: ['DICOM (Bildformat und Kommunikation)', 'DIN 6868-157 (Abnahme- und Konstanzprüfung von Bildwiedergabesystemen)'],
    purpose: 'Speicherung, Verteilung und Befundung aller medizinischen Bilder (Picture Archiving and Communication System).',
    function: 'Modalitäten (Röntgen, CT, MRT, Ultraschall, C-Bogen) senden Bilder im DICOM-Format an das PACS-Archiv. Befundmonitore mit kalibrierter Graustufenkennlinie (DICOM GSDF) zeigen die Bilder; die Radiologie befundet und das RIS (Radiologieinformationssystem) übergibt den Befund an das Krankenhausinformationssystem.',
    components: [
      { name: 'Befundmonitore', desc: 'Hochauflösend, kalibriert, mit regelmäßiger Konstanzprüfung.' },
      { name: 'PACS-Server & Archiv', desc: 'Langzeitarchivierung (Aufbewahrungsfristen).' },
      { name: 'RIS-Anbindung', desc: 'Auftrag, Terminplanung, Befundschreibung.' },
      { name: 'Bedienpult', desc: 'Tastatur, Diktat, Fensterung, Messwerkzeuge.' }
    ],
    measurements: [
      { name: 'Leuchtdichte', unit: 'cd/m²', normal: 'nach DIN 6868-157', desc: 'Regelmäßig geprüft.' },
      { name: 'Dosisbericht', unit: 'mGy / mGy·cm', normal: '–', desc: 'Aus DICOM-Dosisberichten.' }
    ],
    alarms: [
      { name: 'Verbindung zum Archiv gestört', prio: 'medium', cause: 'Netzwerk/Server.', action: 'IT informieren; Bilder lokal zwischengespeichert.' },
      { name: 'Konstanzprüfung fällig', prio: 'low', cause: 'Prüfintervall abgelaufen.', action: 'Prüfung durchführen.' }
    ],
    connections: [
      { to: 'ct-scanner', type: 'Daten', desc: 'Empfängt CT-Serien.' },
      { to: 'mri-scanner', type: 'Daten', desc: 'Empfängt MRT-Serien.' },
      { to: 'xray-system', type: 'Daten', desc: 'Empfängt Röntgenaufnahmen.' },
      { to: 'central-station', type: 'Daten', desc: 'Befunde und Bilder stehen über KIS/PDMS auf Station zur Verfügung.' }
    ],
    safety: [
      'Datenschutz: Zugriff nur für Berechtigte, Protokollierung.',
      'Befundung nur an geprüften Befundmonitoren.',
      'Korrekte Patientenzuordnung (zwei Identifikatoren) – Verwechslung ist ein schwerer Fehler.'
    ]
  });

  MT.registerArea({
    id: 'radiology', name: 'Radiologie', short: 'Radiologie', icon: '🩻', color: '#7b5cd6',
    sign: 'Radiologie · Ebene 1', signSub: 'Kontrollbereiche · Lernumgebung',
    description: 'Drei Untersuchungsräume im Überblick: Projektionsröntgen, Computertomographie mit Kontrastmittelinjektor und Magnetresonanztomographie. Alle Bilder laufen im PACS zur Befundung zusammen.',
    patientInfo: 'Lernpatientin „P-33“ (fiktiv) · 74 J. · Verdacht auf Lungenembolie · CT-Angiographie geplant · zusätzlich Kniegelenk-MRT angemeldet',
    room: { wall: '#f1eef8', wall2: '#e2dcf0', floor: '#cdd0de', floor2: '#b4b8cc', horizon: 650 },
    decor: [],
    placements: [
      { device: 'xray-system', visual: 'xray', x: 50, y: 214, w: 360, labelY: 205 },
      { device: 'pacs-workstation', visual: 'console', x: 120, y: 690, w: 230 },
      { device: 'contrast-injector', visual: 'injector', x: 540, y: 420, w: 92 },
      { device: 'ct-scanner', visual: 'ct', x: 620, y: 400, w: 430 },
      { device: 'mri-scanner', visual: 'mri', x: 1085, y: 390, w: 500 }
    ],
    hosesBehind: [
      '<rect x="514" y="38" width="16" height="640" fill="#cfc8e2"/><rect x="1066" y="38" width="16" height="640" fill="#cfc8e2"/>',
      '<path d="M514 678 L460 900 M1082 678 L1150 900" stroke="#b8b0d0" stroke-width="10"/>',
      '<g font-family="system-ui" font-weight="700"><rect x="40" y="56" width="170" height="34" rx="8" fill="#fff" stroke="#cfc8e2"/><text x="56" y="79" font-size="16" fill="#4b3a8c">Raum 1 · Röntgen</text>' +
      '<rect x="560" y="56" width="140" height="34" rx="8" fill="#fff" stroke="#cfc8e2"/><text x="576" y="79" font-size="16" fill="#4b3a8c">Raum 2 · CT</text>' +
      '<rect x="1110" y="140" width="200" height="34" rx="8" fill="#fff" stroke="#cfc8e2"/><text x="1126" y="163" font-size="16" fill="#4b3a8c">Raum 3 · MRT 1,5 T</text></g>',
      // Strahlenwarnzeichen
      '<g transform="translate(450,110)"><path d="M0 -26 L 23 14 L -23 14 Z" fill="#ffd400" stroke="#222" stroke-width="2"/><circle r="4" fill="#222"/><text x="-30" y="34" font-size="10" font-family="system-ui" fill="#333">Kontrollbereich</text></g>',
      '<g transform="translate(990,110)"><path d="M0 -26 L 23 14 L -23 14 Z" fill="#ffd400" stroke="#222" stroke-width="2"/><circle r="4" fill="#222"/><text x="-30" y="34" font-size="10" font-family="system-ui" fill="#333">Kontrollbereich</text></g>',
      // MR-Zone
      '<path d="M1100 900 L1130 700 L1585 700 L1600 900 Z" fill="rgba(214,40,57,.07)" stroke="#d62839" stroke-width="3" stroke-dasharray="12 8"/>',
      '<text x="1150" y="884" font-size="14" font-family="system-ui" font-weight="700" fill="#a51d2b">MR-Zone IV · Magnetfeld immer aktiv</text>',
      '<g transform="translate(1440,210)"><rect x="-34" y="-30" width="68" height="60" rx="6" fill="#fff" stroke="#d62839" stroke-width="3"/><text x="0" y="-6" text-anchor="middle" font-size="14" font-weight="800" fill="#d62839" font-family="system-ui">MR</text><text x="0" y="16" text-anchor="middle" font-size="10" fill="#333" font-family="system-ui">unsafe ⛔</text></g>'
    ],
    hosesFront: [
      '<path d="M600 470 C 640 520, 700 600, 760 610" stroke="rgba(150,190,225,.95)" stroke-width="3" fill="none"/>',
      '<path d="M350 760 C 450 760, 500 720, 560 680" stroke="#5a35a8" stroke-width="2" fill="none" stroke-dasharray="5 4"/>'
    ],
    scenarios: ['radiology-ct', 'radiology-mri'],
    learningGoals: [
      'Bildgebungsprinzipien von Röntgen, CT und MRT unterscheiden',
      'Hounsfield-Skala und Fensterung verstehen',
      'Geräteverbund CT – Kontrastmittelinjektor – PACS erklären',
      'Strahlenschutz (StrlSchG) und MR-Sicherheit anwenden'
    ],
    facts: [
      'Ein 3-Tesla-MRT erzeugt ein Magnetfeld, das rund 60 000-mal stärker ist als das Erdmagnetfeld.',
      'DICOM ist der weltweite Standard für den Austausch medizinischer Bilder.',
      'Eine Thorax-Röntgenaufnahme entspricht etwa der natürlichen Strahlenexposition weniger Tage.',
      'Das Magnetfeld eines supraleitenden MRT bleibt auch nachts und bei Stromausfall bestehen.'
    ]
  });

  MT.registerScenario({
    id: 'radiology-ct', area: 'radiology', title: 'CT-Angiographie mit Kontrastmittel', level: 'Einstieg', duration: '7 min',
    summary: 'Eine Lungenembolie soll ausgeschlossen werden. Verfolge den Weg von der Anmeldung bis zum Bild im PACS.',
    steps: [
      { type: 'info', title: 'Anmeldung', text: '<p>Für Lernpatientin „P-33“ (fiktiv) ist eine CT-Angiographie der Lungengefäße angemeldet. Die rechtfertigende Indikation hat die Radiologin bereits gestellt.</p>' },
      { type: 'find', device: 'ct-scanner', title: 'Modalität', prompt: 'Mit welchem Gerät wird die Untersuchung durchgeführt?', explain: 'Der <b>Computertomograph</b> erstellt in wenigen Sekunden Schnittbilder des ganzen Thorax.' },
      { type: 'find', device: 'contrast-injector', title: 'Kontrastmittel', prompt: 'Die Lungengefäße sollen kontrastreich dargestellt werden. Welches Gerät gibt das Kontrastmittel?', explain: 'Der <b>Hochdruck-Kontrastmittelinjektor</b> injiziert z. B. 4–5 ml/s über eine Venenverweilkanüle, gefolgt von einem Kochsalzbolus.' },
      { type: 'quiz', multi: true, title: 'Vor der Injektion', question: 'Was ist vor der Gabe jodhaltigen Kontrastmittels zu prüfen?', options: [
        { t: 'Nierenfunktion (z. B. eGFR)', correct: true }, { t: 'Allergie / frühere Kontrastmittelreaktion', correct: true },
        { t: 'Schilddrüsenfunktion (Jodbelastung)', correct: true }, { t: 'Sitz und Durchgängigkeit der Venenkanüle (Paravasat-Gefahr)', correct: true },
        { t: 'Ob der Patient einen Herzschrittmacher hat', correct: false }
      ], fb: 'Der Schrittmacher ist für das CT in der Regel unproblematisch – für die MRT dagegen sehr wichtig.' },
      { type: 'quiz', title: 'Verbund', question: 'Wie wird erreicht, dass der Scan genau dann startet, wenn das Kontrastmittel in den Lungenarterien ankommt?', options: [
        { t: 'Bolustracking: Das CT misst die HU-Werte in einem Gefäß und startet den Scan bei Erreichen eines Schwellenwerts; Injektor und CT sind gekoppelt.', correct: true, fb: 'Richtig – ein Beispiel für Geräteverbund mit Datenkommunikation.' },
        { t: 'Die MTRA startet nach Gefühl.', correct: false, fb: 'Zu ungenau – zu früh oder zu spät bedeutet schlechte Kontrastierung.' },
        { t: 'Das PACS gibt das Startsignal.', correct: false, fb: 'Das PACS archiviert nur.' }
      ] },
      { type: 'quiz', title: 'Hounsfield', question: 'Ein Gefäß ist nach Kontrastmittelgabe hell. Welcher HU-Wert passt am ehesten zu kontrastiertem Blut?', options: [
        { t: 'ca. +250 bis +400 HU', correct: true, fb: 'Richtig. Unkontrastiertes Blut liegt bei ca. +40 HU, Luft bei −1000, Knochen > +700 HU.' },
        { t: 'ca. −800 HU', correct: false, fb: 'Das wäre lufthaltiges Lungengewebe.' },
        { t: 'ca. 0 HU', correct: false, fb: '0 HU entspricht Wasser.' }
      ] },
      { type: 'find', device: 'pacs-workstation', title: 'Befundung', prompt: 'Wo wird das Bild befundet und archiviert?', explain: 'Am <b>PACS-Befundungsarbeitsplatz</b>. Probiere die Fensterung im <a href="#/lab/imaging">Simulationslabor</a> aus!' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>CT, Injektor und PACS bilden eine Prozesskette: Indikation → Kontrastmittel → synchronisierter Scan → Rekonstruktion → DICOM → Befund. Strahlenschutz und Kontrastmittelsicherheit begleiten jeden Schritt.</p>' }
    ]
  });

  MT.registerScenario({
    id: 'radiology-mri', area: 'radiology', title: 'MRT-Sicherheit: Ein Magnet, der nie schläft', level: 'Einstieg', duration: '6 min',
    summary: 'Ein Patient von der Normalstation kommt zur MRT – mit Infusion, Sauerstoff und einem Implantat.',
    steps: [
      { type: 'info', title: 'Ankunft', text: '<p>Ein Patient (fiktiv) kommt im Bett zur Knie-MRT. Er erhält Sauerstoff aus einer Stahlflasche am Bett und eine Infusion über eine Pumpe. In der Anamnese: „Herzschrittmacher seit 2019“.</p>' },
      { type: 'find', device: 'mri-scanner', title: 'Gerät', prompt: 'Wo findet die Untersuchung statt?', explain: 'Im <b>MRT</b> – das Magnetfeld des supraleitenden Magneten ist permanent aktiv.' },
      { type: 'quiz', title: 'Die Sauerstoffflasche', question: 'Darf die Stahl-O₂-Flasche mit in den Untersuchungsraum?', options: [
        { t: 'Nein – ferromagnetische Gegenstände werden vom Magneten angezogen und zu gefährlichen Geschossen.', correct: true, fb: 'Richtig. Es gibt dokumentierte schwere Unfälle. Nur MR-taugliche (z. B. Aluminium-)Flaschen und Geräte verwenden.' },
        { t: 'Ja, wenn das Gerät gerade nicht misst.', correct: false, fb: 'Falsch – das Magnetfeld ist immer an, auch ohne Messung.' },
        { t: 'Ja, wenn sie gut am Bett befestigt ist.', correct: false, fb: 'Auch das Bett selbst ist meist ferromagnetisch und darf nicht hinein.' }
      ] },
      { type: 'quiz', title: 'Der Schrittmacher', question: 'Wie wird mit dem Herzschrittmacher umgegangen?', options: [
        { t: 'Prüfen, ob das gesamte System als „MR conditional“ zugelassen ist; dann nur unter den Herstellerbedingungen mit Programmierung und Überwachung untersuchen.', correct: true, fb: 'Richtig. Ältere, nicht zugelassene Systeme sind meist eine Kontraindikation.' },
        { t: 'Kein Problem – Schrittmacher sind heute immer MR-sicher.', correct: false, fb: 'Nicht jedes System ist zugelassen; die Bedingungen müssen geprüft werden.' },
        { t: 'Schrittmacher während der Untersuchung herausnehmen.', correct: false, fb: 'Das ist nicht möglich.' }
      ] },
      { type: 'quiz', title: 'Infusion', question: 'Die Infusionspumpe soll weiterlaufen. Was gilt?', options: [
        { t: 'Nur MR-taugliche Pumpen dürfen in den Raum, oder die Leitung wird mit einem Verlängerungssystem durch einen Wanddurchlass von außen betrieben.', correct: true, fb: 'Richtig. Normale Pumpen können ausfallen oder angezogen werden und stören die Bildgebung.' },
        { t: 'Die Pumpe wird einfach auf den MRT-Tisch gelegt.', correct: false, fb: 'Gefährlich – Projektilgefahr und Gerätestörung.' },
        { t: 'Infusionen sind im MRT grundsätzlich verboten.', correct: false, fb: 'Mit geeigneten Geräten ist die Fortführung möglich.' }
      ] },
      { type: 'quiz', title: 'Notfall', question: 'Der Patient wird im MRT reanimationspflichtig. Wie wird reagiert?', options: [
        { t: 'Patient sofort aus dem Raum in einen sicheren Bereich bringen und dort mit normalem Defibrillator und Equipment versorgen.', correct: true, fb: 'Richtig – das Reanimationsteam mit ferromagnetischer Ausrüstung darf nicht in den Magnetraum.' },
        { t: 'Den Notfallwagen schnell an den Magneten fahren.', correct: false, fb: 'Der Notfallwagen ist ferromagnetisch – lebensgefährlich!' },
        { t: 'Sofort quenchen.', correct: false, fb: 'Ein Quench dauert und ist nur nötig, wenn z. B. jemand durch einen angezogenen Gegenstand eingeklemmt ist.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p>MRT-Sicherheit ist Gerätesicherheit: Zonenkonzept, Screening, MR-Kennzeichnung (MR safe / MR conditional / MR unsafe) und speziell geschultes Personal.</p>' }
    ]
  });
})();
