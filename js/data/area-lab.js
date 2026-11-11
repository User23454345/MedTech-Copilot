/* =====================================================================
   Bereich: Zentrallabor
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'tube-station', name: 'Rohrpoststation', short: 'Rohrpost', category: 'Infrastruktur',
    manufacturers: ['Swisslog Healthcare', 'Aerocom', 'Sumetzberger', 'Hörtig', 'Pevco'],
    purpose: 'Schneller Transport von Proben (Blut, Urin), Medikamenten und Dokumenten zwischen Stationen und Labor.',
    function: 'Ein Gebläse erzeugt Über- oder Unterdruck in einem Rohrnetz; Weichen leiten Transportbüchsen zur Zielstation. Für Laborproben werden stoßgedämpfte Büchsen verwendet; zu starke Beschleunigung kann Proben hämolysieren.',
    components: [
      { name: 'Sende-/Empfangsstation', desc: 'Mit Zielauswahl.' },
      { name: 'Transportbüchse', desc: 'Dichte Büchse mit Probeneinsatz.' },
      { name: 'Rohrnetz und Weichen', desc: 'Verbindet die Stationen des Hauses.' },
      { name: 'Steuerung', desc: 'Routing, Priorität, Protokoll.' }
    ],
    measurements: [
      { name: 'Transportzeit', unit: 's', normal: 'meist < 3 min', desc: '' },
      { name: 'Geschwindigkeit', unit: 'm/s', normal: 'ca. 3–8', desc: 'Langsamfahrt für empfindliche Proben.' }
    ],
    alarms: [
      { name: 'Büchse nicht angekommen', prio: 'medium', cause: 'Fehlrouting, Störung.', action: 'Leitstelle informieren, ggf. neue Probe.' },
      { name: 'Station voll', prio: 'low', cause: 'Empfangskorb belegt.', action: 'Büchsen entnehmen.' }
    ],
    connections: [
      { to: 'centrifuge', type: 'Klinisch', desc: 'Proben gehen nach Eingang zur Zentrifugation.' },
      { to: 'lab-lis', type: 'Daten', desc: 'Probeneingang wird per Barcode im LIS erfasst.' }
    ],
    safety: ['Proben auslaufsicher verpacken (Infektionsschutz).', 'Hämolyse-empfindliche Proben nach Hausstandard ggf. manuell transportieren.']
  });

  R({
    id: 'centrifuge', name: 'Laborzentrifuge', short: 'Zentrifuge', category: 'Labor',
    manufacturers: ['Eppendorf', 'Thermo Fisher Scientific', 'Hettich', 'Beckman Coulter', 'Sigma Laborzentrifugen'], mdr: 'IVD (Zubehör)',
    standards: ['IEC 61010-2-020 (Laborzentrifugen)'],
    purpose: 'Trennt Blut in Plasma/Serum und Zellbestandteile, bevor die Probe analysiert wird.',
    function: 'Ein Rotor dreht die Probenröhrchen mit hoher Drehzahl. Die relative Zentrifugalbeschleunigung (RZB, Vielfaches der Erdbeschleunigung g) hängt vom Radius und vom Quadrat der Drehzahl ab: RZB = 1,118 · 10⁻⁵ · r[cm] · n²[U/min]. Schwere Bestandteile (Zellen) setzen sich unten ab, Plasma/Serum oben. Ein Trenngel im Röhrchen bildet eine Barriere.',
    components: [
      { name: 'Rotor', desc: 'Ausschwing- oder Winkelrotor.' },
      { name: 'Deckel mit Verriegelung', desc: 'Öffnet erst bei Stillstand.' },
      { name: 'Unwuchterkennung', desc: 'Stoppt bei falscher Beladung.' },
      { name: 'Bedienfeld', desc: 'Drehzahl bzw. RZB, Zeit, Temperatur.' }
    ],
    parts: [
      { name: 'Deckel mit Verriegelung', x: 90, y: 40 },
      { name: 'Bedienfeld', x: 61, y: 91 },
      { name: 'Rotor', x: 90, y: 48 }
    ],
    measurements: [
      { name: 'RZB', unit: '× g', normal: 'z. B. 2000–3000 g', desc: 'Nach Vorgabe des Röhrchenherstellers.' },
      { name: 'Zeit', unit: 'min', normal: 'z. B. 10', desc: '' },
      { name: 'Temperatur', unit: '°C', normal: 'ggf. gekühlt', desc: '' }
    ],
    alarms: [
      { name: 'Unwucht', prio: 'medium', cause: 'Ungleich beladen.', action: 'Gegenüberliegende Plätze gleich schwer beladen.' },
      { name: 'Deckel offen', prio: 'low', cause: 'Nicht verriegelt.', action: 'Deckel schließen.' }
    ],
    connections: [
      { to: 'chem-analyzer', type: 'Klinisch', desc: 'Zentrifugiertes Serum/Plasma wird analysiert.' },
      { to: 'lab-coag-analyzer', type: 'Klinisch', desc: 'Gerinnungsproben benötigen plättchenarmes Plasma.' },
      { to: 'tube-station', type: 'Klinisch', desc: 'Proben kommen per Rohrpost.' }
    ],
    safety: ['Rotor immer symmetrisch beladen.', 'Bei Röhrchenbruch: Deckel geschlossen lassen (Aerosole), Infektionsschutz.']
  });

  R({
    id: 'chem-analyzer', name: 'Analysator für Klinische Chemie', short: 'Klinische Chemie', category: 'Labor', visualOpts: { title: 'Klin. Chemie' },
    manufacturers: ['Roche Diagnostics', 'Siemens Healthineers', 'Abbott', 'Beckman Coulter', 'Ortho Clinical Diagnostics (QuidelOrtho)'], mdr: 'IVD (IVDR)',
    standards: ['Rili-BÄK (Qualitätssicherung)', 'DIN EN ISO 15189 (Medizinische Laboratorien)'],
    purpose: 'Vollautomatische Bestimmung von Substraten, Enzymen, Elektrolyten, Medikamentenspiegeln und Proteinen, z. B. Kreatinin, Leberwerte, Natrium, Kalium, CRP, Troponin.',
    function: 'Probe und Reagenz werden in einer Küvette gemischt; die Farbreaktion wird photometrisch gemessen (Lambert-Beer: Extinktion E = ε · c · d, also proportional zur Konzentration). Elektrolyte werden mit ionenselektiven Elektroden gemessen, Proteine wie Troponin mit Immunoassays (z. B. Chemilumineszenz). Barcodes ordnen jede Probe eindeutig zu. Hunderte bis tausende Tests pro Stunde sind möglich.',
    components: [
      { name: 'Probenzuführung mit Barcodeleser', desc: 'Identifiziert Röhrchen und Aufträge.' },
      { name: 'Reagenzienkarussell (gekühlt)', desc: 'Testspezifische Reagenzien.' },
      { name: 'Reaktionsküvetten & Photometer', desc: 'Messen Lichtabsorption.' },
      { name: 'ISE-Modul', desc: 'Ionenselektive Elektroden für Na⁺, K⁺, Cl⁻.' },
      { name: 'Steuerrechner', desc: 'Kalibrierung, Qualitätskontrolle, LIS-Schnittstelle.' }
    ],
    parts: [
      { name: 'Probenzuführung mit Barcodeleser', x: 145, y: 158 },
      { name: 'Steuerrechner', x: 338, y: 110 },
      { name: 'Reagenzienkarussell (gekühlt)', x: 100, y: 30 }
    ],
    measurements: [
      { name: 'Kalium', unit: 'mmol/l', normal: '3,5–5,0', desc: 'Hämolyse erhöht den Wert falsch!' },
      { name: 'Kreatinin', unit: 'mg/dl', normal: 'ca. 0,6–1,2', desc: 'Nierenfunktion.' },
      { name: 'CRP', unit: 'mg/l', normal: '< 5', desc: 'Entzündungsmarker.' },
      { name: 'Hochsensitives Troponin', unit: 'ng/l', normal: 'unter dem 99. Perzentil (testabhängig)', desc: 'Herzmuskelschaden.' }
    ],
    alarms: [
      { name: 'Qualitätskontrolle außerhalb', prio: 'high', cause: 'Kontrollwert verletzt Grenzen (Rili-BÄK).', action: 'Test gesperrt, Fehlersuche, Wiederholung.' },
      { name: 'Hämolyse-/Lipämie-Index hoch', prio: 'medium', cause: 'Probe gestört.', action: 'Befund kommentieren oder neue Probe anfordern.' },
      { name: 'Reagenz leer', prio: 'low', cause: 'Verbraucht.', action: 'Nachladen.' }
    ],
    connections: [
      { to: 'centrifuge', type: 'Klinisch', desc: 'Benötigt zentrifugiertes Serum/Plasma.' },
      { to: 'lab-lis', type: 'Daten', desc: 'Empfängt Aufträge und sendet Ergebnisse.' },
      { to: 'hematology-analyzer', type: 'Klinisch', desc: 'Gemeinsame Befundinterpretation (z. B. Kalium bei Thrombozytose).' }
    ],
    safety: ['Interne und externe Qualitätssicherung nach Rili-BÄK.', 'Persönliche Schutzausrüstung beim Umgang mit Proben (Infektionsgefahr).']
  });

  R({
    id: 'hematology-analyzer', name: 'Hämatologie-Analysator (Blutbild)', short: 'Hämatologie', category: 'Labor', visualOpts: { title: 'Hämatologie' },
    manufacturers: ['Sysmex', 'Siemens Healthineers', 'Beckman Coulter', 'Abbott', 'Mindray'], mdr: 'IVD (IVDR)',
    standards: ['Rili-BÄK', 'DIN EN ISO 15189'],
    purpose: 'Erstellt das Blutbild: Erythrozyten, Hämoglobin, Leukozyten mit Differenzierung, Thrombozyten.',
    function: 'Im Impedanzverfahren (Coulter-Prinzip) passieren Zellen einzeln eine kleine Öffnung, durch die Strom fließt; jede Zelle verändert kurz den Widerstand – Anzahl der Impulse = Zellzahl, Impulshöhe = Zellvolumen. Die Durchflusszytometrie mit Laser und Fluoreszenzfarbstoffen unterscheidet Leukozytenarten. Hämoglobin wird photometrisch bestimmt. Auffällige Proben werden für die Mikroskopie markiert.',
    components: [
      { name: 'Probenansaugung', desc: 'EDTA-Vollblut.' },
      { name: 'Impedanzkanal', desc: 'Zählt und vermisst Zellen.' },
      { name: 'Durchflusszytometer', desc: 'Laserbasierte Differenzierung.' },
      { name: 'Hb-Photometer', desc: 'Hämoglobinbestimmung.' }
    ],
    measurements: [
      { name: 'Hämoglobin', unit: 'g/dl', normal: '♀ 12–16, ♂ 13,5–17,5', desc: '' },
      { name: 'Leukozyten', unit: '/nl', normal: '4–10', desc: '' },
      { name: 'Thrombozyten', unit: '/nl', normal: '150–400', desc: '' }
    ],
    alarms: [
      { name: 'Gerinnsel in Probe', prio: 'medium', cause: 'Probe nicht ausreichend gemischt.', action: 'Neue Probe.' },
      { name: 'Auffälliges Streudiagramm', prio: 'low', cause: 'Blasten, Thrombozytenaggregate.', action: 'Mikroskopisches Differentialblutbild.' }
    ],
    connections: [
      { to: 'microscope', type: 'Klinisch', desc: 'Auffällige Befunde werden mikroskopisch nachdifferenziert.' },
      { to: 'lab-lis', type: 'Daten', desc: 'Ergebnisse ins LIS.' }
    ],
    safety: ['EDTA-Röhrchen ausreichend füllen und schwenken.', 'Kritische Werte (z. B. Hb sehr niedrig) sofort telefonisch melden.']
  });

  R({
    id: 'microscope', name: 'Labormikroskop', short: 'Mikroskop', category: 'Labor',
    manufacturers: ['ZEISS', 'Leica Microsystems', 'Olympus (Evident)', 'Nikon', 'Motic'], mdr: 'IVD (IVDR)',
    purpose: 'Mikroskopische Beurteilung von Blutausstrichen, Urinsediment und Präparaten.',
    function: 'Objektiv und Okular vergrößern das Präparat (z. B. 1000-fach mit Ölimmersion). Die Auflösung ist durch die Wellenlänge des Lichts und die numerische Apertur begrenzt (≈ 0,2 µm). Digitale Systeme erfassen Zellen automatisch und schlagen eine Klassifikation vor.',
    components: [
      { name: 'Okular', desc: 'Zusätzliche Vergrößerung, meist 10×.' },
      { name: 'Objektivrevolver', desc: 'Objektive 10×–100×.' },
      { name: 'Objekttisch', desc: 'Kreuztisch für Präparate.' },
      { name: 'Beleuchtung', desc: 'LED mit Kondensor.' }
    ],
    parts: [{ name: 'Okular', x: 57, y: 35 }, { name: 'Objekttisch', x: 65, y: 125 }, { name: 'Beleuchtung', x: 60, y: 150 }],
    measurements: [
      { name: 'Gesamtvergrößerung', unit: '×', normal: '100–1000', desc: 'Objektiv × Okular.' },
      { name: 'Differentialblutbild', unit: '%', normal: 'z. B. Neutrophile 50–70', desc: '' }
    ],
    alarms: [
      { name: 'Lampe defekt', prio: 'low', cause: 'LED-Ausfall.', action: 'Tauschen.' },
      { name: 'Digitalsystem: Klassifikation unsicher', prio: 'low', cause: 'Seltene Zellform.', action: 'Manuelle Beurteilung.' }
    ],
    connections: [
      { to: 'hematology-analyzer', type: 'Klinisch', desc: 'Nachdifferenzierung markierter Proben.' },
      { to: 'lab-lis', type: 'Daten', desc: 'Befund ins LIS.' }
    ],
    safety: ['Infektionsschutz beim Herstellen von Ausstrichen.', 'Immersionsöl nach Gebrauch entfernen.']
  });

  R({
    id: 'blood-fridge', name: 'Blutdepot-Kühlschrank', short: 'Blutdepot', category: 'Labor',
    manufacturers: ['Helmer Scientific', 'Liebherr', 'Kirsch Medical', 'Dometic (B Medical Systems)', 'Thermo Fisher Scientific'], mdr: 'IIa',
    standards: ['Richtlinie Hämotherapie (Bundesärztekammer)', 'DIN 58371 (Blutkühlschränke)'],
    purpose: 'Temperaturgeführte Lagerung von Blutkomponenten, z. B. Erythrozytenkonzentraten bei +2 bis +6 °C.',
    function: 'Ein Kühlschrank mit Umluftkühlung sorgt für gleichmäßige Temperatur in allen Fächern. Eine unabhängige, kontinuierliche Temperaturaufzeichnung mit Alarm meldet Abweichungen, auch an eine ständig besetzte Stelle. Bei Abweichung wird geprüft, ob die Präparate noch verwendbar sind.',
    components: [
      { name: 'Kühlaggregat mit Umluft', desc: 'Gleichmäßige Temperaturverteilung.' },
      { name: 'Temperaturanzeige & Schreiber', desc: 'Kontinuierliche Dokumentation.' },
      { name: 'Alarmeinheit', desc: 'Optisch, akustisch, Fernalarm.' },
      { name: 'Glastür mit Schloss', desc: 'Sichtkontrolle, Zugangskontrolle.' }
    ],
    parts: [{ name: 'Temperaturanzeige & Schreiber', x: 57, y: 25 }, { name: 'Glastür mit Schloss', x: 80, y: 180 }],
    measurements: [
      { name: 'Innentemperatur', unit: '°C', normal: '+2 bis +6 (Erythrozytenkonzentrate)', desc: '' },
      { name: 'Türöffnungsdauer', unit: 's', normal: 'kurz', desc: '' }
    ],
    alarms: [
      { name: 'Temperatur zu hoch/zu niedrig', prio: 'high', cause: 'Tür offen, Kühlung defekt, Stromausfall.', action: 'Ursache beheben, Präparate in Ersatzgerät, Verwendbarkeit prüfen und dokumentieren.' },
      { name: 'Tür offen', prio: 'medium', cause: 'Nicht geschlossen.', action: 'Schließen.' }
    ],
    connections: [
      { to: 'lab-lis', type: 'Daten', desc: 'Temperaturdaten und Präparateverwaltung.' },
      { to: 'pendant', type: 'Strom', desc: 'Anschluss an die Sicherheitsstromversorgung.' }
    ],
    safety: ['Kühlkette lückenlos dokumentieren.', 'Fehltemperierte Präparate nicht verwenden, bis die Freigabe geklärt ist.']
  });

  R({
    id: 'lab-coag-analyzer', name: 'Gerinnungsanalysator', short: 'Gerinnung', category: 'Labor', visual: 'poc-device', visualOpts: { l1: 'Quick 92 %', l2: 'aPTT 31 s' },
    manufacturers: ['Siemens Healthineers', 'Werfen', 'Stago', 'Sysmex', 'Roche Diagnostics'], mdr: 'IVD (IVDR)',
    standards: ['Rili-BÄK'],
    purpose: 'Bestimmung von Gerinnungstests wie Quick/INR, aPTT, Fibrinogen, D-Dimere.',
    function: 'Citratplasma wird mit Reagenzien gemischt, die die Gerinnung starten; das Gerät erkennt die Gerinnselbildung optisch (Trübung) oder mechanisch und gibt die Zeit an. Andere Parameter werden immunologisch oder chromogen bestimmt.',
    components: [
      { name: 'Messküvetten', desc: 'Temperiert auf 37 °C.' },
      { name: 'Optischer Detektor', desc: 'Erkennt die Gerinnselbildung.' },
      { name: 'Reagenzienfach', desc: 'Gekühlt.' }
    ],
    measurements: [
      { name: 'Quick / INR', unit: '% / –', normal: '70–120 % / ca. 1,0', desc: 'INR zur Steuerung oraler Antikoagulation.' },
      { name: 'aPTT', unit: 's', normal: 'ca. 25–38 (reagenzabhängig)', desc: 'Heparinwirkung.' }
    ],
    alarms: [
      { name: 'Füllmenge Citratröhrchen falsch', prio: 'medium', cause: 'Mischungsverhältnis Blut:Citrat 9:1 nicht eingehalten.', action: 'Neue Probe.' },
      { name: 'QK außerhalb', prio: 'high', cause: 'Kontrolle verletzt Grenzen.', action: 'Test sperren, Ursache suchen.' }
    ],
    connections: [
      { to: 'centrifuge', type: 'Klinisch', desc: 'Benötigt plättchenarmes Plasma.' },
      { to: 'lab-lis', type: 'Daten', desc: 'Ergebnisse ins LIS.' }
    ],
    safety: ['Citratröhrchen exakt füllen.', 'Zeitnah analysieren.']
  });

  R({
    id: 'lab-lis', name: 'Laborinformationssystem (LIS)', short: 'LIS', category: 'IT & Vernetzung', visual: 'workstation', visualOpts: { left: ['Auftrag 4711', 'Probe: eingeg.', 'K+ 6,4 !'], right: ['Validation', 'TnT 48 ng/l', 'Befund > ZNA'] },
    manufacturers: ['CompuGroup Medical', 'Dedalus', 'Siemens Healthineers', 'Roche Diagnostics', 'Orchard Software'],
    standards: ['HL7 / LOINC', 'DIN EN ISO 15189'],
    purpose: 'Verwaltet Aufträge, Proben, Messergebnisse, Plausibilitätsprüfungen und Befunde des Labors.',
    function: 'Aufträge aus dem Krankenhausinformationssystem werden als Barcode-Etiketten gedruckt. Die Geräte fragen das LIS, welche Tests für eine Probe nötig sind, und senden Ergebnisse zurück. Regeln prüfen Plausibilität und Verlauf (Delta-Check), kritische Werte werden hervorgehoben; nach der technischen und medizinischen Validation geht der Befund an die Station.',
    components: [
      { name: 'Auftrags- und Probenverwaltung', desc: 'Barcode-gestützt.' },
      { name: 'Geräteschnittstellen', desc: 'Bidirektionale Kommunikation mit Analysatoren.' },
      { name: 'Validationsregeln', desc: 'Plausibilität, Delta-Check, kritische Werte.' },
      { name: 'Befundübermittlung', desc: 'An KIS und Stationen.' }
    ],
    measurements: [
      { name: 'Turn-around-Time', unit: 'min', normal: 'Notfall typ. < 60', desc: 'Zeit von Probeneingang bis Befund.' },
      { name: 'Kritische Werte', unit: 'Anzahl', normal: '–', desc: 'Müssen aktiv gemeldet werden.' }
    ],
    alarms: [
      { name: 'Kritischer Wert', prio: 'high', cause: 'Lebensbedrohlicher Befund, z. B. Kalium > 6,5 mmol/l.', action: 'Sofort telefonisch an Behandelnde melden und dokumentieren.' },
      { name: 'Schnittstelle gestört', prio: 'medium', cause: 'Gerät/Netzwerk.', action: 'IT informieren, Notfallprozess.' }
    ],
    connections: [
      { to: 'chem-analyzer', type: 'Daten', desc: 'Aufträge und Ergebnisse.' },
      { to: 'hematology-analyzer', type: 'Daten', desc: 'Aufträge und Ergebnisse.' },
      { to: 'central-station', type: 'Daten', desc: 'Befunde erscheinen auf Station und im PDMS.' }
    ],
    safety: ['Eindeutige Probenidentifikation über Barcodes.', 'Datenschutz und Zugriffskonzept.']
  });

  MT.registerArea({
    id: 'lab', name: 'Labor', short: 'Labor', icon: '🧪', color: '#c0398b',
    sign: 'Zentrallabor · Notfallstrecke', signSub: 'Lernumgebung · fiktive Proben',
    description: 'Die Notfallstrecke des Zentrallabors: Hier kommen Proben per Rohrpost an, werden zentrifugiert, automatisiert analysiert und über das Laborinformationssystem befundet – rund um die Uhr.',
    patientInfo: 'Probe von Lernpatient „P-08“ (fiktiv, Notaufnahme) · Auftrag: Troponin, Kalium, Kreatinin, Blutbild, Gerinnung',
    room: { wall: '#f8eef4', wall2: '#efdbe7', floor: '#cfcfd6', floor2: '#b8b8c2', horizon: 640 },
    decor: [{ visual: 'counter', x: 40, y: 462, w: 520 }, { visual: 'counter', x: 580, y: 462, w: 520 }],
    placements: [
      { device: 'chem-analyzer', visual: 'analyzer', x: 60, y: 260, w: 360, opts: { title: 'Klin. Chemie' } },
      { device: 'microscope', visual: 'microscope', x: 430, y: 354, w: 100 },
      { device: 'hematology-analyzer', visual: 'analyzer', x: 595, y: 317, w: 270, opts: { title: 'Hämatologie' } },
      { device: 'centrifuge', visual: 'centrifuge', x: 870, y: 398, w: 120 },
      { device: 'lab-coag-analyzer', visual: 'poc-device', x: 995, y: 411, w: 100, opts: { l1: 'Quick 92 %', l2: 'aPTT 31 s' } },
      { device: 'tube-station', visual: 'tube-station', x: 1130, y: 290, w: 90 },
      { device: 'blood-fridge', visual: 'fridge', x: 1240, y: 320, w: 150 },
      { device: 'lab-lis', visual: 'workstation', x: 1400, y: 560, w: 190, opts: { left: ['Auftrag 4711', 'Probe: eingeg.', 'K+ 6,4 !', 'Hämolyse H3'], right: ['Validation', 'TnT 48 ng/l', 'Krea 1,1', 'Befund > ZNA'] } }
    ],
    hosesBehind: [
      '<path d="M1175 0 V 290" stroke="#9aa5b1" stroke-width="22"/><path d="M1175 0 V 290" stroke="#c9d1d9" stroke-width="10"/>'
    ],
    hosesFront: [],
    scenarios: ['lab-sample', 'lab-coldchain'],
    learningGoals: [
      'Den Weg einer Probe von der Station bis zum Befund beschreiben',
      'Präanalytische Fehler (z. B. Hämolyse) und ihre Folgen erkennen',
      'Messprinzipien (Photometrie, Impedanz, Gerinnungszeit) erklären',
      'Qualitätssicherung (Rili-BÄK) und kritische Werte einordnen'
    ],
    facts: [
      'Ein großer Teil der Laborfehler entsteht nicht im Gerät, sondern in der Präanalytik – also vor der Messung.',
      'Ein Citratröhrchen muss exakt gefüllt sein: Blut und Citrat im Verhältnis 9:1.',
      'Hämolyse setzt Kalium aus den Erythrozyten frei – der gemessene Wert ist dann falsch hoch.'
    ]
  });

  MT.registerScenario({
    id: 'lab-sample', area: 'lab', title: 'Der Weg einer Blutprobe', level: 'Einstieg', duration: '8 min',
    summary: 'Verfolge eine Notfallprobe vom Eingang bis zum Befund – inklusive eines präanalytischen Fehlers.',
    steps: [
      { type: 'info', title: 'Auftrag', text: '<p>Aus der Notaufnahme kommt eine Notfallprobe von „P-08“ (fiktiv): Troponin, Kalium, Kreatinin, Blutbild, Gerinnung.</p>' },
      { type: 'find', device: 'tube-station', title: 'Eingang', prompt: 'Wie kommt die Probe ins Labor?', explain: 'Per <b>Rohrpost</b>. Beim Eingang wird der Barcode gescannt.' },
      { type: 'find', device: 'centrifuge', title: 'Vorbereitung', prompt: 'Serum und Plasma müssen von den Zellen getrennt werden. Welches Gerät?', explain: 'Die <b>Zentrifuge</b> trennt die Bestandteile nach ihrer Dichte.' },
      { type: 'quiz', title: 'g statt U/min', question: 'Wie viel g (RZB) erzeugt eine Zentrifuge mit 10 cm Radius bei 3000 U/min? (RZB = 1,118 · 10⁻⁵ · r · n²)', options: [
        { t: 'ca. 1000 g', correct: true, fb: 'Richtig: 1,118 · 10⁻⁵ · 10 · 3000² ≈ 1006 g. Deshalb gibt man g an – die Drehzahl allein ist ohne Radius nicht vergleichbar.' },
        { t: 'ca. 3000 g', correct: false, fb: 'Nachrechnen: 1,118 · 10⁻⁵ · 10 · 9 000 000 ≈ 1006.' },
        { t: 'ca. 100 g', correct: false, fb: 'Zu niedrig – n geht quadratisch ein.' }
      ] },
      { type: 'find', device: 'chem-analyzer', title: 'Analyse', prompt: 'Wo werden Troponin, Kalium und Kreatinin gemessen?', explain: 'Im <b>Analysator für Klinische Chemie</b> (Photometrie, ISE, Immunoassay).' },
      { type: 'quiz', title: 'Photometrie', question: 'Nach welchem Prinzip wird bei vielen klinisch-chemischen Tests die Konzentration bestimmt?', options: [
        { t: 'Lambert-Beer: Die Lichtabsorption (Extinktion) ist proportional zur Konzentration.', correct: true, fb: 'Richtig: E = ε · c · d.' },
        { t: 'Nach dem Gewicht der Probe', correct: false, fb: 'Gewogen wird nicht.' },
        { t: 'Durch Zählen der Moleküle unter dem Mikroskop', correct: false, fb: 'Moleküle sind dafür viel zu klein.' }
      ] },
      { type: 'info', title: 'Auffälligkeit', text: '<p>Das Gerät meldet einen hohen <b>Hämolyse-Index</b>. Kalium: 6,4 mmol/l. Die Probe wurde mit einer dünnen Kanüle unter starkem Sog entnommen und per Rohrpost geschickt.</p>', enter: function (c) { c.alarmPulse('chem-analyzer', true); } },
      { type: 'quiz', title: 'Präanalytik', question: 'Wie ist der Kaliumwert zu bewerten?', options: [
        { t: 'Wahrscheinlich falsch hoch durch Hämolyse – Befund kommentieren und eine neue, schonend entnommene Probe anfordern.', correct: true, fb: 'Richtig. Zerstörte Erythrozyten setzen Kalium frei. Gleichzeitig muss eine echte Hyperkaliämie klinisch (EKG!) ausgeschlossen werden.' },
        { t: 'Ein sicherer Messwert – sofort Kalium senken.', correct: false, fb: 'Ohne Prüfung der Probenqualität riskiert man eine unnötige oder gefährliche Therapie.' },
        { t: 'Das Gerät ist defekt.', correct: false, fb: 'Der Hämolyse-Index zeigt ein Probenproblem, keinen Gerätefehler.' }
      ], after: function (c) { c.alarmPulse('chem-analyzer', false); } },
      { type: 'find', device: 'hematology-analyzer', title: 'Blutbild', prompt: 'Wo wird das Blutbild bestimmt?', explain: 'Im <b>Hämatologie-Analysator</b> (Impedanz, Durchflusszytometrie).' },
      { type: 'quiz', title: 'Coulter-Prinzip', question: 'Wie zählt das Impedanzverfahren Zellen?', options: [
        { t: 'Jede Zelle verändert beim Durchtritt durch eine kleine Öffnung kurz den elektrischen Widerstand – Zahl der Impulse = Zellzahl, Höhe = Zellgröße.', correct: true, fb: 'Richtig – das Coulter-Prinzip.' },
        { t: 'Die Zellen werden fotografiert und gezählt.', correct: false, fb: 'Das machen digitale Mikroskopiesysteme – nicht das Impedanzverfahren.' },
        { t: 'Über das Gewicht des Röhrchens.', correct: false, fb: 'Nein.' }
      ] },
      { type: 'find', device: 'lab-lis', title: 'Befund', prompt: 'Wo werden die Ergebnisse validiert und an die Notaufnahme geschickt?', explain: 'Im <b>Laborinformationssystem</b>: technische und medizinische Validation, Delta-Check, Meldung kritischer Werte.' },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Präanalytik → Zentrifugation → Analyse → Validation → Befund. Gerätefehler sind selten; viel häufiger stören Entnahme- und Transportfehler. Das LIS hält die Kette digital zusammen.</p>' }
    ]
  });

  MT.registerScenario({
    id: 'lab-coldchain', area: 'lab', title: 'Kühlkette im Blutdepot', level: 'Einstieg', duration: '4 min',
    summary: 'Ein Temperaturalarm im Blutdepot – was ist zu tun?',
    steps: [
      { type: 'info', title: 'Nachtdienst', text: '<p>Um 02:40 Uhr alarmiert der Blutdepot-Kühlschrank: <b>Temperatur 8,1 °C</b>.</p>', enter: function (c) { c.alarmPulse('blood-fridge', true); } },
      { type: 'find', device: 'blood-fridge', title: 'Gerät', prompt: 'Welches Gerät alarmiert?', explain: 'Der <b>Blutdepot-Kühlschrank</b> mit unabhängiger Temperaturüberwachung.' },
      { type: 'quiz', title: 'Sollbereich', question: 'In welchem Temperaturbereich werden Erythrozytenkonzentrate gelagert?', options: [
        { t: '+2 bis +6 °C', correct: true, fb: 'Richtig.' },
        { t: '+20 bis +24 °C', correct: false, fb: 'So werden Thrombozytenkonzentrate gelagert (unter Agitation).' },
        { t: 'unter −25 °C', correct: false, fb: 'So wird gefrorenes Frischplasma gelagert.' }
      ] },
      { type: 'quiz', title: 'Reaktion', question: 'Was ist richtig?', options: [
        { t: 'Ursache prüfen (Tür, Strom), Präparate in ein geprüftes Ersatzgerät umlagern, Abweichung dokumentieren und Verwendbarkeit durch die Verantwortlichen bewerten lassen.', correct: true, fb: 'Richtig – die Kühlkette muss lückenlos nachvollziehbar sein.' },
        { t: 'Alarm quittieren und bis morgen warten.', correct: false, fb: 'Blutpräparate können verderben – sofort handeln.' },
        { t: 'Präparate ins Gefrierfach legen.', correct: false, fb: 'Einfrieren zerstört Erythrozyten.' }
      ], after: function (c) { c.alarmPulse('blood-fridge', false); } },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Temperaturüberwachung, Alarmierung einer ständig besetzten Stelle und Dokumentation sichern die Qualität von Blutprodukten.</p>' }
    ]
  });
})();
