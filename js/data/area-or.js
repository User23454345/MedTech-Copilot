/* =====================================================================
   Bereich: Operationssaal
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT, R = MT.registerDevice;

  R({
    id: 'anesthesia-machine', name: 'Narkosegerät (Anästhesiearbeitsplatz)', short: 'Narkosegerät', category: 'Atmung',
    manufacturers: ['Dräger', 'GE HealthCare', 'Getinge (Maquet)', 'Mindray', 'Löwenstein Medical'], mdr: 'IIb',
    standards: ['ISO 80601-2-13 (Anästhesie-Arbeitsplätze)', 'ISO 80601-2-55 (Atemgasmonitore)'],
    purpose: 'Beatmet den Patienten während der Allgemeinanästhesie und führt dosiert Inhalationsanästhetika (z. B. Sevofluran, Desfluran) und Sauerstoff zu.',
    function: 'Frischgas (O₂, Luft, ggf. N₂O) wird über elektronische oder mechanische Flowmeter dosiert und durch einen Verdampfer geleitet, der eine genau eingestellte Konzentration des volatilen Anästhetikums zugibt. Das Gas gelangt in ein halbgeschlossenes Kreissystem: Ausgeatmetes Gas wird über einen CO₂-Absorber (Atemkalk) von Kohlendioxid befreit und wiederverwendet – das spart Narkosegas und erhält Wärme und Feuchte. Ein integrierter Ventilator beatmet volumen- oder druckkontrolliert; ein Gasmonitor misst O₂, CO₂ und Anästhetikakonzentration (in- und exspiratorisch) per Infrarotspektroskopie bzw. paramagnetisch. Überschüssiges Gas wird über die Narkosegasabsaugung abgeleitet.',
    components: [
      { name: 'Bildschirm & Gasmonitoring', desc: 'Kurven, Beatmungswerte, In-/Exspirationskonzentrationen von O₂, CO₂ und Anästhetikum (MAC).' },
      { name: 'Verdampfer Sevofluran', desc: 'Gibt eine eingestellte Vol.-% Sevofluran zum Frischgas; farbcodiert (gelb) mit Füllsystem gegen Verwechslung.' },
      { name: 'Verdampfer Desfluran', desc: 'Beheizter, druckgeregelter Verdampfer (Desfluran siedet bei ca. 23 °C); farbcodiert (blau).' },
      { name: 'Frischgasdosierung (Flowmeter)', desc: 'Stellt O₂-, Luft- und ggf. N₂O-Flow ein; O₂-Verhältnisregelung verhindert hypoxische Gemische.' },
      { name: 'CO₂-Absorber (Atemkalk)', desc: 'Bindet CO₂ chemisch; Farbindikator zeigt Erschöpfung an.' },
      { name: 'Handbeatmungsbeutel', desc: 'Manuelle Beatmung bei Einleitung/Ausleitung oder Geräteausfall; APL-Ventil begrenzt den Druck.' },
      { name: 'Narkosegasabsaugung (AGSS)', desc: 'Leitet überschüssiges Narkosegas aus dem Raum ab (Arbeitsschutz).' }
    ],
    parts: [
      { name: 'Bildschirm & Gasmonitoring', x: 130, y: 75 },
      { name: 'Verdampfer Sevofluran', x: 54, y: 188 },
      { name: 'Verdampfer Desfluran', x: 100, y: 188 },
      { name: 'Frischgasdosierung (Flowmeter)', x: 163, y: 188 },
      { name: 'CO₂-Absorber (Atemkalk)', x: 68, y: 286 },
      { name: 'Handbeatmungsbeutel', x: 120, y: 270 }
    ],
    measurements: [
      { name: 'Exspiratorische Anästhetikakonzentration', unit: 'Vol.-% / MAC', normal: 'ca. 0,7–1,3 MAC', desc: 'MAC = minimale alveoläre Konzentration, bei der 50 % nicht auf den Hautschnitt reagieren (Sevofluran ≈ 2 Vol.-% bei Erwachsenen mittleren Alters).' },
      { name: 'etCO₂', unit: 'mmHg', normal: '35–45', desc: 'Bestätigt die Tubuslage und überwacht die Ventilation.' },
      { name: 'FiO₂ / FeO₂', unit: '%', normal: '≥ 30 meist', desc: 'In- und exspiratorischer Sauerstoff.' },
      { name: 'Frischgasflow', unit: 'l/min', normal: 'Low-Flow 0,5–1', desc: 'Niedriger Flow spart Narkosegas, erfordert gutes Monitoring.' },
      { name: 'Atemwegsdruck / VT / AF', unit: 'cmH₂O / ml / min⁻¹', normal: 'wie Intensivbeatmung', desc: '' }
    ],
    alarms: [
      { name: 'O₂-Versorgungsdruck niedrig', prio: 'high', cause: 'Zentrale Gasversorgung gestört, Schlauch nicht gesteckt.', action: 'Auf O₂-Reserveflasche umschalten, ggf. Handbeatmung.' },
      { name: 'Apnoe / etCO₂ fehlt', prio: 'high', cause: 'Diskonnektion, Tubusfehllage, Kreislaufstillstand.', action: 'Patient und Kreissystem sofort prüfen.' },
      { name: 'Inspiratorisches CO₂ erhöht', prio: 'medium', cause: 'Atemkalk erschöpft, Ventil im Kreissystem defekt.', action: 'Atemkalk wechseln, Frischgasflow erhöhen.' },
      { name: 'Anästhetikakonzentration hoch/niedrig', prio: 'medium', cause: 'Verdampfer falsch eingestellt oder leer.', action: 'Einstellung und Füllstand prüfen.' },
      { name: 'Leckage', prio: 'medium', cause: 'Undichtes Kreissystem, Tubus-Cuff.', action: 'Dichtigkeitstest, Cuffdruck prüfen.' }
    ],
    connections: [
      { to: 'pendant', type: 'Gas', desc: 'O₂, Druckluft und Narkosegasabsaugung über die Deckenversorgung; zusätzlich O₂-Reserveflasche am Gerät.' },
      { to: 'monitor', type: 'Daten', desc: 'Gas- und Beatmungswerte werden mit den Vitalparametern zusammen dokumentiert.' },
      { to: 'syringe-pump', type: 'Klinisch', desc: 'Bei TIVA (total intravenöse Anästhesie) ersetzen Spritzenpumpen den Verdampfer.' },
      { to: 'suction', type: 'Klinisch', desc: 'Absaugung muss vor jeder Narkoseeinleitung bereitstehen.' },
      { to: 'or-table', type: 'Klinisch', desc: 'Lagerungsänderungen des OP-Tisches können Tubus und Schläuche verschieben.' }
    ],
    safety: [
      'Vor jedem Narkosetag/jeder Narkose Gerätecheck nach Herstellervorgabe (Selbsttest, Dichtigkeit, Notbeatmung möglich).',
      'Beatmungsbeutel mit Maske und O₂-Flasche als Rückfallebene bereithalten.',
      'Kapnographie ist Standard zur Bestätigung der Tubuslage.',
      'Verdampfer nur mit dem passenden, kodierten Füllsystem befüllen; nie zwei Verdampfer gleichzeitig öffnen (Interlock).',
      'Narkosegasabsaugung anschließen – Schutz des Personals vor Narkosegasexposition.',
      'MPBetreibV Anlage 1 (maschinelle Beatmung mit Anästhesie): Einweisung, STK.'
    ],
    sim: 'ventilation',
    tip: 'Atemkalk ändert bei Erschöpfung meist die Farbe – ein Anstieg des inspiratorischen CO₂ (FiCO₂ > 0) ist aber der zuverlässigere Hinweis.'
  });

  R({
    id: 'or-table', name: 'OP-Tisch', short: 'OP-Tisch', category: 'Lagerung',
    manufacturers: ['Getinge (Maquet)', 'Trumpf Medical (Baxter)', 'Stryker', 'Schmitz u. Söhne', 'Steris'], mdr: 'I',
    standards: ['IEC 60601-2-46 (Operationstische)'],
    purpose: 'Lagert den Patienten sicher und für den Eingriff optimal (z. B. Rückenlage, Seitenlage, Steinschnitt, Trendelenburg).',
    function: 'Eine elektrohydraulisch oder elektromotorisch verstellbare Säule trägt eine modulare Liegefläche. Kopf-, Rücken- und Beinplatten sind einzeln verstellbar; viele Liegeflächen sind röntgendurchlässig (Carbon) für intraoperative Bildgebung. Gelpolster und Lagerungshilfen verhindern Druckschäden.',
    components: [
      { name: 'Säule mit Antrieb', desc: 'Höhe, Neigung und Kantung.' },
      { name: 'Modulare Liegefläche', desc: 'Austauschbare Platten, oft röntgendurchlässig.' },
      { name: 'Bedienteil (Fernbedienung)', desc: 'Kabelgebunden oder Funk; Notbedienung an der Säule.' },
      { name: 'Lagerungszubehör', desc: 'Armausleger, Beinhalter, Gelauflagen, Gurte.' }
    ],
    measurements: [
      { name: 'Neigung / Kantung', unit: '°', normal: '–', desc: 'Anzeige am Bedienteil.' },
      { name: 'Maximale Patientenlast', unit: 'kg', normal: 'gerätespezifisch', desc: 'Sicherheitsgrenze beachten.' }
    ],
    alarms: [
      { name: 'Kollisionswarnung', prio: 'medium', cause: 'Bewegung blockiert, Bauteil im Weg.', action: 'Bewegung stoppen, Hindernis entfernen.' },
      { name: 'Akku schwach', prio: 'low', cause: 'Netzunabhängiger Betrieb.', action: 'An Netz anschließen.' }
    ],
    connections: [
      { to: 'c-arm', type: 'Strahlung', desc: 'Röntgendurchlässige Liegefläche ermöglicht Durchleuchtung mit dem C-Bogen.' },
      { to: 'anesthesia-machine', type: 'Klinisch', desc: 'Lagerungsänderungen mit der Anästhesie abstimmen (Tubus, Zugänge).' },
      { to: 'esu', type: 'Klinisch', desc: 'Patient darf keinen Kontakt zu geerdeten Metallteilen haben (Gefahr von Verbrennungen bei HF-Chirurgie).' }
    ],
    safety: [
      'Lagerungsschäden vermeiden: Druckstellen polstern, Nervendehnung (Plexus brachialis) vermeiden.',
      'Patient sichern (Gurte) vor Kippbewegungen.',
      'Haut-Metall-Kontakt vermeiden (HF-Chirurgie).'
    ]
  });

  R({
    id: 'or-light', name: 'OP-Leuchte', short: 'OP-Leuchte', category: 'Infrastruktur',
    manufacturers: ['Getinge (Maquet)', 'Trumpf Medical (Baxter)', 'Dräger', 'Steris', 'Stryker'],
    standards: ['IEC 60601-2-41 (OP- und Untersuchungsleuchten)'],
    purpose: 'Schattenarme, farbtreue und intensive Ausleuchtung des Operationsfeldes.',
    function: 'Viele LED-Module mit unterschiedlichen Einstrahlwinkeln überlagern sich im Fokus. Verdeckt ein Kopf einen Teil der Module, leuchten die übrigen weiter – das reduziert Schlagschatten. Die Beleuchtungsstärke liegt im Zentrum typischerweise bei 40 000–160 000 lx bei möglichst geringer Wärmeabstrahlung. Ein steriler Griff erlaubt die Positionierung durch das OP-Team; häufig sind Kameras integriert.',
    components: [
      { name: 'LED-Leuchtenköpfe', desc: 'Zwei Leuchtkörper (Haupt- und Satellitenleuchte).' },
      { name: 'Federarmsystem', desc: 'Deckenmontierte Gelenkarme.' },
      { name: 'Sterilgriff', desc: 'Einweg- oder sterilisierbare Griffe zur Positionierung.' },
      { name: 'Steuerung', desc: 'Helligkeit, Farbtemperatur, Lichtfeldgröße, Endo-Licht.' }
    ],
    measurements: [
      { name: 'Zentralbeleuchtungsstärke', unit: 'lx', normal: '40 000–160 000', desc: '' },
      { name: 'Farbtemperatur', unit: 'K', normal: '3 000–6 700', desc: '' },
      { name: 'Farbwiedergabeindex Ra', unit: '–', normal: '≥ 85', desc: 'Wichtig zur Gewebedifferenzierung.' }
    ],
    alarms: [
      { name: 'LED-Modul defekt', prio: 'low', cause: 'Einzelne LEDs ausgefallen.', action: 'Medizintechnik informieren.' },
      { name: 'Umschaltung Notstrom', prio: 'medium', cause: 'Netzausfall – Leuchte läuft über Sicherheitsstromversorgung/Akku.', action: 'Betrieb prüfen.' }
    ],
    connections: [
      { to: 'or-table', type: 'Klinisch', desc: 'Leuchtfeld wird auf das OP-Gebiet am Tisch ausgerichtet.' },
      { to: 'endoscopy-tower', type: 'Daten', desc: 'Integrierte Kameras können Bilder ins OP-Videosystem einspeisen.' }
    ],
    safety: [
      'Unterbrechungsfreie Stromversorgung: OP-Leuchten müssen bei Netzausfall innerhalb von 0,5 s weiterleuchten.',
      'Wärmeeintrag ins Gewebe begrenzen (Austrocknung).',
      'Sterilgriff nur durch steriles Personal bedienen.'
    ]
  });

  R({
    id: 'esu', name: 'HF-Chirurgiegerät (Elektrochirurgie)', short: 'HF-Chirurgie', category: 'Therapie',
    manufacturers: ['Erbe Elektromedizin', 'Medtronic', 'Olympus', 'B. Braun (Aesculap)', 'KLS Martin'], mdr: 'IIb',
    standards: ['IEC 60601-2-2 (HF-Chirurgiegeräte)'],
    purpose: 'Schneiden und Koagulieren (Blutstillung) von Gewebe mit hochfrequentem Wechselstrom.',
    function: 'Hochfrequenter Wechselstrom (ca. 300 kHz–4 MHz) reizt Nerven und Muskeln nicht mehr (keine Faradisierung), erwärmt aber das Gewebe durch den elektrischen Widerstand. Hohe Stromdichte an einer kleinen Elektrode erzeugt Temperaturen > 100 °C: Zellwasser verdampft (Schneiden) oder Eiweiß denaturiert (Koagulation). Monopolar fließt der Strom vom Instrument durch den Körper zur großflächigen Neutralelektrode (NE), wo die Stromdichte gering bleibt. Bipolar fließt er nur zwischen den beiden Branchen einer Pinzette.',
    components: [
      { name: 'Anzeige Schneiden (CUT)', desc: 'Leistung/Effekt für Schneidmodi.' },
      { name: 'Anzeige Koagulation (COAG)', desc: 'Leistung/Effekt für Koagulationsmodi.' },
      { name: 'Instrumentenbuchsen', desc: 'Anschlüsse für monopolare und bipolare Instrumente.' },
      { name: 'NE-Überwachung', desc: 'Kontaktqualitätsüberwachung geteilter Neutralelektroden (Impedanzmessung).' },
      { name: 'Fußschalter', desc: 'Aktivierung von Schneiden und Koagulation.' }
    ],
    parts: [
      { name: 'Anzeige Schneiden (CUT)', x: 46, y: 33 },
      { name: 'Anzeige Koagulation (COAG)', x: 130, y: 33 },
      { name: 'Instrumentenbuchsen', x: 52, y: 90 },
      { name: 'NE-Überwachung', x: 130, y: 90 }
    ],
    measurements: [
      { name: 'Ausgangsleistung', unit: 'W', normal: 'je nach Modus 10–200', desc: '' },
      { name: 'NE-Übergangswiderstand', unit: 'Ω', normal: 'im Grünbereich', desc: 'Bei geteilter NE wird die Kontaktfläche überwacht.' },
      { name: 'Frequenz', unit: 'kHz', normal: '≈ 300–4 000', desc: 'Oberhalb der Reizschwelle von Nerven/Muskeln.' }
    ],
    alarms: [
      { name: 'Neutralelektrode – Kontakt ungenügend', prio: 'high', cause: 'NE abgelöst, falsch platziert, Kabel nicht gesteckt.', action: 'Aktivierung gesperrt: NE prüfen und korrekt anbringen.' },
      { name: 'Aktivierung zu lang', prio: 'medium', cause: 'Fußschalter dauerhaft gedrückt.', action: 'Aktivierung beenden, Verletzungsgefahr.' },
      { name: 'Gerätefehler', prio: 'medium', cause: 'Selbsttest fehlgeschlagen.', action: 'Ersatzgerät, Medizintechnik.' }
    ],
    connections: [
      { to: 'or-table', type: 'Klinisch', desc: 'Patient isoliert lagern – kein Kontakt zu leitfähigen Tischteilen.' },
      { to: 'monitor', type: 'Signal', desc: 'HF-Störungen können EKG-Kurven überlagern (Artefakt während der Aktivierung).' },
      { to: 'endoscopy-tower', type: 'Klinisch', desc: 'In der Laparoskopie werden HF-Instrumente durch Trokare eingeführt.' },
      { to: 'pendant', type: 'Strom', desc: 'Netzanschluss und Potentialausgleich.' }
    ],
    safety: [
      'Neutralelektrode vollflächig auf gut durchblutete Muskulatur nahe dem OP-Gebiet kleben – nicht über Knochen, Narben, Metallimplantate.',
      'Stromweg kurz halten und nicht durch Herz oder Schrittmacher führen; bei Schrittmacherträgern bipolar bevorzugen.',
      'Brandgefahr: alkoholische Desinfektionsmittel vollständig abtrocknen lassen, O₂-Anreicherung unter Abdeckungen vermeiden.',
      'Leistung so niedrig wie möglich wählen; Instrumente in isolierten Köchern ablegen.',
      'MPBetreibV Anlage 1 (Erzeugung von Energie zur Koagulation): Einweisung, STK.'
    ]
  });

  R({
    id: 'endoscopy-tower', name: 'Laparoskopie-/Endoskopieturm', short: 'Endoskopieturm', category: 'Bildgebung',
    manufacturers: ['Karl Storz', 'Olympus', 'Stryker', 'Richard Wolf', 'B. Braun (Aesculap)'], mdr: 'IIa',
    standards: ['IEC 60601-2-18 (Endoskopische Geräte)'],
    purpose: 'Minimalinvasive Chirurgie: Darstellung des Bauchraums über Optik und Kamera, Aufbau eines Arbeitsraumes mit CO₂.',
    function: 'Eine Kaltlichtquelle (LED/Xenon) leitet Licht über ein Glasfaserkabel in die Optik. Der Kamerakopf wandelt das Bild in ein Videosignal (HD/4K, ggf. 3D oder Fluoreszenz), das auf dem Monitor angezeigt wird. Der Insufflator füllt den Bauchraum mit CO₂ und regelt den intraabdominellen Druck (typ. 12–15 mmHg). Eine Saug-Spül-Einheit hält das Sichtfeld frei.',
    components: [
      { name: 'Monitor', desc: 'Medizinischer Bildschirm im Sichtfeld der Operateure.' },
      { name: 'Kamerakontrolleinheit', desc: 'Bildverarbeitung, Weißabgleich, Aufzeichnung.' },
      { name: 'Lichtquelle', desc: 'Kaltlicht über Lichtleitkabel – Lichtkabelende wird sehr heiß!' },
      { name: 'CO₂-Insufflator', desc: 'Regelt Druck und Flow des Pneumoperitoneums.' },
      { name: 'Saug-Spül-Pumpe', desc: 'Spült und saugt im Operationsgebiet.' }
    ],
    parts: [
      { name: 'Monitor', x: 100, y: 65 },
      { name: 'Kamerakontrolleinheit', x: 100, y: 186 },
      { name: 'Lichtquelle', x: 100, y: 248 },
      { name: 'CO₂-Insufflator', x: 100, y: 310 },
      { name: 'Saug-Spül-Pumpe', x: 100, y: 372 }
    ],
    measurements: [
      { name: 'Intraabdomineller Druck', unit: 'mmHg', normal: '12–15 (Erw.)', desc: 'Zu hoher Druck beeinträchtigt Atmung und venösen Rückstrom.' },
      { name: 'CO₂-Flow', unit: 'l/min', normal: '1–40', desc: '' },
      { name: 'CO₂-Verbrauch', unit: 'l', normal: '–', desc: 'Resorbiertes CO₂ erhöht das etCO₂.' }
    ],
    alarms: [
      { name: 'Überdruck', prio: 'high', cause: 'Druck über Sollwert (z. B. Pressen des Patienten).', action: 'Gerät entlüftet automatisch; Narkosetiefe prüfen.' },
      { name: 'CO₂-Flasche leer', prio: 'medium', cause: 'Gasvorrat erschöpft.', action: 'Flasche wechseln bzw. Zentralversorgung prüfen.' },
      { name: 'Kein Videosignal', prio: 'medium', cause: 'Kamerakabel, Einstellung.', action: 'Verbindungen prüfen.' }
    ],
    connections: [
      { to: 'anesthesia-machine', type: 'Klinisch', desc: 'Pneumoperitoneum erhöht Beatmungsdrücke und etCO₂ – Beatmung anpassen.' },
      { to: 'esu', type: 'Klinisch', desc: 'HF-Instrumente arbeiten im Sichtfeld der Kamera.' },
      { to: 'pendant', type: 'Strom', desc: 'Strom; CO₂ teils aus der Zentralversorgung.' }
    ],
    safety: [
      'Lichtkabel nie auf Abdecktücher oder Haut legen, solange die Lichtquelle an ist (Brandgefahr).',
      'Insufflationsdruck so niedrig wie möglich.',
      'Weißabgleich vor Beginn für farbtreue Darstellung.'
    ]
  });

  R({
    id: 'c-arm', name: 'Mobiler C-Bogen (Röntgen)', short: 'C-Bogen', category: 'Bildgebung',
    manufacturers: ['Siemens Healthineers', 'Philips', 'GE HealthCare', 'Ziehm Imaging', 'Canon Medical'], mdr: 'IIb',
    standards: ['IEC 60601-2-54 (Radiographie und Durchleuchtung)', 'IEC 60601-2-43 (interventionelles Röntgen)'],
    purpose: 'Intraoperative Röntgendurchleuchtung, z. B. zur Kontrolle von Knochenbrüchen, Implantaten und Kathetern.',
    function: 'Röntgenröhre und Bilddetektor (heute meist Flachdetektor) stehen sich am C-förmigen Bogen gegenüber und lassen sich um den Patienten drehen. Durchleuchtung erfolgt gepulst mit niedriger Dosis; das letzte Bild wird gespeichert (Last Image Hold). Eine Dosisautomatik regelt kV und mA nach der Bildhelligkeit.',
    components: [
      { name: 'Bilddetektor', desc: 'Flachdetektor (oder Bildverstärker) – möglichst nah am Patienten.' },
      { name: 'Röntgenröhre', desc: 'Erzeugt die Strahlung; Kollimator blendet das Strahlenfeld ein.' },
      { name: 'C-Bogen', desc: 'Mechanik für Orbital- und Angulationsbewegung.' },
      { name: 'Gerätewagen', desc: 'Generator, Steuerung, Akku.' },
      { name: 'Monitorwagen', desc: 'Bildanzeige, Speicherung, PACS-Anbindung.' }
    ],
    parts: [
      { name: 'Bilddetektor', x: 205, y: 58 },
      { name: 'Röntgenröhre', x: 205, y: 361 },
      { name: 'C-Bogen', x: 62, y: 210 },
      { name: 'Gerätewagen', x: 285, y: 320 }
    ],
    measurements: [
      { name: 'Röhrenspannung', unit: 'kV', normal: '40–120', desc: 'Automatisch geregelt.' },
      { name: 'Durchleuchtungszeit', unit: 's/min', normal: 'so kurz wie möglich', desc: '' },
      { name: 'Dosisflächenprodukt (DFP)', unit: 'µGy·m² bzw. cGy·cm²', normal: 'dokumentationspflichtig', desc: 'Maß für die Strahlenexposition des Patienten.' }
    ],
    alarms: [
      { name: 'Durchleuchtungszeit-Warnung', prio: 'medium', cause: 'Akustisches Signal nach festgelegter Durchleuchtungsdauer (z. B. 5 min).', action: 'Notwendigkeit prüfen, Dosis bewusst machen.' },
      { name: 'Überhitzung Röhre', prio: 'medium', cause: 'Hohe Belastung.', action: 'Pause einlegen.' }
    ],
    connections: [
      { to: 'or-table', type: 'Strahlung', desc: 'Durchleuchtung durch die röntgendurchlässige Tischplatte.' },
      { to: 'pacs-workstation', type: 'Daten', desc: 'Bilder werden im DICOM-Format ins PACS übertragen.' },
      { to: 'pendant', type: 'Strom', desc: 'Netzanschluss.' }
    ],
    safety: [
      'Strahlenschutz nach StrlSchG/StrlSchV: Schürze und Schilddrüsenschutz, Personendosimeter, Abstand halten (Dosis nimmt mit dem Quadrat der Entfernung ab).',
      'Röhre unten, Detektor oben und nah am Patienten – weniger Streustrahlung für das Personal.',
      'Strahlenfeld einblenden, gepulst durchleuchten, Last Image Hold nutzen.',
      'Anwendung nur durch Personen mit erforderlicher Fachkunde bzw. Kenntnissen im Strahlenschutz.'
    ],
    sim: 'imaging'
  });

  MT.registerArea({
    id: 'or', name: 'Operationssaal', short: 'OP', icon: '🔪', color: '#16a085',
    sign: 'OP-Saal 2', signSub: 'Lernumgebung · fiktive Patientin',
    description: 'Ein Operationssaal für laparoskopische Eingriffe: Narkosearbeitsplatz, OP-Tisch und -Leuchte, HF-Chirurgie, Endoskopieturm und mobiler C-Bogen. Anästhesie und Chirurgie teilen sich Raum, Infrastruktur und Verantwortung.',
    patientInfo: 'Lernpatientin „P-21“ (fiktiv) · 52 J. · 68 kg · laparoskopische Cholezystektomie · Allgemeinanästhesie, intubiert',
    room: { wall: '#eaf5f2', wall2: '#d6ebe6', floor: '#b8cfc9', floor2: '#9fbab3', horizon: 640 },
    decor: [{ visual: 'cart', x: 1080, y: 690, w: 170 }],
    placements: [
      { device: 'pendant', visual: 'pendant', x: 40, y: 34, w: 120, labelY: 470, labelX: 100 },
      { device: 'suction', visual: 'suction', x: 4, y: 590, w: 72 },
      { device: 'syringe-pump', visual: 'pump-stack', x: 420, y: 250, w: 120, opts: { noIV: true, pumps: [{ label: 'Propofol 1 %', rate: '25', color: 'rgba(255,255,255,.95)', fill: 70 }, { label: 'Remifentanil', rate: '8,0', color: 'rgba(200,240,255,.9)', fill: 50 }, { label: 'Noradrenalin', rate: '2,1', color: 'rgba(255,230,160,.9)', fill: 35 }] } },
      { device: 'anesthesia-machine', visual: 'anesthesia', x: 170, y: 330, w: 230, live: { type: 'ventilator', screen: [38, 18, 184, 112] } },
      { device: 'monitor', visual: 'monitor', x: 196, y: 92, w: 220, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'endoscopy-tower', visual: 'tower', x: 1110, y: 270, w: 170 },
      { device: 'c-arm', visual: 'c-arm', x: 1290, y: 420, w: 290 },
      { device: 'or-table', visual: 'or-table', x: 470, y: 560, w: 620 },
      { device: 'esu', visual: 'esu', x: 1090, y: 606, w: 150 },
      { device: 'or-light', visual: 'or-light', x: 570, y: 34, w: 440, labelY: 300 }
    ],
    hosesBehind: [
      '<ellipse cx="790" cy="760" rx="420" ry="105" fill="rgba(22,160,133,.10)" stroke="rgba(22,160,133,.45)" stroke-width="3" stroke-dasharray="14 10"/>',
      '<text x="400" y="868" font-size="15" fill="#0f6b59" font-family="system-ui" font-weight="700">Steriler Bereich</text>',
      '<path d="M82 220 C 90 380, 180 380, 230 420" stroke="#fff" stroke-width="7" fill="none" filter="url(#f-soft)"/>',
      '<path d="M128 220 C 150 360, 230 370, 260 420" stroke="#222" stroke-width="7" fill="none"/><path d="M128 220 C 150 360, 230 370, 260 420" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="8 8"/>'
    ],
    hosesFront: [
      '<path d="M384 560 C 450 540, 480 600, 520 636" stroke="#8cc4f0" stroke-width="11" fill="none" stroke-linecap="round"/>',
      '<path d="M384 590 C 460 600, 490 630, 524 642" stroke="#c9d3dd" stroke-width="11" fill="none" stroke-linecap="round"/>',
      '<path d="M1150 690 C 1100 740, 980 700, 900 650" stroke="#2a3038" stroke-width="3" fill="none"/>',
      '<path d="M1120 690 C 1060 800, 860 780, 760 668" stroke="#3b8de0" stroke-width="3" fill="none" stroke-dasharray="6 4"/>',
      '<path d="M1150 400 C 1120 520, 980 560, 860 640" stroke="#888" stroke-width="3" fill="none"/>'
    ],
    scenarios: ['or-induction', 'or-esu'],
    learningGoals: [
      'Aufbau und Funktion des Narkosegeräts (Kreissystem, Verdampfer, Atemkalk) erklären',
      'Gerätecheck vor der Narkose und Rückfallebenen benennen',
      'Monopolare und bipolare HF-Chirurgie und die Rolle der Neutralelektrode verstehen',
      'Zusammenspiel Laparoskopie – Beatmung (CO₂-Pneumoperitoneum) erkennen',
      'Strahlenschutz beim mobilen C-Bogen anwenden'
    ],
    facts: [
      'Das Kreissystem des Narkosegeräts führt ausgeatmetes Gas nach CO₂-Entfernung zurück – Narkosegas, Wärme und Feuchte bleiben erhalten.',
      'OP-Leuchten müssen bei Netzausfall innerhalb von 0,5 s weiterversorgt werden.',
      'HF-Chirurgie arbeitet oberhalb von ca. 300 kHz, weil Nerven und Muskeln dann nicht mehr erregt werden.',
      'Die Dosis der Streustrahlung nimmt mit dem Quadrat des Abstands ab – ein Schritt zurück hilft viel.'
    ],
    createState: function () {
      return {
        patient: MT.physio.createPatient({ hr: 66, spo2: 99, sys: 108, dia: 62, rr: 12, etco2: 35, temp: 36.4, nibpSys: 110, nibpDia: 64 }),
        vent: { mode: 'VC', vt: 480, pinsp: 15, peep: 5, rr: 12, ie: 0.5, c: 55, r: 10, fio2: 0.5, pause: 0.2, disconnected: false, obstructed: false }
      };
    }
  });

  MT.registerScenario({
    id: 'or-induction', area: 'or', title: 'Narkose: Gerätecheck und Beatmung', level: 'Einstieg', duration: '8 min',
    summary: 'Vor der Narkoseeinleitung prüfst du den Arbeitsplatz. Danach verändert das Pneumoperitoneum die Beatmung.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Lernpatientin „P-21“ (fiktiv) wird gleich für eine laparoskopische Gallenblasenentfernung narkotisiert. Bevor sie eingeschleust wird, prüft die Anästhesiepflege den Arbeitsplatz.</p>' },
      { type: 'find', device: 'anesthesia-machine', title: 'Das Herzstück', prompt: 'Welches Gerät beatmet die Patientin und dosiert das Narkosegas?', explain: 'Das <b>Narkosegerät</b> kombiniert Gasdosierung, Verdampfer, Kreissystem mit CO₂-Absorber, Ventilator und Gasmonitoring.' },
      { type: 'quiz', multi: true, title: 'Gerätecheck', question: 'Was gehört zum Check vor der Narkoseeinleitung?', options: [
        { t: 'Selbsttest/Dichtigkeitsprüfung des Narkosegeräts', correct: true },
        { t: 'O₂-Reserveflasche gefüllt, Handbeatmungsbeutel vorhanden', correct: true },
        { t: 'Absaugung funktionsfähig', correct: true },
        { t: 'Verdampfer gefüllt und korrekt eingerastet', correct: true },
        { t: 'C-Bogen auf maximale Dosis vorstellen', correct: false }
      ], fb: 'Der C-Bogen gehört nicht zum Narkosecheck – und die Dosis wird nie „vorsorglich“ maximal eingestellt.' },
      { type: 'quiz', title: 'Kreissystem', question: 'Warum enthält das Narkosegerät einen CO₂-Absorber (Atemkalk)?', options: [
        { t: 'Damit ausgeatmetes Gas ohne CO₂ wieder eingeatmet werden kann – das spart Narkosegas und erhält Wärme und Feuchte.', correct: true, fb: 'Richtig. Ohne Absorber müsste man mit sehr hohem Frischgasflow arbeiten.' },
        { t: 'Um das Narkosegas zu erzeugen.', correct: false, fb: 'Narkosegas kommt aus dem Verdampfer, nicht aus dem Atemkalk.' },
        { t: 'Um Sauerstoff aus der Luft zu konzentrieren.', correct: false, fb: 'Nein – O₂ kommt aus der zentralen Gasversorgung.' }
      ] },
      { type: 'quiz', title: 'Tubuslage', question: 'Nach der Intubation: Welcher Messwert bestätigt am zuverlässigsten, dass der Tubus in der Luftröhre liegt?', options: [
        { t: 'Eine regelmäßige CO₂-Kurve (Kapnographie) über mehrere Atemzüge', correct: true, fb: 'Richtig – nur bei Beatmung der Lunge wird CO₂ dauerhaft ausgeatmet. Bei ösophagealer Lage verschwindet das CO₂ nach wenigen Atemzügen.' },
        { t: 'Die SpO₂', correct: false, fb: 'Die SpO₂ fällt bei Fehllage erst nach Minuten (Sauerstoffreserve) – zu spät als Kontrolle.' },
        { t: 'Der Blutdruck', correct: false, fb: 'Der Blutdruck sagt nichts über die Tubuslage aus.' }
      ] },
      { type: 'find', device: 'endoscopy-tower', title: 'Pneumoperitoneum', prompt: 'Die Operation beginnt. Welches Gerät füllt den Bauchraum mit CO₂?', explain: 'Der <b>Insufflator</b> im Endoskopieturm regelt den Bauchinnendruck (typ. 12–15 mmHg).', after: function (c) { c.animate({ etco2: 46 }, 6); c.vent.c = 35; } },
      { type: 'quiz', title: 'Auswirkung auf die Beatmung', question: 'Nach Anlage des Pneumoperitoneums steigen Beatmungsdruck und etCO₂. Warum?', options: [
        { t: 'Das Zwerchfell wird nach oben gedrückt (Compliance ↓) und resorbiertes CO₂ aus dem Bauchraum muss zusätzlich abgeatmet werden.', correct: true, fb: 'Richtig – meist wird das Atemminutenvolumen erhöht. Das zeigt den Verbund Endoskopieturm ↔ Narkosegerät.' },
        { t: 'Der Atemkalk ist erschöpft.', correct: false, fb: 'Möglich, aber dann stiege das inspiratorische CO₂. Der zeitliche Zusammenhang spricht für das Pneumoperitoneum.' },
        { t: 'Die Patientin ist zu tief narkotisiert.', correct: false, fb: 'Tiefe Narkose erhöht nicht den Beatmungsdruck.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Das Narkosegerät hängt von der Gasversorgung (Medienampel, Reserveflasche) ab und wird durch das Monitoring kontrolliert. Chirurgische Geräte – wie der CO₂-Insufflator – beeinflussen direkt die Beatmung. Gute Kommunikation zwischen Anästhesie und Chirurgie ist deshalb auch eine Frage der Gerätesicherheit.</p>' }
    ]
  });

  MT.registerScenario({
    id: 'or-esu', area: 'or', title: 'HF-Chirurgie und Strahlenschutz', level: 'Fortgeschritten', duration: '7 min',
    summary: 'Neutralelektrode, Stromweg, Brandschutz und der Einsatz des C-Bogens – Sicherheitsthemen im OP.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Während der Vorbereitung wird die HF-Chirurgie aufgebaut. Später soll eine intraoperative Röntgenkontrolle erfolgen.</p>' },
      { type: 'find', device: 'esu', title: 'Gerät', prompt: 'Welches Gerät schneidet und koaguliert mit Hochfrequenzstrom?', explain: 'Das <b>HF-Chirurgiegerät</b> erzeugt Wechselstrom im Bereich mehrerer hundert Kilohertz.' },
      { type: 'quiz', title: 'Stromweg', question: 'Wie fließt der Strom bei monopolarer HF-Chirurgie?', options: [
        { t: 'Vom aktiven Instrument durch den Körper zur großflächigen Neutralelektrode und zurück zum Gerät.', correct: true, fb: 'Richtig. An der kleinen Instrumentspitze ist die Stromdichte hoch (Effekt), an der großen NE niedrig (keine Erwärmung).' },
        { t: 'Nur zwischen den Branchen der Pinzette.', correct: false, fb: 'Das beschreibt die bipolare Technik.' },
        { t: 'Vom Instrument direkt in den OP-Tisch.', correct: false, fb: 'Gerade das muss verhindert werden – Kontakt zu geerdeten Metallteilen kann Verbrennungen verursachen.' }
      ] },
      { type: 'quiz', title: 'Neutralelektrode', question: 'Wo wird die Neutralelektrode bei einer Gallenblasen-OP am besten angebracht?', options: [
        { t: 'Vollflächig auf gut durchblutete Muskulatur nahe dem OP-Gebiet, z. B. Oberarm oder Oberschenkel, nicht über Knochen oder Implantaten.', correct: true, fb: 'Richtig. Kurzer Stromweg, gute Leitfähigkeit, gleichmäßiger Kontakt.' },
        { t: 'Über dem Brustbein, damit sie gut hält.', correct: false, fb: 'Knochen und Herznähe sind ungeeignet.' },
        { t: 'Auf die Fußsohle, möglichst weit weg.', correct: false, fb: 'Ein langer Stromweg durch den Körper ist ungünstig; Hornhaut leitet schlecht.' }
      ] },
      { type: 'info', title: 'Alarm', text: '<p>Das HF-Gerät meldet <b>„Neutralelektrode – Kontakt ungenügend“</b> und lässt sich nicht aktivieren. Die Neutralelektrode hat sich durch Desinfektionsmittel an einer Ecke gelöst.</p>', enter: function (c) { c.alarmPulse('esu', true); } },
      { type: 'quiz', title: 'Warum blockiert das Gerät?', question: 'Warum sperrt das Gerät die Aktivierung?', options: [
        { t: 'Bei kleiner Kontaktfläche steigt die Stromdichte an der Neutralelektrode – es drohen Verbrennungen. Die geteilte NE erlaubt die Überwachung der Kontaktqualität.', correct: true, fb: 'Richtig – die Kontaktqualitätsüberwachung misst den Widerstand zwischen den beiden NE-Hälften.' },
        { t: 'Weil der Akku leer ist.', correct: false, fb: 'Die Meldung betrifft eindeutig die Neutralelektrode.' },
        { t: 'Weil die Leistung zu niedrig eingestellt ist.', correct: false, fb: 'Die Leistung hat mit der NE-Überwachung nichts zu tun.' }
      ], after: function (c) { c.alarmPulse('esu', false); } },
      { type: 'quiz', title: 'Brandschutz', question: 'Welche Kombination erhöht das Brandrisiko im OP besonders?', options: [
        { t: 'Nicht abgetrocknetes alkoholisches Desinfektionsmittel + HF-Funke + sauerstoffangereicherte Umgebung', correct: true, fb: 'Richtig – das Brand-Dreieck: Brennstoff, Zündquelle, Sauerstoff.' },
        { t: 'Bipolare Pinzette + Kochsalzlösung', correct: false, fb: 'Kochsalzlösung brennt nicht.' },
        { t: 'Kaltes Licht der OP-Leuchte', correct: false, fb: 'OP-Leuchten sind keine typische Zündquelle; das heiße Ende eines Lichtleitkabels dagegen schon.' }
      ] },
      { type: 'find', device: 'c-arm', title: 'Röntgenkontrolle', prompt: 'Es soll eine intraoperative Cholangiographie (Röntgen mit Kontrastmittel) erfolgen. Welches Gerät wird verwendet?', explain: 'Der <b>mobile C-Bogen</b> durchleuchtet durch die röntgendurchlässige Tischplatte.' },
      { type: 'quiz', title: 'Strahlenschutz', question: 'Welche Maßnahme reduziert die Strahlendosis für das OP-Team am wirksamsten, wenn niemand direkt am Tisch gebraucht wird?', options: [
        { t: 'Abstand vergrößern – die Dosis nimmt mit dem Quadrat der Entfernung ab.', correct: true, fb: 'Richtig. Doppelter Abstand = ein Viertel der Dosis. Dazu: Schürze, Schilddrüsenschutz, Dosimeter.' },
        { t: 'Durchleuchtungszeit verlängern, damit das Bild schärfer wird.', correct: false, fb: 'Mehr Zeit = mehr Dosis.' },
        { t: 'Röhre oben, Detektor unten positionieren.', correct: false, fb: 'Umgekehrt: Röhre unten, Detektor oben – die Streustrahlung trifft dann eher Beine statt Kopf und Schilddrüse.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p>HF-Chirurgie: Stromweg, Neutralelektrode und Brandschutz. C-Bogen: Abstand, Abschirmung, kurze Durchleuchtungszeit. Beide Geräte unterliegen besonderen Vorschriften (MPBetreibV bzw. StrlSchG).</p>' }
    ]
  });
})();
