/* =====================================================================
   Gerätedatenbank – Intensivstation (vollständig ausgearbeitet)
   Viele dieser Geräte werden auch in anderen Bereichen verwendet.
   Herstellerangaben = Beispiele typischer Anbieter am Markt, keine
   Produktempfehlung; Abbildungen sind generisch.
   ===================================================================== */
(function () {
  'use strict';
  var R = window.MT.registerDevice;

  R({
    id: 'ventilator',
    name: 'Intensivbeatmungsgerät',
    short: 'Beatmungsgerät',
    category: 'Atmung',
    manufacturers: ['Dräger', 'Hamilton Medical', 'Getinge (Maquet)', 'Löwenstein Medical', 'Mindray'],
    mdr: 'IIb',
    standards: ['ISO 80601-2-12 (Intensivbeatmungsgeräte)', 'IEC 60601-1-8 (Alarmsysteme)', 'ISO 80601-2-74 (Atemgasbefeuchter)'],
    purpose: 'Übernimmt oder unterstützt die Atmung von Patientinnen und Patienten, die nicht ausreichend selbst atmen können, z. B. bei akutem Lungenversagen (ARDS), nach großen Operationen oder bei Bewusstlosigkeit.',
    function: 'Ein Gasmischer mischt Sauerstoff und Druckluft aus der zentralen Gasversorgung auf die eingestellte FiO₂. Ein elektronisch geregeltes Inspirationsventil liefert das Gas über den Inspirationsschenkel des Schlauchsystems; ein Exspirationsventil hält während der Ausatmung den PEEP. Flow- und Drucksensoren messen jeden Atemzug. Die Regelung arbeitet volumenkontrolliert (fester Flow bis zum Zielvolumen) oder druckkontrolliert (konstanter Druck, Volumen ergibt sich aus Compliance und Resistance). Grundlage ist die Bewegungsgleichung des respiratorischen Systems: P = V/C + R·Flow + PEEP.',
    components: [
      { name: 'Bedienoberfläche / Display', desc: 'Touchscreen mit Kurven (Druck, Flow, Volumen), Loops, Messwerten und Alarmanzeige.' },
      { name: 'Gasmischer (Blender)', desc: 'Mischt O₂ und Druckluft auf die eingestellte inspiratorische Sauerstoffkonzentration (FiO₂ 21–100 %).' },
      { name: 'Inspirationsventil', desc: 'Proportionalventil, das Flow und Druck während der Einatmung regelt.' },
      { name: 'Exspirationsventil', desc: 'Öffnet zur Ausatmung und hält den positiven endexspiratorischen Druck (PEEP).' },
      { name: 'Flowsensor', desc: 'Misst In- und Exspirationsflow (z. B. Hitzdraht- oder Differenzdruckprinzip); Basis für Volumenberechnung.' },
      { name: 'O₂-Sensor', desc: 'Überwacht die tatsächlich gelieferte Sauerstoffkonzentration (galvanisch oder paramagnetisch).' },
      { name: 'Beatmungsschlauchsystem', desc: 'Inspirations- und Exspirationsschenkel, Y-Stück, ggf. HME-Filter oder aktiver Befeuchter.' },
      { name: 'Atemgasbefeuchter', desc: 'Beheizter Befeuchter (Ziel ~37 °C, 44 mg/l absolute Feuchte) verhindert Austrocknen der Atemwege.' },
      { name: 'Akku', desc: 'Interne Batterie überbrückt Netzausfälle und Transporte.' },
      { name: 'Gasanschlüsse', desc: 'Normgerechte Anschlüsse für O₂ und Druckluft an die zentrale Gasversorgung (ca. 5 bar).' }
    ],
    parts: [
      { name: 'Bedienoberfläche / Display', x: 85, y: 62 },
      { name: 'Inspirationsventil', x: 50, y: 290 },
      { name: 'Exspirationsventil', x: 120, y: 290 },
      { name: 'Atemgasbefeuchter', x: 54, y: 356 },
      { name: 'Gasanschlüsse', x: 85, y: 165 }
    ],
    measurements: [
      { name: 'Spitzendruck (Ppeak)', unit: 'cmH₂O', normal: '< 30–35', desc: 'Höchster Atemwegsdruck; steigt bei Sekret, Bronchospasmus, abgeknicktem Tubus.' },
      { name: 'Plateaudruck (Pplat)', unit: 'cmH₂O', normal: '≤ 30', desc: 'Druck ohne Flow (endinspiratorische Pause) – spiegelt die alveoläre Dehnung.' },
      { name: 'PEEP', unit: 'cmH₂O', normal: '5–15', desc: 'Positiver endexspiratorischer Druck hält Alveolen offen und verbessert die Oxygenierung.' },
      { name: 'Tidalvolumen (VTe)', unit: 'ml', normal: '6–8 ml/kg Idealgewicht', desc: 'Exspiratorisch gemessenes Atemzugvolumen; lungenprotektiv eher niedrig.' },
      { name: 'Atemminutenvolumen (MV)', unit: 'l/min', normal: '5–10', desc: 'VT × Atemfrequenz; bestimmt maßgeblich die CO₂-Elimination.' },
      { name: 'Atemfrequenz (f)', unit: '/min', normal: '12–20', desc: 'Gerätegesteuerte und spontane Atemzüge.' },
      { name: 'FiO₂', unit: '%', normal: '21–100 (so niedrig wie möglich)', desc: 'Inspiratorische Sauerstofffraktion.' },
      { name: 'Driving Pressure (ΔP)', unit: 'cmH₂O', normal: '< 15', desc: 'Pplat − PEEP; Marker für Lungenbelastung.' },
      { name: 'Compliance (C)', unit: 'ml/cmH₂O', normal: '50–100 (lungengesund)', desc: 'Dehnbarkeit: VT / (Pplat − PEEP).' }
    ],
    alarms: [
      { name: 'Atemwegsdruck hoch (Paw hoch)', prio: 'high', cause: 'Sekret, Husten/Gegenatmen, Tubus abgeknickt oder Patient beißt auf den Tubus, Bronchospasmus, Pneumothorax.', action: 'Patient ansehen, Tubus und Schläuche prüfen, ggf. absaugen; Ursache klären.' },
      { name: 'Diskonnektion / Leckage', prio: 'high', cause: 'Schlauch gelöst, Cuff undicht, Tubus disloziert.', action: 'Verbindung prüfen, Cuffdruck messen, ggf. manuell mit Beutel beatmen.' },
      { name: 'Apnoe', prio: 'high', cause: 'Keine Atemzüge im spontanen Modus innerhalb der Apnoezeit.', action: 'Atemantrieb prüfen; Gerät schaltet in Apnoeventilation.' },
      { name: 'Minutenvolumen niedrig/hoch', prio: 'medium', cause: 'Veränderter Atemantrieb, Leckage, Sensorproblem.', action: 'Patient und Messwerte beurteilen, Grenzen anpassen.' },
      { name: 'O₂-Versorgung ausgefallen', prio: 'high', cause: 'Druckabfall der zentralen Gasversorgung oder Schlauch nicht gesteckt.', action: 'Anschluss prüfen, auf O₂-Flasche umstellen, Haustechnik informieren.' },
      { name: 'Netzausfall – Akkubetrieb', prio: 'medium', cause: 'Netzstecker gezogen oder Stromausfall.', action: 'Netzversorgung wiederherstellen (Sicherheitssteckdose), Akkustand beobachten.' },
      { name: 'Flowsensor-Fehler', prio: 'low', cause: 'Verschmutzter oder defekter Sensor, Feuchtigkeit.', action: 'Sensor kalibrieren oder tauschen.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'O₂ und Druckluft (~5 bar) aus der zentralen Gasversorgung über die Deckenversorgungseinheit.' },
      { to: 'pendant', type: 'Strom', desc: 'Netzanschluss an eine Steckdose der Sicherheitsstromversorgung (grün markiert).' },
      { to: 'monitor', type: 'Daten', desc: 'Beatmungsparameter werden an den Monitor bzw. das PDMS übertragen; etCO₂ wird oft über das Monitormodul gemessen.' },
      { to: 'central-station', type: 'Daten', desc: 'Alarm- und Messwertweiterleitung an Zentrale und Patientendatenmanagementsystem (PDMS).' },
      { to: 'suction', type: 'Klinisch', desc: 'Geschlossenes Absaugsystem am Y-Stück erlaubt Absaugen ohne Diskonnektion.' },
      { to: 'bga', type: 'Klinisch', desc: 'Blutgasanalyse (PaO₂, PaCO₂, pH) ist Grundlage für die Anpassung von FiO₂, PEEP und Minutenvolumen.' }
    ],
    safety: [
      'Vor Inbetriebnahme Gerätecheck (Selbsttest, Dichtigkeit, Sensorkalibrierung) durchführen.',
      'Beatmungsbeutel (Ambu-Beutel) mit Maske/O₂ muss an jedem Bettplatz griffbereit sein.',
      'Alarmgrenzen patientenindividuell einstellen – Alarme nie dauerhaft stummschalten.',
      'Netzstecker an Sicherheitssteckdose (grün) – bei Stromausfall versorgt die Netzersatzanlage.',
      'Nach MPBetreibV Anlage 1: Einweisung vor Anwendung, regelmäßige sicherheitstechnische Kontrolle (STK).',
      'Hygiene: Einmalschlauchsysteme bzw. Wechselintervalle nach Herstellerangabe, HME-Filter zum Infektionsschutz.'
    ],
    sim: 'ventilation',
    tip: 'Merksatz: Ppeak − Pplat ≈ Widerstand (Resistance); Pplat − PEEP ≈ Dehnung (Compliance).'
  });

  R({
    id: 'monitor',
    name: 'Patientenmonitor (Bedside)',
    short: 'Patientenmonitor',
    category: 'Überwachung',
    manufacturers: ['Philips', 'GE HealthCare', 'Dräger', 'Mindray', 'Nihon Kohden'],
    mdr: 'IIb',
    standards: ['IEC 80601-2-49 (Multiparameter-Monitore)', 'IEC 60601-2-27 (EKG-Überwachung)', 'ISO 80601-2-61 (Pulsoximeter)', 'IEC 80601-2-30 (NIBP)', 'IEC 60601-2-34 (invasive Druckmessung)', 'ISO 80601-2-55 (Atemgasmonitore)'],
    purpose: 'Kontinuierliche Überwachung der Vitalparameter, um lebensbedrohliche Veränderungen sofort zu erkennen und zu alarmieren.',
    function: 'Messmodule erfassen Biosignale: EKG über Hautelektroden (Spannungen im mV-Bereich, verstärkt und gefiltert), SpO₂ über Licht­absorption zweier Wellenlängen (rot 660 nm / infrarot 940 nm), invasiven Blutdruck über einen Druckwandler (Wheatstone-Brücke), nicht-invasiven Blutdruck oszillometrisch über eine Manschette, etCO₂ per Infrarotabsorption. Algorithmen berechnen Herzfrequenz, Arrhythmien, Mittelwerte und vergleichen mit Alarmgrenzen.',
    components: [
      { name: 'Display', desc: 'Darstellung von Kurven (Sweep) und Zahlenwerten in parameterspezifischen Farben.' },
      { name: 'Parametermodule', desc: 'Steckbare Module für EKG/Resp, SpO₂, NIBP, invasive Drücke, Temperatur, CO₂.' },
      { name: 'EKG-Kabel & Elektroden', desc: '3-, 5- oder 12-polige Ableitung; Elektroden mit Gel-Kontakt.' },
      { name: 'SpO₂-Sensor', desc: 'Finger-, Ohr- oder Klebesensor mit LEDs und Fotodiode.' },
      { name: 'NIBP-Manschette & Pumpe', desc: 'Manschette, Druckschlauch, interne Pumpe und Ablassventil.' },
      { name: 'Netzwerkschnittstelle', desc: 'LAN/WLAN zur Zentrale und zum PDMS, ggf. HL7-Schnittstelle.' },
      { name: 'Alarmleuchte & Lautsprecher', desc: 'Optische und akustische Alarmsignalisierung nach Priorität.' }
    ],
    parts: [
      { name: 'Display', x: 120, y: 78 },
      { name: 'Alarmleuchte & Lautsprecher', x: 205, y: 151 },
      { name: 'Netzwerkschnittstelle', x: 120, y: 185 }
    ],
    measurements: [
      { name: 'Herzfrequenz (HF)', unit: '/min', normal: '60–100', desc: 'Aus R-Zacken des EKG berechnet (oder aus der Pulskurve).' },
      { name: 'EKG (Ableitung II)', unit: 'mV', normal: 'Sinusrhythmus', desc: 'Elektrische Herzaktivität; Arrhythmie- und ST-Analyse.' },
      { name: 'SpO₂', unit: '%', normal: '94–98', desc: 'Funktionelle Sauerstoffsättigung des arteriellen Blutes.' },
      { name: 'Invasiver Blutdruck (ART)', unit: 'mmHg', normal: '≈ 120/80, MAP 70–100', desc: 'Schlag-für-Schlag-Messung über arteriellen Katheter.' },
      { name: 'NIBP', unit: 'mmHg', normal: '≈ 120/80', desc: 'Intermittierende oszillometrische Manschettenmessung.' },
      { name: 'etCO₂', unit: 'mmHg', normal: '35–45', desc: 'Endtidaler CO₂-Partialdruck – Ventilation, Tubuslage, Kreislauf.' },
      { name: 'Atemfrequenz', unit: '/min', normal: '12–20', desc: 'Aus Kapnographie oder Thoraximpedanz.' },
      { name: 'Temperatur', unit: '°C', normal: '36,5–37,5', desc: 'Kern- oder Hauttemperatur über Sonde.' },
      { name: 'ZVD', unit: 'mmHg', normal: '2–8', desc: 'Zentralvenöser Druck (zweiter Druckkanal).' }
    ],
    alarms: [
      { name: 'Asystolie / Kammerflimmern / V-Tach', prio: 'high', cause: 'Lebensbedrohliche Rhythmusstörung – oder Artefakt.', action: 'SOFORT Patient beurteilen (Bewusstsein, Puls)! Bei Bestätigung Reanimation, Defibrillator.' },
      { name: 'SpO₂ niedrig', prio: 'high', cause: 'Hypoxie, Tubusproblem, Sekret – oder schlechte Signalqualität.', action: 'Patient, Beatmung und Sensorsitz prüfen; Pleth-Kurve beurteilen.' },
      { name: 'HF hoch/niedrig', prio: 'medium', cause: 'Tachy-/Bradykardie, Medikamentenwirkung, Schmerz, Volumenmangel.', action: 'Ursache klären, Rhythmus beurteilen.' },
      { name: 'Blutdruck niedrig (MAP)', prio: 'medium', cause: 'Schock, Sedierung, Katecholaminpumpe leer/okkludiert – oder Wandler falsch positioniert.', action: 'Patient prüfen, Nullabgleich und Wandlerhöhe kontrollieren, Pumpen prüfen.' },
      { name: 'EKG-Ableitung prüfen', prio: 'medium', cause: 'Elektrode gelöst, Kabelbruch (technischer Alarm).', action: 'Elektroden und Kabel kontrollieren, Haut vorbereiten.' },
      { name: 'SpO₂-Sensor ab / Artefakt', prio: 'low', cause: 'Sensor abgerutscht, Bewegung, kalte Finger, Nagellack.', action: 'Sensor neu anlegen oder Messort wechseln.' },
      { name: 'Apnoe / kein CO₂', prio: 'high', cause: 'Diskonnektion, Tubusfehllage, Atemstillstand.', action: 'Beatmung und Tubus sofort prüfen.' }
    ],
    connections: [
      { to: 'central-station', type: 'Daten', desc: 'Kontinuierliche Übertragung von Kurven, Werten und Alarmen an die Überwachungszentrale.' },
      { to: 'ventilator', type: 'Daten', desc: 'Integration von Beatmungswerten; Kapnographie liefert Kontrolle der Beatmung.' },
      { to: 'art-line', type: 'Signal', desc: 'Der Druckwandler liefert das Signal für die invasive Blutdruckkurve.' },
      { to: 'pendant', type: 'Strom', desc: 'Stromversorgung und Netzwerkanschluss (RJ45) an der Deckenversorgung.' },
      { to: 'defibrillator', type: 'Klinisch', desc: 'Bei Rhythmusalarm wird der Defibrillator benötigt; Defis haben eigene EKG-Ableitung.' },
      { to: 'syringe-pump', type: 'Klinisch', desc: 'Blutdruckverlauf zeigt die Wirkung von Katecholaminen aus den Spritzenpumpen.' }
    ],
    safety: [
      'Alarmgrenzen patientenindividuell und plausibel einstellen (Alarmmüdigkeit vermeiden!).',
      'Bei Alarm immer zuerst den Patienten ansehen, dann das Gerät („treat the patient, not the monitor“).',
      'Technische Alarme (Sensor ab) sind keine Entwarnung – die Überwachung ist unterbrochen.',
      'NIBP: Manschettengröße passend wählen (zu klein → zu hohe Werte).',
      'Nur zugelassenes Zubehör verwenden; defibrillationsgeschützte EKG-Kabel nutzen.',
      'NIBP-Messfunktion unterliegt der messtechnischen Kontrolle (MTK, MPBetreibV Anlage 2).'
    ],
    sim: 'ecg'
  });

  R({
    id: 'central-station',
    name: 'Überwachungszentrale & PDMS-Arbeitsplatz',
    short: 'Zentrale / PDMS',
    category: 'IT & Vernetzung',
    manufacturers: ['Philips', 'GE HealthCare', 'Dräger', 'Mindray', 'diverse PDMS-Anbieter'],
    standards: ['IEC 80001-1 (Risikomanagement medizinischer IT-Netzwerke)', 'IEC 60601-1-8 (verteilte Alarmsysteme)', 'HL7 / IHE-Profile'],
    purpose: 'Zeigt alle Monitore einer Station auf einem Arbeitsplatz, verteilt Alarme an das Personal und dokumentiert Messwerte automatisch im Patientendatenmanagementsystem (PDMS).',
    function: 'Die Bettmonitore senden ihre Daten über ein separates, gesichertes Medizingeräte-Netzwerk an einen Server. Die Zentrale stellt Kurven, Trends und Alarme aller Betten dar. Ein PDMS übernimmt Werte von Monitor, Beatmungsgerät und Pumpen (Gerätedatenintegration), ergänzt Medikation, Bilanz und Pflegedokumentation. Alarme können zusätzlich an mobile Endgeräte weitergeleitet werden (sekundäres Alarmsystem).',
    components: [
      { name: 'Zentralen-Bildschirme', desc: 'Übersicht aller Betten mit Kurven, Messwerten und Alarmstatus.' },
      { name: 'Server / Gateway', desc: 'Sammelt Daten, speichert Full-Disclosure-Kurven, übersetzt Protokolle (z. B. HL7).' },
      { name: 'Medizingeräte-Netzwerk', desc: 'Getrenntes, redundantes Netzwerk (VLAN) mit definierter Verfügbarkeit.' },
      { name: 'PDMS-Software', desc: 'Elektronische Kurve: Vitalwerte, Beatmung, Medikation, Bilanz, Scores.' },
      { name: 'Alarmweiterleitung', desc: 'Weitergabe an Telefone/Pager – ersetzt nicht den primären Alarm am Bett.' }
    ],
    measurements: [
      { name: 'Trenddaten', unit: '–', normal: '–', desc: 'Verläufe aller Parameter über Stunden bis Tage.' },
      { name: 'Alarmhistorie', unit: '–', normal: '–', desc: 'Protokoll aller Alarme mit Zeitstempel.' },
      { name: 'Bilanz', unit: 'ml', normal: 'patientenindividuell', desc: 'Ein- und Ausfuhr, z. T. automatisch aus Pumpendaten.' }
    ],
    alarms: [
      { name: 'Verbindung zum Bett unterbrochen', prio: 'medium', cause: 'Netzwerkfehler, Monitor ausgeschaltet oder im Transportmodus.', action: 'Monitor am Bett prüfen – die zentrale Überwachung ist unterbrochen!' },
      { name: 'Alarmweiterleitung gestört', prio: 'medium', cause: 'Server- oder Kommunikationsfehler.', action: 'Präsenz am Bett sicherstellen, IT/Medizintechnik informieren.' },
      { name: 'Wiederholte Patientenalarme', prio: 'low', cause: 'Fehlerhafte Alarmgrenzen, Artefakte.', action: 'Grenzwerte überprüfen, Ursache beheben.' }
    ],
    connections: [
      { to: 'monitor', type: 'Daten', desc: 'Empfängt Kurven, Werte und Alarme der Bettmonitore.' },
      { to: 'ventilator', type: 'Daten', desc: 'Übernimmt Beatmungseinstellungen und -messwerte ins PDMS.' },
      { to: 'syringe-pump', type: 'Daten', desc: 'Laufraten und Medikamentennamen der Pumpen werden dokumentiert.' },
      { to: 'infusion-pump', type: 'Daten', desc: 'Infusionsvolumen fließen in die Bilanz ein.' },
      { to: 'bga', type: 'Daten', desc: 'Blutgasergebnisse werden über das Laborsystem/PDMS angezeigt.' }
    ],
    safety: [
      'Ein medizinisches IT-Netzwerk benötigt Risikomanagement nach IEC 80001-1 (Verantwortlichkeiten, Änderungsmanagement).',
      'Die Zentrale ist ein ergänzendes System – der Primäralarm entsteht am Bettmonitor.',
      'Datenschutz: Zugriff nur für berechtigtes Personal, Bildschirmsperre.',
      'IT-Sicherheit: Updates und Netzwerksegmentierung in Abstimmung mit Hersteller und Medizintechnik.'
    ]
  });

  R({
    id: 'syringe-pump',
    name: 'Spritzenpumpe (Perfusor)',
    short: 'Spritzenpumpen',
    category: 'Infusion',
    manufacturers: ['B. Braun', 'Fresenius Kabi', 'BD', 'ICU Medical', 'Mindray'],
    mdr: 'IIb',
    standards: ['IEC 60601-2-24 (Infusionspumpen)'],
    purpose: 'Sehr genaue, kontinuierliche Gabe kleiner Volumina hochwirksamer Medikamente – z. B. Katecholamine, Sedativa, Analgetika, Insulin.',
    function: 'Ein Schrittmotor treibt über eine Gewindespindel den Spritzenantrieb, der den Kolben mit definierter Geschwindigkeit vorschiebt. Förderrate (ml/h) = Kolbenweg pro Zeit × Spritzenquerschnitt. Ein Kraftsensor am Antrieb erkennt Verschlüsse (Okklusion). Moderne „Smart Pumps“ besitzen Medikamentenbibliotheken mit Dosisgrenzen (Dose Error Reduction Software).',
    components: [
      { name: 'Spritzenaufnahme & Spritzenerkennung', desc: 'Erkennt Spritzengröße/-typ für korrekte Förderberechnung.' },
      { name: 'Antrieb (Schrittmotor & Spindel)', desc: 'Schiebt den Kolben mit hoher Präzision vor.' },
      { name: 'Kraftsensor (Okklusionsdruck)', desc: 'Misst den Gegendruck – Alarm bei Verschluss.' },
      { name: 'Display & Tastatur', desc: 'Eingabe von Rate, Dosis, Medikament; Anzeige von Restzeit.' },
      { name: 'Medikamentenbibliothek', desc: 'Hinterlegte Konzentrationen und Hard-/Soft-Limits.' },
      { name: 'Akku & Rack-Schnittstelle', desc: 'Betrieb im Transport; Datenanbindung über das Pumpenrack.' }
    ],
    parts: [
      { name: 'Spritzenaufnahme & Spritzenerkennung', x: 71, y: 176 },
      { name: 'Display & Tastatur', x: 141, y: 176 },
      { name: 'Akku & Rack-Schnittstelle', x: 160, y: 340 }
    ],
    measurements: [
      { name: 'Förderrate', unit: 'ml/h', normal: '0,1–200', desc: 'Volumen pro Stunde.' },
      { name: 'Dosis', unit: 'µg/kg/min bzw. mg/h', normal: 'medikamentabhängig', desc: 'Aus Rate, Konzentration und Körpergewicht berechnet.' },
      { name: 'Restvolumen / Restzeit', unit: 'ml / min', normal: '–', desc: 'Planung des rechtzeitigen Spritzenwechsels.' },
      { name: 'Förderdruck', unit: 'mmHg / Stufe', normal: 'niedrig', desc: 'Gegendruck im System; Anstieg deutet auf Okklusion hin.' }
    ],
    alarms: [
      { name: 'Okklusion (Verschluss)', prio: 'high', cause: 'Dreiwegehahn geschlossen, Leitung abgeknickt, Katheter verstopft.', action: 'Leitung prüfen. VORSICHT: vor dem Öffnen Druck entlasten – sonst Bolusgabe!' },
      { name: 'Spritze fast leer (Voralarm)', prio: 'low', cause: 'Restzeit unter eingestelltem Wert.', action: 'Neue Spritze vorbereiten (bei Katecholaminen ggf. überlappender Wechsel).' },
      { name: 'Spritze leer', prio: 'medium', cause: 'Spritze vollständig entleert.', action: 'Spritze wechseln – Unterbrechung kann bei Katecholaminen zu Blutdruckabfall führen.' },
      { name: 'Akku leer', prio: 'medium', cause: 'Kein Netz, Akku erschöpft.', action: 'An Netz/Rack anschließen.' },
      { name: 'Dosis über Limit', prio: 'medium', cause: 'Eingabe außerhalb der Medikamentenbibliothek.', action: 'Eingabe überprüfen (z. B. Kommafehler).' }
    ],
    connections: [
      { to: 'monitor', type: 'Klinisch', desc: 'Wirkung (z. B. Blutdruck unter Noradrenalin) wird am Monitor sichtbar.' },
      { to: 'central-station', type: 'Daten', desc: 'Raten und Medikamente werden über das Rack an das PDMS übertragen.' },
      { to: 'infusion-pump', type: 'Fluid', desc: 'Mehrere Infusionen laufen über Mehrfachverbinder in einen ZVK-Schenkel zusammen (Kompatibilität beachten).' },
      { to: 'pendant', type: 'Strom', desc: 'Rack-Stromversorgung über die Medienversorgung.' }
    ],
    safety: [
      'Spritzenpumpe auf Herzhöhe des Patienten positionieren – Höhenunterschiede verursachen Siphon-Effekt bzw. Rückfluss.',
      'Leitungen mit Rückschlagventil nutzen, wenn mehrere Pumpen in einen Zugang laufen.',
      'Nach Okklusion Druck entlasten, bevor die Leitung geöffnet wird (Bolusgefahr).',
      'Medikamentenbibliothek nutzen und Spritzen eindeutig beschriften (farbige Etiketten nach DIVI-Empfehlung).',
      'Anfahrverzögerung: Bei sehr kleinen Raten dauert es Minuten, bis das Medikament tatsächlich fließt.',
      'Infusionspumpen fallen unter MPBetreibV Anlage 1 (Einweisung, STK).'
    ],
    sim: 'infusion'
  });

  R({
    id: 'infusion-pump',
    name: 'Volumetrische Infusionspumpe',
    short: 'Infusionspumpe',
    category: 'Infusion',
    manufacturers: ['B. Braun', 'Fresenius Kabi', 'BD', 'ICU Medical', 'Baxter'],
    mdr: 'IIb',
    standards: ['IEC 60601-2-24 (Infusionspumpen)'],
    purpose: 'Gabe größerer Volumina (z. B. Infusionslösungen, Antibiotika, parenterale Ernährung) mit kontrollierter Rate.',
    function: 'Ein Peristaltik-Mechanismus (Linearfinger oder Kassette) drückt den Infusionsschlauch wellenförmig aus und fördert so ein definiertes Volumen pro Umdrehung. Ein Luftsensor (Ultraschall) erkennt Luftblasen, Drucksensoren vor und hinter der Pumpe erkennen Verschlüsse auf der Zulauf- bzw. Patientenseite.',
    components: [
      { name: 'Peristaltik-Pumpwerk', desc: 'Lineare Finger pressen den Schlauch nacheinander ab.' },
      { name: 'Pumpenset / Kassette', desc: 'Spezielles Infusionsset passend zur Pumpe.' },
      { name: 'Luftsensor', desc: 'Ultraschallsensor erkennt Luft in der Leitung.' },
      { name: 'Drucksensoren (up-/downstream)', desc: 'Erkennen Verschluss auf Beutel- bzw. Patientenseite.' },
      { name: 'Free-Flow-Klemme', desc: 'Verhindert unkontrollierten freien Durchfluss beim Öffnen der Tür.' },
      { name: 'Display & Bedienfeld', desc: 'Eingabe von Rate und Zielvolumen (VTBI).' }
    ],
    measurements: [
      { name: 'Förderrate', unit: 'ml/h', normal: '1–999', desc: 'Eingestellte Laufrate.' },
      { name: 'VTBI', unit: 'ml', normal: '–', desc: '„Volume to be infused“ – Zielvolumen.' },
      { name: 'Infundiertes Volumen', unit: 'ml', normal: '–', desc: 'Für die Flüssigkeitsbilanz.' }
    ],
    alarms: [
      { name: 'Luft in der Leitung', prio: 'high', cause: 'Beutel leer oder Luftblase im Set.', action: 'Luft entfernen, Set entlüften.' },
      { name: 'Okklusion patientenseitig', prio: 'high', cause: 'Abgeknickter Schlauch, geschlossener Hahn.', action: 'Leitung bis zum Patienten prüfen.' },
      { name: 'Okklusion zulaufseitig', prio: 'medium', cause: 'Rollklemme geschlossen, Beutel leer.', action: 'Klemme öffnen, Beutel prüfen.' },
      { name: 'Infusion beendet (VTBI erreicht)', prio: 'low', cause: 'Zielvolumen gegeben – Pumpe läuft ggf. mit KVO-Rate.', action: 'Weiteres Vorgehen festlegen.' },
      { name: 'Tür offen', prio: 'medium', cause: 'Pumpentür während Betrieb geöffnet.', action: 'Set korrekt einlegen und Tür schließen.' }
    ],
    connections: [
      { to: 'syringe-pump', type: 'Fluid', desc: 'Trägerlösung kann mit Spritzenpumpen-Medikamenten zusammenlaufen (Bolusgefahr bei Ratenänderung!).' },
      { to: 'central-station', type: 'Daten', desc: 'Volumina gehen in die Bilanz des PDMS ein.' },
      { to: 'pendant', type: 'Strom', desc: 'Stromversorgung.' }
    ],
    safety: [
      'Nur freigegebene Pumpensets verwenden – sonst stimmt die Förderrate nicht.',
      'Vor dem Einlegen das Set entlüften; Luftalarme nie überbrücken.',
      'Bei Kombination mit Katecholaminen: Trägerlösung nicht abrupt stoppen oder steigern (Bolus/Unterbrechung des Medikaments).',
      'Infusionspumpen fallen unter MPBetreibV Anlage 1 (Einweisung, STK).'
    ],
    sim: 'infusion'
  });

  R({
    id: 'suction',
    name: 'Absaugeinheit (Vakuumregler)',
    short: 'Absaugung',
    category: 'Atmung',
    manufacturers: ['Medela', 'Atmos', 'Dräger', 'Amvex', 'Ohio Medical'],
    mdr: 'IIa',
    standards: ['ISO 10079-3 (Absauggeräte mit Vakuumversorgung)'],
    purpose: 'Entfernt Sekret aus Mund, Rachen und Atemwegen (endotracheales Absaugen) – zur Freihaltung der Atemwege bei beatmeten Patienten.',
    function: 'Der Regler wird an die zentrale Vakuumversorgung (gelber Anschluss) gesteckt und begrenzt den Unterdruck auf einen eingestellten Wert (für Erwachsene meist −0,2 bis −0,4 bar). Das Sekret wird in einen Auffangbehälter gesaugt; ein Überlaufschutz/Bakterienfilter schützt das Vakuumnetz. Bei geschlossenen Absaugsystemen bleibt die Beatmung während des Absaugens erhalten.',
    components: [
      { name: 'Vakuumregler mit Manometer', desc: 'Stellt den Sog ein und zeigt ihn an.' },
      { name: 'Sekretbehälter', desc: 'Auffangbehälter (oft Einweg-Beutel) mit Volumenskala.' },
      { name: 'Überlaufschutz / Filter', desc: 'Schwimmerventil und hydrophober Filter schützen die Vakuumanlage.' },
      { name: 'Absaugschlauch & Katheter', desc: 'Steriler Einmalkatheter oder geschlossenes System am Tubus.' },
      { name: 'Wandanschluss (Vakuum)', desc: 'Normstecker für die gelbe Vakuum-Entnahmestelle.' }
    ],
    parts: [
      { name: 'Wandanschluss (Vakuum)', x: 45, y: 9 },
      { name: 'Vakuumregler mit Manometer', x: 45, y: 42 },
      { name: 'Sekretbehälter', x: 45, y: 160 },
      { name: 'Absaugschlauch & Katheter', x: 86, y: 150 }
    ],
    measurements: [
      { name: 'Unterdruck', unit: 'kPa / bar', normal: 'Erw. ca. −20 bis −40 kPa', desc: 'So niedrig wie möglich, so hoch wie nötig.' },
      { name: 'Sekretmenge', unit: 'ml', normal: '–', desc: 'Dokumentation von Menge und Beschaffenheit.' }
    ],
    alarms: [
      { name: 'Kein Sog', prio: 'medium', cause: 'Behälter voll (Überlaufschutz hat geschlossen), Schlauch undicht, Vakuumanlage gestört.', action: 'Behälter wechseln, Verbindungen prüfen, Notfall-Absaugpumpe bereithalten.' },
      { name: 'Behälter voll', prio: 'low', cause: 'Füllgrenze erreicht.', action: 'Behälter wechseln.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'Vakuum aus der zentralen Versorgung (gelbe Entnahmestelle).' },
      { to: 'ventilator', type: 'Klinisch', desc: 'Sekret erhöht den Atemwegsdruck – Absaugen senkt ihn wieder.' },
      { to: 'monitor', type: 'Klinisch', desc: 'Beim Absaugen kann die SpO₂ abfallen und die HF steigen (vagale Reaktion: Bradykardie möglich).' }
    ],
    safety: [
      'Funktionsprüfung bei jedem Schichtbeginn: Absaugung muss jederzeit sofort einsatzbereit sein.',
      'Präoxygenierung vor dem Absaugen erwägen; Absaugdauer kurz halten (< 15 s).',
      'Sterile Technik bei offenem endotrachealem Absaugen.',
      'Einen netzunabhängigen Notfallsauger für den Ausfall des Vakuumnetzes vorhalten.'
    ]
  });

  R({
    id: 'defibrillator',
    name: 'Defibrillator / Notfallwagen',
    short: 'Defibrillator',
    category: 'Notfall',
    manufacturers: ['ZOLL', 'Stryker (Physio-Control)', 'Philips', 'Schiller', 'GS (corpuls)'],
    mdr: 'IIb',
    standards: ['IEC 60601-2-4 (Defibrillatoren)'],
    purpose: 'Beendet lebensbedrohliche Herzrhythmusstörungen (Kammerflimmern, pulslose ventrikuläre Tachykardie) durch einen Stromstoß; zusätzlich Kardioversion und externe Schrittmacherstimulation.',
    function: 'Ein Kondensator wird auf eine hohe Spannung (bis ca. 2000 V) geladen und über Klebeelektroden (Pads) durch den Thorax entladen. Moderne Geräte nutzen einen biphasischen Impuls (typ. 120–200 J) und passen ihn an die gemessene Thoraximpedanz an. Bei der synchronisierten Kardioversion wird der Schock auf die R-Zacke ausgelöst, um eine Abgabe in der vulnerablen Phase (T-Welle) zu vermeiden.',
    components: [
      { name: 'Monitor / EKG-Anzeige', desc: 'Zeigt den Rhythmus über Pads oder EKG-Kabel.' },
      { name: 'Energiewahlschalter', desc: 'Auswahl der Energie in Joule bzw. Betriebsart (AED, manuell, Pacer).' },
      { name: 'Ladetaste', desc: 'Lädt den Kondensator auf die gewählte Energie.' },
      { name: 'Schocktaste', desc: 'Löst die Energieabgabe aus.' },
      { name: 'Klebeelektroden / Paddles', desc: 'Leiten den Strom durch den Thorax.' },
      { name: 'Kondensator & Hochspannungsmodul', desc: 'Speichert die Energie für den Schock.' },
      { name: 'Notfallwagen', desc: 'Schubladen mit Notfallmedikamenten, Atemwegsmaterial, Zugängen.' }
    ],
    parts: [
      { name: 'Monitor / EKG-Anzeige', x: 68, y: 62 },
      { name: 'Energiewahlschalter', x: 124, y: 50 },
      { name: 'Ladetaste', x: 117, y: 73 },
      { name: 'Schocktaste', x: 133, y: 73 },
      { name: 'Klebeelektroden / Paddles', x: 41, y: 107 },
      { name: 'Notfallwagen', x: 85, y: 230 }
    ],
    measurements: [
      { name: 'Energie', unit: 'J', normal: 'biphasisch 120–200 (Erw.)', desc: 'Abgegebene Energie.' },
      { name: 'Thoraximpedanz', unit: 'Ω', normal: '50–150', desc: 'Bestimmt Strom bei gegebener Spannung; Grundlage der Impedanzkompensation.' },
      { name: 'Spitzenstrom', unit: 'A', normal: '≈ 10–40', desc: 'Entscheidend für den Defibrillationserfolg.' },
      { name: 'EKG / HF', unit: '/min', normal: '–', desc: 'Rhythmusanalyse über Pads.' }
    ],
    alarms: [
      { name: 'Schock empfohlen (AED)', prio: 'high', cause: 'Defibrillierbarer Rhythmus erkannt.', action: 'Alle zurücktreten, Schock auslösen, sofort Herzdruckmassage fortsetzen.' },
      { name: 'Elektroden prüfen', prio: 'medium', cause: 'Schlechter Hautkontakt, Impedanz außerhalb des Bereichs.', action: 'Pads fest andrücken oder ersetzen.' },
      { name: 'Selbsttest fehlgeschlagen', prio: 'medium', cause: 'Akku oder Hardwarefehler beim täglichen Test.', action: 'Gerät austauschen, Medizintechnik informieren.' }
    ],
    connections: [
      { to: 'monitor', type: 'Klinisch', desc: 'Rhythmusalarm am Monitor → Defibrillator holen; manche Systeme können das Monitor-EKG zur Synchronisation nutzen.' },
      { to: 'icu-bed', type: 'Klinisch', desc: 'Für Herzdruckmassage CPR-Funktion des Bettes (flache, harte Unterlage) aktivieren.' },
      { to: 'pendant', type: 'Strom', desc: 'Ständig am Netz zur Akkuladung – Bereitschaft für den Einsatz.' }
    ],
    safety: [
      'Vor Schockabgabe: „Achtung – alle weg vom Patienten!“ – niemand darf Patient oder Bett berühren.',
      'Sauerstoffquelle während des Schocks ≥ 1 m entfernen (Brandgefahr).',
      'Pads nicht über Schrittmacher-Aggregat oder Medikamentenpflaster kleben.',
      'Täglicher Funktionscheck und Kontrolle des Notfallwagens nach Checkliste.',
      'Defibrillatoren unterliegen MPBetreibV Anlage 1 (Einweisung, STK).'
    ],
    sim: 'defibrillation'
  });

  R({
    id: 'icu-bed',
    name: 'Intensivpflegebett',
    short: 'Intensivbett',
    category: 'Lagerung',
    manufacturers: ['Hillrom (Baxter)', 'Stryker', 'Linet', 'Arjo', 'Völker'],
    mdr: 'I',
    standards: ['IEC 60601-2-52 (Medizinische Betten)'],
    purpose: 'Sichere Lagerung schwerstkranker Patienten mit Positionierung (z. B. 30°-Oberkörperhochlage zur Pneumonieprophylaxe), Dekubitusprophylaxe und integrierter Waage.',
    function: 'Elektromotorische Antriebe verstellen Höhe, Rückenteil, Beinteil und Neigung (Trendelenburg). Wechseldruckmatratzen verteilen den Auflagedruck. Ein Winkelsensor zeigt die Kopfteilneigung, Wägezellen messen das Gewicht. Die CPR-Funktion bringt das Bett schnell in eine flache Position.',
    components: [
      { name: 'Antriebe & Steuerung', desc: 'Elektromotoren mit Hand- und Pflegepanel.' },
      { name: 'Seitengitter mit Bedienteil', desc: 'Sturzprophylaxe und Bedienelemente.' },
      { name: 'Wechseldruckmatratze', desc: 'Luftkammern wechseln zyklisch den Druck.' },
      { name: 'Integrierte Waage', desc: 'Wägezellen für die Gewichtskontrolle.' },
      { name: 'CPR-Hebel', desc: 'Schnelles Flachstellen bei Reanimation.' },
      { name: 'Akku', desc: 'Bewegung auch ohne Netz (z. B. Transport).' }
    ],
    measurements: [
      { name: 'Kopfteilwinkel', unit: '°', normal: '≥ 30 bei Beatmung', desc: 'Pneumonieprophylaxe.' },
      { name: 'Gewicht', unit: 'kg', normal: '–', desc: 'Dosisberechnung und Flüssigkeitsbilanz.' }
    ],
    alarms: [
      { name: 'Bettausstieg', prio: 'medium', cause: 'Patient verlässt das Bett (Gewichtsverlagerung).', action: 'Patient aufsuchen.' },
      { name: 'Bremse nicht aktiviert', prio: 'low', cause: 'Bremsen gelöst.', action: 'Bremsen feststellen.' },
      { name: 'Matratzendruck niedrig', prio: 'low', cause: 'Leck, Kompressorfehler.', action: 'Matratze prüfen; CPR-Ventil geschlossen?' }
    ],
    connections: [
      { to: 'pendant', type: 'Strom', desc: 'Netzversorgung.' },
      { to: 'defibrillator', type: 'Klinisch', desc: 'Bei Reanimation CPR-Funktion für harte Unterlage aktivieren.' },
      { to: 'art-line', type: 'Klinisch', desc: 'Höhenverstellung ändert die Lage des Patienten zum Druckwandler – Nullpunkt neu anpassen!' }
    ],
    safety: [
      'Einklemmgefahr bei Seitengittern minimieren (geeignete Matratzenhöhe).',
      'Bei Verstellung auf Leitungen, Drainagen und Tubus achten.',
      'Nach Höhenverstellung Druckwandler wieder auf Herzhöhe (phlebostatische Achse) bringen.'
    ]
  });

  R({
    id: 'pendant',
    name: 'Deckenversorgungseinheit (Medienversorgung)',
    short: 'Medienversorgung',
    category: 'Infrastruktur',
    manufacturers: ['Dräger', 'Getinge', 'Trumpf Medical (Baxter)', 'Ondal Medical', 'Starkstrom-Gerätebau'],
    standards: ['ISO 7396-1 (Rohrleitungssysteme für med. Gase)', 'ISO 9170-1 (Entnahmestellen)', 'ISO 32 (Farbkennzeichnung)', 'DIN VDE 0100-710 (Elektrische Anlagen in medizinisch genutzten Bereichen)'],
    purpose: 'Stellt am Bettplatz alle Versorgungsmedien bereit: medizinische Gase, Vakuum, Strom (inkl. Sicherheitsstromversorgung), Netzwerk und Ablagen für Geräte.',
    function: 'Schwenkbare Arme tragen eine Versorgungssäule mit Entnahmestellen. Medizinische Gase kommen aus der zentralen Gasversorgung des Krankenhauses (Tanks, Flaschenbündel, Kompressoren, Vakuumpumpen). Die Steckdosen sind auf verschiedene Stromkreise verteilt; grün markierte Steckdosen werden bei Netzausfall von der Sicherheitsstromversorgung (Netzersatzanlage) versorgt. Das IT-Netz (TN-/IT-System nach VDE 0100-710) erhöht die Versorgungssicherheit.',
    components: [
      { name: 'O₂-Entnahmestelle', desc: 'Sauerstoff – weiß gekennzeichnet (ISO 32).' },
      { name: 'Druckluft-Entnahmestelle', desc: 'Medizinische Druckluft (AIR) – schwarz/weiß gekennzeichnet.' },
      { name: 'Vakuum-Entnahmestelle', desc: 'Vakuum (VAC) – gelb gekennzeichnet.' },
      { name: 'Steckdosen (Sicherheitsstromversorgung)', desc: 'Grün: Weiterversorgung bei Netzausfall.' },
      { name: 'Netzwerkdosen (RJ45)', desc: 'Anschluss an das Medizingeräte-Netzwerk.' },
      { name: 'Potentialausgleich (PA)', desc: 'Verhindert gefährliche Potentialunterschiede zwischen Geräten.' },
      { name: 'Geräteträger & Ablagen', desc: 'Normschienen und Regalböden für Monitor, Pumpen usw.' }
    ],
    parts: [
      { name: 'O₂-Entnahmestelle', x: 42, y: 186 },
      { name: 'Druckluft-Entnahmestelle', x: 88, y: 186 },
      { name: 'Vakuum-Entnahmestelle', x: 42, y: 232 },
      { name: 'Steckdosen (Sicherheitsstromversorgung)', x: 45, y: 297 },
      { name: 'Netzwerkdosen (RJ45)', x: 65, y: 388 },
      { name: 'Potentialausgleich (PA)', x: 65, y: 412 }
    ],
    measurements: [
      { name: 'Versorgungsdruck O₂/AIR', unit: 'bar', normal: 'ca. 5 (4–5,5)', desc: 'Überwacht durch die zentrale Gasversorgung mit Alarm in der Station.' },
      { name: 'Vakuum', unit: 'bar', normal: 'ca. −0,6 bis −0,9', desc: 'Zentralvakuum.' }
    ],
    alarms: [
      { name: 'Gasdruckalarm (Stationsalarm)', prio: 'high', cause: 'Druckabfall der zentralen Gasversorgung.', action: 'Notfallplan: O₂-Flaschen bereitstellen, Haustechnik informieren, Patienten beobachten.' },
      { name: 'Isolationsüberwachung (IT-Netz)', prio: 'medium', cause: 'Erster Isolationsfehler in einem Gerät/Kabel.', action: 'Medizintechnik/Elektrotechnik informieren; Versorgung läuft weiter.' }
    ],
    connections: [
      { to: 'ventilator', type: 'Gas', desc: 'Liefert O₂ und Druckluft für das Beatmungsgerät.' },
      { to: 'suction', type: 'Gas', desc: 'Liefert Vakuum für die Absaugung.' },
      { to: 'monitor', type: 'Strom', desc: 'Strom- und Netzwerkanschluss des Monitors.' },
      { to: 'syringe-pump', type: 'Strom', desc: 'Strom für das Pumpenrack.' },
      { to: 'defibrillator', type: 'Strom', desc: 'Dauerladung des Defibrillators.' },
      { to: 'icu-bed', type: 'Strom', desc: 'Strom für Bettantriebe und Matratze.' }
    ],
    safety: [
      'Gasanschlüsse sind gasartspezifisch kodiert – Verwechslung soll konstruktiv ausgeschlossen sein.',
      'Lebenserhaltende Geräte (Beatmung, Pumpen) an Steckdosen der Sicherheitsstromversorgung anschließen.',
      'Keine Mehrfachsteckdosen ohne Freigabe verwenden (Ableitströme addieren sich!).',
      'Fett- und ölfrei arbeiten an O₂-Anschlüssen (Brand-/Explosionsgefahr).'
    ]
  });

  R({
    id: 'art-line',
    name: 'Invasive Druckmessung (Druckwandlersystem)',
    short: 'Druckwandler',
    category: 'Überwachung',
    manufacturers: ['Edwards Lifesciences', 'ICU Medical', 'BD', 'Utah Medical', 'Vygon'],
    standards: ['IEC 60601-2-34 (Invasive Blutdruckmessung)'],
    purpose: 'Kontinuierliche, schlagweise Messung des arteriellen Blutdrucks (und ggf. ZVD) – unverzichtbar bei instabilem Kreislauf und Katecholamintherapie; zudem Zugang für Blutgasanalysen.',
    function: 'Ein arterieller Katheter ist über eine flüssigkeitsgefüllte, steife Leitung mit einem Druckwandler verbunden. Der Druck verformt eine Membran mit Dehnungsmessstreifen (Wheatstone-Brücke); die Spannungsänderung ist proportional zum Druck. Ein Spülsystem mit Druckbeutel (300 mmHg) hält die Leitung mit ca. 3 ml/h offen. Der Wandler muss auf Herzhöhe (phlebostatische Achse) genullt werden: 1 cm Höhenfehler ≈ 0,74 mmHg Messfehler.',
    components: [
      { name: 'Arterieller Katheter', desc: 'Meist A. radialis oder A. femoralis.' },
      { name: 'Druckleitung', desc: 'Steife, kurze Leitung – beeinflusst Dämpfung und Resonanz.' },
      { name: 'Druckwandler (Transducer)', desc: 'Wandelt Druck in ein elektrisches Signal.' },
      { name: 'Spülsystem & Druckbeutel', desc: 'Kontinuierliche Spülung, Druckbeutel auf 300 mmHg.' },
      { name: 'Dreiwegehahn', desc: 'Zum Nullabgleich (gegen Atmosphäre) und zur Blutentnahme.' },
      { name: 'Monitorkabel', desc: 'Verbindung zum Druckmodul des Monitors.' }
    ],
    parts: [
      { name: 'Spülsystem & Druckbeutel', x: 34, y: 90 },
      { name: 'Druckwandler (Transducer)', x: 71, y: 147 },
      { name: 'Monitorkabel', x: 92, y: 160 }
    ],
    measurements: [
      { name: 'Systolischer Druck', unit: 'mmHg', normal: '100–140', desc: '' },
      { name: 'Diastolischer Druck', unit: 'mmHg', normal: '60–90', desc: '' },
      { name: 'Mittlerer arterieller Druck', unit: 'mmHg', normal: '≥ 65 (Zielwert oft)', desc: 'MAP ≈ Diastole + ⅓ (Systole − Diastole); maßgeblich für Organperfusion.' }
    ],
    alarms: [
      { name: 'Gedämpfte Kurve', prio: 'low', cause: 'Luftblase, Gerinnsel, Abknicken, zu weiche Leitung.', action: 'Leitung spülen/entlüften, Katheterlage prüfen; Fast-Flush-Test.' },
      { name: 'Druck niedrig / Kurve flach', prio: 'high', cause: 'Echter Kreislaufstillstand – oder Diskonnektion (Blutungsgefahr!).', action: 'Patient prüfen; Verbindung kontrollieren.' },
      { name: 'Nullabgleich erforderlich', prio: 'low', cause: 'Neu angeschlossen oder Lagewechsel.', action: 'Auf Herzhöhe zur Atmosphäre öffnen und nullen.' }
    ],
    connections: [
      { to: 'monitor', type: 'Signal', desc: 'Liefert das ART-Signal für Kurve und Zahlenwerte.' },
      { to: 'bga', type: 'Klinisch', desc: 'Arterielle Blutentnahme für die Blutgasanalyse.' },
      { to: 'icu-bed', type: 'Klinisch', desc: 'Lageänderung des Bettes erfordert Anpassung der Wandlerhöhe.' }
    ],
    safety: [
      'Wandler auf phlebostatischer Achse (4. ICR, mittlere Axillarlinie) positionieren und nullen.',
      'Luftfreies System – Luftblasen verfälschen die Kurve und sind eine Emboliegefahr.',
      'Arterielle Leitungen eindeutig kennzeichnen – Fehlinjektion von Medikamenten vermeiden!',
      'Diskonnektion führt zu schneller Blutung: Luer-Lock-Verbindungen und Alarmgrenzen nutzen.'
    ],
    sim: 'bloodpressure'
  });

  R({
    id: 'feeding-pump',
    name: 'Enterale Ernährungspumpe',
    short: 'Ernährungspumpe',
    category: 'Infusion',
    manufacturers: ['Fresenius Kabi', 'Nutricia (Danone)', 'B. Braun', 'Moog', 'Cardinal Health'],
    standards: ['IEC 60601-2-24', 'ISO 80369-3 (ENFit-Verbinder)'],
    purpose: 'Gleichmäßige Zufuhr von Sondennahrung über Magen- oder Dünndarmsonde.',
    function: 'Eine Rollenpumpe fördert die Sondennahrung mit eingestellter Rate. Spezielle, nicht mit Luer kompatible Verbinder (ENFit) verhindern versehentliche intravenöse Gabe.',
    components: [
      { name: 'Rollenpumpwerk', desc: 'Fördert die Nahrung durch das Überleitsystem.' },
      { name: 'ENFit-Überleitsystem', desc: 'Farbig (lila) und inkompatibel zu i.v.-Zugängen.' },
      { name: 'Display', desc: 'Rate, Dosis, Spülprogramm.' }
    ],
    measurements: [
      { name: 'Förderrate', unit: 'ml/h', normal: '20–100', desc: 'Langsamer Kostaufbau.' },
      { name: 'Gegebene Menge', unit: 'ml', normal: '–', desc: 'Für die Bilanz.' }
    ],
    alarms: [
      { name: 'Okklusion', prio: 'medium', cause: 'Sonde verstopft oder abgeknickt.', action: 'Sonde spülen, Lage prüfen.' },
      { name: 'Behälter leer', prio: 'low', cause: 'Nahrung verbraucht.', action: 'Nachfüllen oder beenden.' }
    ],
    connections: [
      { to: 'central-station', type: 'Daten', desc: 'Bilanzierung im PDMS.' },
      { to: 'icu-bed', type: 'Klinisch', desc: 'Oberkörperhochlage verringert Aspirationsgefahr.' }
    ],
    safety: [
      'Verwechslungsgefahr: enterale und intravenöse Systeme strikt trennen (ENFit).',
      'Aspiration vermeiden: Oberkörper hochlagern, Magenresidualvolumen nach Standard prüfen.'
    ]
  });

  R({
    id: 'bga',
    name: 'Blutgasanalysegerät (POCT)',
    short: 'Blutgasanalyse',
    category: 'Labor / POCT',
    manufacturers: ['Radiometer', 'Siemens Healthineers', 'Werfen', 'Roche', 'Abbott'],
    mdr: 'IVD (IVDR)',
    standards: ['ISO 15197 / ISO 22870 (POCT-Anforderungen)', 'Rili-BÄK (Qualitätssicherung)'],
    purpose: 'Schnelle Bestimmung von Blutgasen (pO₂, pCO₂), pH, Elektrolyten, Laktat und Hämoglobin direkt auf Station – Grundlage für Beatmungs- und Therapieentscheidungen.',
    function: 'Elektrochemische Sensoren messen: pH und Elektrolyte potentiometrisch (ionenselektive Elektroden), pCO₂ über die Severinghaus-Elektrode, pO₂ amperometrisch (Clark-Elektrode), Laktat/Glukose enzymatisch. Hämoglobin-Derivate (CO-Hb, Met-Hb) werden per CO-Oxymetrie spektralphotometrisch bestimmt.',
    components: [
      { name: 'Probeneinlass', desc: 'Ansaugen aus Spritze oder Kapillare.' },
      { name: 'Sensorkassette', desc: 'Elektroden für pH, pCO₂, pO₂, Elektrolyte, Metabolite.' },
      { name: 'CO-Oxymetrie-Modul', desc: 'Spektralphotometrie der Hämoglobinfraktionen.' },
      { name: 'Reagenzien-/Kalibrierpack', desc: 'Kalibrierlösungen und Abfall.' },
      { name: 'Datenschnittstelle', desc: 'Übertragung ans Labor-/Krankenhausinformationssystem.' }
    ],
    measurements: [
      { name: 'pH', unit: '–', normal: '7,35–7,45', desc: '' },
      { name: 'paCO₂', unit: 'mmHg', normal: '35–45', desc: 'Steuerung über das Atemminutenvolumen.' },
      { name: 'paO₂', unit: 'mmHg', normal: '80–100 (Raumluft)', desc: 'Steuerung über FiO₂ und PEEP.' },
      { name: 'HCO₃⁻ / BE', unit: 'mmol/l', normal: '22–26 / ±2', desc: 'Metabolische Komponente.' },
      { name: 'Laktat', unit: 'mmol/l', normal: '< 2', desc: 'Marker für Gewebshypoxie.' },
      { name: 'Kalium', unit: 'mmol/l', normal: '3,5–5,0', desc: '' }
    ],
    alarms: [
      { name: 'Luftblase / Gerinnsel erkannt', prio: 'medium', cause: 'Probe nicht luftfrei oder geronnen.', action: 'Neue Probe – Luft verfälscht pO₂.' },
      { name: 'Qualitätskontrolle fällig/fehlerhaft', prio: 'medium', cause: 'Interne QK außerhalb des Bereichs.', action: 'Gerät gesperrt – Kalibrierung/Wartung.' }
    ],
    connections: [
      { to: 'art-line', type: 'Klinisch', desc: 'Probe wird meist aus der arteriellen Leitung entnommen.' },
      { to: 'ventilator', type: 'Klinisch', desc: 'Ergebnisse führen zur Anpassung der Beatmung.' },
      { to: 'central-station', type: 'Daten', desc: 'Ergebnisse erscheinen im PDMS/Laborsystem.' }
    ],
    safety: [
      'Proben luftfrei und zeitnah messen (Stoffwechsel in der Spritze verändert Werte).',
      'Point-of-Care-Testing unterliegt der Qualitätssicherung nach Rili-BÄK.',
      'Nur eingewiesenes Personal mit Benutzerkennung darf messen.'
    ]
  });
})();
