/* =====================================================================
   Bereich: Intensivstation (vollständig ausgearbeitet)
   Raumaufbau, Live-Zustand und klinische Lernszenarien.
   Alle Patientendaten sind FIKTIV.
   ===================================================================== */
(function () {
  'use strict';
  var MT = window.MT;

  MT.registerArea({
    id: 'icu',
    name: 'Intensivstation',
    short: 'ITS',
    icon: '🫁',
    color: '#2f7fd8',
    sign: 'ITS · Bettplatz 3',
    signSub: 'Lernumgebung · fiktiver Patient',
    complete: true,
    description: 'Ein vollständig ausgestatteter Intensivbettplatz: Beatmung, Überwachung, Infusionstherapie und Notfallausrüstung arbeiten hier als vernetztes System zusammen.',
    patientInfo: 'Lernpatient „P-03“ (fiktiv) · 64 J. · 80 kg · Pneumonie mit Lungenversagen (ARDS) · intubiert und beatmet · Noradrenalin über Spritzenpumpe',
    room: { wall: '#eef3f7', wall2: '#dde6ee', floor: '#c4d0da', floor2: '#aebdca', horizon: 640 },
    decor: [
      { visual: 'window', x: 950, y: 96, w: 290 },
      { visual: 'counter', x: 1290, y: 430, w: 300 },
      { visual: 'dispenser', x: 905, y: 360, w: 40 }
    ],
    placements: [
      { device: 'pendant', visual: 'pendant', x: 110, y: 34, w: 130, labelY: 610, labelX: 175 },
      { device: 'suction', visual: 'suction', x: 22, y: 250, w: 78 },
      { device: 'syringe-pump', visual: 'pump-stack', x: 555, y: 120, w: 165, opts: { noIV: true } },
      { device: 'infusion-pump', visual: 'iv-pole', x: 740, y: 150, w: 110 },
      { device: 'feeding-pump', visual: 'feeding-pump', x: 860, y: 240, w: 78 },
      { device: 'art-line', visual: 'transducer', x: 452, y: 330, w: 72 },
      { device: 'monitor', visual: 'monitor', x: 290, y: 96, w: 250, live: { type: 'monitor', screen: [12, 12, 216, 132] } },
      { device: 'bga', visual: 'bga', x: 1320, y: 300, w: 145 },
      { device: 'icu-bed', visual: 'bed', x: 400, y: 470, w: 740, labelY: 805 },
      { device: 'ventilator', visual: 'ventilator', x: 262, y: 352, w: 152, live: { type: 'ventilator', screen: [15, 13, 140, 98] } },
      { device: 'defibrillator', visual: 'defibrillator', x: 1175, y: 512, w: 140 },
      { device: 'central-station', visual: 'workstation', x: 1335, y: 600, w: 255 }
    ],
    hosesBehind: [
      // Gasschläuche von der Medienversorgung zum Beatmungsgerät (O₂ weiß, Druckluft schwarz/weiß)
      '<path d="M152 222 C 150 380, 300 420, 330 520" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#f-soft)"/>',
      '<path d="M198 222 C 200 370, 330 400, 350 520" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M198 222 C 200 370, 330 400, 350 520" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="8 8"/>',
      // Netzkabel
      '<path d="M157 330 C 200 420, 240 460, 290 590" stroke="#2fb36a" stroke-width="3" fill="none"/>',
      // Monitorkabel zum Patienten
      '<path d="M415 300 C 430 420, 560 470, 640 560" stroke="#59636e" stroke-width="3" fill="none"/>',
      // Vakuumschlauch zur Absaugung
      '<path d="M152 266 C 120 260, 100 250, 90 262" stroke="#e0b400" stroke-width="5" fill="none"/>'
    ],
    hosesFront: [
      // Beatmungsschläuche (Inspiration blau, Exspiration grau) zum Tubus
      '<path d="M316 616 C 290 470, 520 450, 563 580" stroke="#8cc4f0" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/>',
      '<path d="M316 616 C 290 470, 520 450, 563 580" stroke="#5a9fd8" stroke-width="12" fill="none" stroke-dasharray="2 4" opacity=".7"/>',
      '<path d="M377 616 C 380 500, 540 480, 566 584" stroke="#c9d3dd" stroke-width="12" fill="none" stroke-linecap="round"/>',
      '<path d="M377 616 C 380 500, 540 480, 566 584" stroke="#9aa6b2" stroke-width="12" fill="none" stroke-dasharray="2 4" opacity=".6"/>',
      // Infusionsleitungen zum ZVK (Hals) und Arterie (Arm)
      '<path d="M700 420 C 690 520, 620 560, 560 590" stroke="rgba(150,190,225,.95)" stroke-width="2.5" fill="none"/>',
      '<path d="M770 410 C 760 520, 640 560, 565 592" stroke="rgba(150,190,225,.95)" stroke-width="2.5" fill="none"/>',
      '<path d="M520 470 C 560 560, 700 600, 760 610" stroke="#e05050" stroke-width="2.5" fill="none"/>',
      // Ernährungssonde
      '<path d="M900 420 C 880 520, 640 540, 548 568" stroke="#a678d6" stroke-width="2.5" fill="none"/>'
    ],
    scenarios: ['icu-orientation', 'icu-desaturation', 'icu-hypotension', 'icu-vf'],
    learningGoals: [
      'Geräte eines Intensivbettplatzes benennen und ihren Zweck erklären',
      'Messwerte am Monitor und Beatmungsgerät lesen und einordnen',
      'Geräteverbund verstehen: Gas, Strom, Daten, Fluide',
      'Alarme nach Priorität einordnen und systematisch abarbeiten',
      'Sicherheitsaspekte (Notfallausrüstung, Stromversorgung, Hygiene, MPBetreibV) kennen'
    ],
    // Lebender Zustand des Bettplatzes (wird beim Betreten erzeugt)
    createState: function () {
      return {
        patient: MT.physio.createPatient({ hr: 92, spo2: 94, sys: 112, dia: 61, rr: 18, etco2: 41, temp: 38.1, cvp: 10, nibpSys: 110, nibpDia: 60 }),
        vent: { mode: 'VC', vt: 450, pinsp: 18, peep: 10, rr: 18, ie: 0.5, c: 32, r: 12, fio2: 0.5, pause: 0.2, disconnected: false, obstructed: false }
      };
    }
  });

  /* ------------------------------------------------------------------
     Szenario 1 – Dienstantritt: Orientierung am Bettplatz
     ------------------------------------------------------------------ */
  MT.registerScenario({
    id: 'icu-orientation',
    area: 'icu',
    title: 'Dienstbeginn an Bettplatz 3',
    level: 'Einstieg',
    duration: '10 min',
    summary: 'Du übernimmst einen beatmeten Patienten. Verschaffe dir einen Überblick über Geräte, Messwerte und deren Zusammenspiel.',
    steps: [
      { type: 'info', title: 'Übergabe (fiktiv)', text: '<p><b>Lernpatient „P-03“</b>, 64 Jahre, 80 kg. Schwere Pneumonie mit Lungenversagen (ARDS). Er ist intubiert, wird volumenkontrolliert beatmet und erhält Noradrenalin zur Kreislaufunterstützung sowie Propofol und Sufentanil zur Sedierung/Analgesie.</p><p>Deine Aufgabe: Mache den <b>Bettplatz-Check</b> – wie zu Beginn jeder Schicht.</p>' },
      { type: 'find', device: 'ventilator', title: 'Wer atmet für den Patienten?', prompt: 'Klicke auf das Gerät, das die Atmung des Patienten übernimmt.', explain: 'Das <b>Intensivbeatmungsgerät</b> liefert über Inspirations- und Exspirationsschenkel ein O₂-Luft-Gemisch zum Tubus. Es misst jeden Atemzug (Druck, Flow, Volumen).' },
      { type: 'find', device: 'monitor', title: 'Überwachung', prompt: 'Wo siehst du EKG, Sättigung und Blutdruck des Patienten?', explain: 'Der <b>Patientenmonitor</b> zeigt Kurven im Sweep-Modus und Zahlenwerte. Farben sind typisch, aber herstellerspezifisch: EKG grün, SpO₂ cyan, arterieller Druck rot, CO₂ gelb.' },
      { type: 'quiz', title: 'Messwerte lesen', question: 'Schau auf den Monitor (Werte schwanken leicht). Welche Aussage trifft zu?', options: [
        { t: 'Die Herzfrequenz liegt um 90/min, die SpO₂ um 94 % – der Patient ist überwacht stabil, aber nicht „normal“.', correct: true, fb: 'Richtig. Leichte Tachykardie, grenzwertige SpO₂ unter FiO₂ 50 % – typisch für ARDS. Diese Werte sind der Ausgangspunkt für Verlaufsbeurteilungen.' },
        { t: 'Die SpO₂ ist 100 %, deshalb kann die FiO₂ sofort auf 21 % reduziert werden.', correct: false, fb: 'Nein – die SpO₂ liegt um 94 % bei FiO₂ 50 %. Eine abrupte Reduktion würde zu Hypoxie führen.' },
        { t: 'Der Blutdruck ist nicht messbar, weil keine Manschette angelegt ist.', correct: false, fb: 'Der Blutdruck wird hier invasiv über eine arterielle Kanüle und einen Druckwandler gemessen (rote ART-Kurve).' }
      ] },
      { type: 'find', device: 'art-line', title: 'Woher kommt die rote Kurve?', prompt: 'Finde das Bauteil, das den arteriellen Druck in ein elektrisches Signal umwandelt.', explain: 'Der <b>Druckwandler</b> (Transducer) steckt in einem flüssigkeitsgefüllten Spülsystem. Er muss auf Herzhöhe (phlebostatische Achse) genullt werden – 1 cm Höhenfehler ≈ 0,74 mmHg.' },
      { type: 'quiz', title: 'Beatmungswerte', question: 'Am Beatmungsgerät sind eingestellt: VT 450 ml, AF 18/min, PEEP 10 cmH₂O, FiO₂ 50 %. Wie groß ist das Atemminutenvolumen?', options: [
        { t: 'ca. 8,1 l/min', correct: true, fb: 'Richtig: 0,45 l × 18/min = 8,1 l/min. Das Minutenvolumen bestimmt maßgeblich die CO₂-Abatmung.' },
        { t: 'ca. 4,5 l/min', correct: false, fb: 'Das wäre bei AF 10/min. Rechne VT × AF: 0,45 l × 18 = 8,1 l/min.' },
        { t: 'ca. 18 l/min', correct: false, fb: 'Zu hoch. VT (in Litern) × Frequenz: 0,45 × 18 = 8,1 l/min.' }
      ] },
      { type: 'quiz', title: 'Technische Abhängigkeiten', question: 'Was benötigt das Beatmungsgerät, um überhaupt arbeiten zu können?', multi: true, options: [
        { t: 'Sauerstoff aus der zentralen Gasversorgung', correct: true },
        { t: 'Medizinische Druckluft', correct: true },
        { t: 'Stromversorgung (Netz bzw. Akku)', correct: true },
        { t: 'Vakuum', correct: false },
        { t: 'Netzwerkverbindung zum PDMS', correct: false }
      ], fb: 'O₂ und Druckluft werden gemischt (FiO₂), Strom treibt Elektronik und Ventile. Vakuum braucht die <b>Absaugung</b>; die Netzwerkverbindung dient nur der Dokumentation – die Beatmung läuft auch ohne sie weiter.' },
      { type: 'find', device: 'pendant', title: 'Medienversorgung', prompt: 'Woher kommen Sauerstoff, Druckluft, Vakuum und Strom?', explain: 'Die <b>Deckenversorgungseinheit</b> bündelt Gasentnahmestellen (O₂ weiß, Druckluft schwarz-weiß, Vakuum gelb nach ISO 32), Steckdosen (grün = Sicherheitsstromversorgung), Netzwerk und Potentialausgleich.' },
      { type: 'quiz', title: 'Stromausfall-Szenario', question: 'Das Beatmungsgerät ist versehentlich an einer weißen (allgemeinen) Steckdose angeschlossen. Was ist das Risiko?', options: [
        { t: 'Bei Netzausfall wird diese Steckdose nicht von der Sicherheitsstromversorgung gespeist – das Gerät läuft nur noch so lange, wie der Akku hält.', correct: true, fb: 'Genau. Lebenserhaltende Geräte gehören an die grün gekennzeichneten Steckdosen der Sicherheitsstromversorgung. Der Akku ist nur eine Überbrückung.' },
        { t: 'Kein Risiko – alle Steckdosen auf der Intensivstation sind gleich.', correct: false, fb: 'Nicht ganz: Steckdosen sind unterschiedlichen Stromkreisen zugeordnet; nur die der Sicherheitsstromversorgung werden nach wenigen Sekunden von der Netzersatzanlage weiter versorgt.' },
        { t: 'Das Gerät beatmet dann mit höherer FiO₂.', correct: false, fb: 'Die Steckdose hat keinen Einfluss auf die Gasmischung.' }
      ] },
      { type: 'find', device: 'suction', title: 'Notfallbereitschaft', prompt: 'Welches Gerät muss bei Schichtbeginn auf Funktion geprüft werden, damit Sekret jederzeit entfernt werden kann?', explain: 'Die <b>Absaugung</b> wird an das Zentralvakuum angeschlossen. Funktionsprüfung: Sog einstellen, Schlauch zuhalten – das Manometer muss den eingestellten Unterdruck erreichen.' },
      { type: 'quiz', title: 'Sicherheitscheck', question: 'Was gehört zwingend zur Notfallausstattung an einem Beatmungsbettplatz?', multi: true, options: [
        { t: 'Beatmungsbeutel mit Maske und O₂-Anschluss', correct: true },
        { t: 'Funktionsfähige Absaugung', correct: true },
        { t: 'Erreichbarer, geprüfter Defibrillator', correct: true },
        { t: 'Ein zweites Beatmungsgerät direkt am Bett', correct: false }
      ], fb: 'Beatmungsbeutel, Absaugung und ein täglich geprüfter Defibrillator (auf der Station erreichbar) sind Pflicht. Ein zweites Beatmungsgerät steht nicht an jedem Bett, sondern als Reserve auf der Station.' },
      { type: 'find', device: 'central-station', title: 'Vernetzung', prompt: 'Wo laufen die Daten aller Bettplätze zusammen?', explain: 'Die <b>Überwachungszentrale</b> zeigt alle Monitore; das <b>PDMS</b> dokumentiert automatisch Vitalwerte, Beatmung und Pumpenraten. Wichtig: Der primäre Alarm entsteht immer am Bettmonitor.' },
      { type: 'info', title: 'Geschafft!', text: '<p>Du hast den Bettplatz-Check abgeschlossen. Merke dir das Prinzip:</p><ul><li><b>Atmung:</b> Beatmungsgerät + Befeuchtung + Absaugung</li><li><b>Kreislauf:</b> Monitor + arterielle Druckmessung + Spritzenpumpen</li><li><b>Infrastruktur:</b> Gase, Vakuum, (Sicherheits-)Strom, Netzwerk</li><li><b>Notfall:</b> Beatmungsbeutel, Defibrillator, Notfallwagen</li></ul>' }
    ]
  });

  /* ------------------------------------------------------------------
     Szenario 2 – Desaturation unter Beatmung
     ------------------------------------------------------------------ */
  MT.registerScenario({
    id: 'icu-desaturation',
    area: 'icu',
    title: 'Alarm: Sättigungsabfall unter Beatmung',
    level: 'Fortgeschritten',
    duration: '8 min',
    summary: 'Mehrere Geräte alarmieren gleichzeitig. Erkenne den Zusammenhang und finde die Ursache.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Es ist ruhig im Zimmer. Lernpatient „P-03“ ist sediert und beatmet. Beobachte Monitor und Beatmungsgerät – gleich passiert etwas.</p>', enter: function (c) { c.reset(); } },
      { type: 'info', title: 'Alarm!', text: '<p>Das Beatmungsgerät meldet <b>„Paw hoch“</b>, kurz darauf fällt die <b>SpO₂</b> und die Herzfrequenz steigt. Du hörst Brodelgeräusche aus dem Tubus.</p><p>Schau dir die Kurven an: Der Spitzendruck steigt deutlich, das Volumen wird schwerer verabreicht.</p>', enter: function (c) {
        c.vent.obstructed = true; c.animate({ spo2: 84, hr: 118, etco2: 49, sys: 132, dia: 74 }, 6);
        c.alarmPulse('ventilator', true); c.alarmPulse('monitor', true);
      } },
      { type: 'quiz', title: 'Priorität', question: 'Was tust du ZUERST?', options: [
        { t: 'Patient ansehen: Thoraxbewegung, Tubuslage, Hautfarbe, Atemgeräusch – dann die Geräte prüfen.', correct: true, fb: 'Richtig: „Treat the patient, not the monitor“. Zuerst klinische Beurteilung, dann systematisch Geräte und Schläuche.' },
        { t: 'Alarmgrenzen für Paw und SpO₂ erweitern, damit der Alarm aufhört.', correct: false, fb: 'Gefährlich! Alarme zeigen ein echtes Problem. Alarmgrenzen zu verschieben verschleiert die Ursache.' },
        { t: 'Monitor neu starten – vermutlich ein Softwarefehler.', correct: false, fb: 'Zwei unabhängige Geräte alarmieren gleichzeitig plausibel – das spricht für ein echtes Patientenproblem.' }
      ] },
      { type: 'quiz', title: 'Systematik: DOPES', question: 'Bei Verschlechterung unter Beatmung hilft das Schema DOPES. Wofür steht das „O“?', options: [
        { t: 'Obstruktion – z. B. Sekret, abgeknickter oder verlegter Tubus', correct: true, fb: 'Genau. DOPES = Dislokation, Obstruktion, Pneumothorax, Equipment (Gerät), Stacked breaths (Air Trapping).' },
        { t: 'Oxygenierung – FiO₂ erhöhen', correct: false, fb: 'FiO₂-Erhöhung ist eine Sofortmaßnahme, aber das „O“ steht für Obstruktion.' },
        { t: 'Ödem – Lungenödem', correct: false, fb: 'Nicht in diesem Schema. DOPES: Dislokation, Obstruktion, Pneumothorax, Equipment, Stacked breaths.' }
      ] },
      { type: 'quiz', title: 'Kurven deuten', question: 'Spitzendruck stark gestiegen, Plateaudruck kaum verändert. Was bedeutet das physikalisch?', options: [
        { t: 'Der Atemwegswiderstand (Resistance) ist gestiegen – typisch für Sekret, Bronchospasmus oder Tubusproblem.', correct: true, fb: 'Richtig. Ppeak = Pplat + R·Flow. Steigt nur der widerstandsabhängige Anteil, liegt das Problem in den Atemwegen bzw. im Tubus – nicht in der Dehnbarkeit der Lunge.' },
        { t: 'Die Compliance der Lunge ist gesunken (Lunge steifer).', correct: false, fb: 'Dann würden Plateau- UND Spitzendruck steigen. Hier steigt vor allem die Differenz Ppeak − Pplat → Resistance.' },
        { t: 'Das Gerät misst falsch; die Drücke sind irrelevant.', correct: false, fb: 'Die Drücke sind höchst relevant und passen zum klinischen Bild (Brodeln).' }
      ] },
      { type: 'find', device: 'suction', title: 'Maßnahme', prompt: 'Welches Gerät brauchst du jetzt?', explain: 'Mit der <b>Absaugung</b> wird über das geschlossene Absaugsystem Sekret entfernt – ohne die Beatmung zu unterbrechen. Vorher ggf. kurz mit FiO₂ 100 % präoxygenieren.' , after: function (c) {
        c.vent.obstructed = false; c.animate({ spo2: 95, hr: 94, etco2: 41, sys: 114, dia: 62 }, 8);
        c.alarmPulse('ventilator', false); c.alarmPulse('monitor', false);
      } },
      { type: 'quiz', title: 'Verlauf', question: 'Nach dem Absaugen normalisieren sich Spitzendruck, SpO₂ und Herzfrequenz. Welche Nebenwirkung des Absaugens solltest du am Monitor im Blick behalten?', options: [
        { t: 'Bradykardie durch vagale Reizung und vorübergehender SpO₂-Abfall', correct: true, fb: 'Richtig. Absaugen kann den Vagus reizen (Bradykardie) und kurzzeitig zu Hypoxie führen. Deshalb: kurz absaugen, Monitor beobachten.' },
        { t: 'Anstieg der Körpertemperatur', correct: false, fb: 'Kein typischer akuter Effekt des Absaugens.' },
        { t: 'Blutzuckerabfall', correct: false, fb: 'Nicht typisch. Achte auf Herzfrequenz und Sättigung.' }
      ] },
      { type: 'info', title: 'Zusammenfassung', text: '<p><b>Geräteverbund in Aktion:</b> Das Beatmungsgerät erkannte den Widerstandsanstieg (Paw hoch), der Monitor die Folgen (SpO₂ ↓, HF ↑, etCO₂ ↑). Die Lösung kam von einem dritten Gerät – der Absaugung, die vom Zentralvakuum der Medienversorgung abhängt.</p><p><b>Merke:</b> Mehrere zusammenpassende Alarme verschiedener Geräte → echtes Patientenproblem wahrscheinlich.</p>' }
    ]
  });

  /* ------------------------------------------------------------------
     Szenario 3 – Blutdruckabfall: echtes Problem oder Messfehler?
     ------------------------------------------------------------------ */
  MT.registerScenario({
    id: 'icu-hypotension',
    area: 'icu',
    title: 'Blutdruckabfall unter Katecholaminen',
    level: 'Fortgeschritten',
    duration: '8 min',
    summary: 'Zwei Blutdruckalarme mit völlig unterschiedlicher Ursache – ein echtes Therapieproblem und ein Messfehler.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Lernpatient „P-03“ erhält Noradrenalin über eine Spritzenpumpe, Ziel-MAP ≥ 65 mmHg. Plötzlich alarmiert der Monitor: <b>ART SYS NIEDRIG</b>.</p>', enter: function (c) {
        c.reset(); c.animate({ sys: 78, dia: 44, hr: 112 }, 8); c.alarmPulse('syringe-pump', true);
        c.patient.extraAlarms = [{ id: 'pump', prio: 'medium', text: 'PUMPE 1: SPRITZE LEER', kind: 'tech' }];
      } },
      { type: 'find', device: 'syringe-pump', title: 'Ursache suchen', prompt: 'Ein weiteres Gerät meldet sich zeitgleich (gelbe Leuchte). Welches?', explain: 'Die <b>Noradrenalin-Spritze ist leer</b>. Noradrenalin hat eine Halbwertszeit von nur ca. 2–3 Minuten – eine Unterbrechung wirkt sich sofort auf den Blutdruck aus.' },
      { type: 'quiz', title: 'Wie verhindert man das?', question: 'Wie lässt sich ein solcher Abfall beim Spritzenwechsel vermeiden?', options: [
        { t: 'Voralarm beachten und die neue Spritze vorbereitet bereitstellen; bei kritischen Katecholaminen ggf. überlappender Wechsel nach Stationsstandard.', correct: true, fb: 'Richtig. Der Voralarm („Spritze fast leer“) gibt Zeit. Viele Stationen nutzen bei Katecholaminen einen Wechsel mit zweiter, bereits laufender Pumpe.' },
        { t: 'Spritze leer laufen lassen und dann in Ruhe neu aufziehen.', correct: false, fb: 'Dann bleibt der Patient minutenlang ohne Vasopressor – wie gerade gesehen.' },
        { t: 'Rate grundsätzlich verdoppeln, damit die Spritze länger reicht.', correct: false, fb: 'Eine höhere Rate leert die Spritze schneller und erhöht die Dosis – fachlich falsch und gefährlich.' }
      ] },
      { type: 'quiz', title: 'Spritzenwechsel – Physik', question: 'Die neue Spritze wird eingelegt. Warum dauert es bei sehr niedrigen Raten (z. B. 2 ml/h) eine Weile, bis die Wirkung einsetzt?', options: [
        { t: 'Mechanisches Spiel und Compliance von Spritze und Leitung müssen erst überwunden werden (Anlaufverzögerung); zusätzlich Totraumvolumen der Leitung.', correct: true, fb: 'Genau. Bei kleinen Raten kann es mehrere Minuten dauern, bis Fluss stabil ist. Gegenmaßnahme: Spritze vorgespannt einlegen (Entlüften/„Priming“-Funktion), kurze Leitungen mit kleinem Totraum.' },
        { t: 'Die Pumpe heizt das Medikament zunächst auf Körpertemperatur.', correct: false, fb: 'Spritzenpumpen erwärmen nicht.' },
        { t: 'Das Noradrenalin muss sich erst in der Spritze mischen.', correct: false, fb: 'Die Lösung ist fertig gemischt.' }
      ], after: function (c) {
        c.patient.extraAlarms = []; c.alarmPulse('syringe-pump', false); c.animate({ sys: 114, dia: 62, hr: 94 }, 8);
      } },
      { type: 'info', title: 'Zweiter Alarm', text: '<p>Der Blutdruck ist stabil. Eine Kollegin hat das Bett zur Lagerung um ca. 20 cm abgesenkt. Der Druckwandler hängt unverändert am Infusionsständer.</p><p>Kurz darauf: <b>ART SYS NIEDRIG</b> und <b>MAP NIEDRIG</b>. Der Patient sieht unverändert aus, Herzfrequenz und SpO₂ sind stabil, die NIBP-Kontrollmessung ergibt 112/60 mmHg.</p>', enter: function (c) { c.patient.transducerOffsetCm = 20; c.alarmPulse('art-line', true); } },
      { type: 'quiz', title: 'Messfehler erkennen', question: 'Was ist die wahrscheinlichste Erklärung?', options: [
        { t: 'Der Wandler liegt jetzt ca. 20 cm über dem Herzniveau → die hydrostatische Wassersäule fehlt, der Druck wird ca. 15 mmHg zu niedrig angezeigt.', correct: true, fb: 'Richtig. 20 cm × 0,74 mmHg/cm ≈ 15 mmHg. Lösung: Wandler wieder auf die phlebostatische Achse bringen und neu nullen.' },
        { t: 'Der Patient blutet akut.', correct: false, fb: 'Dann würden HF steigen und die NIBP ebenfalls niedrig sein. Hier sind Klinik und NIBP unauffällig.' },
        { t: 'Die Noradrenalin-Pumpe ist erneut leer.', correct: false, fb: 'Die Pumpe läuft. Der Zeitpunkt passt genau zur Bettverstellung.' }
      ] },
      { type: 'find', device: 'art-line', title: 'Korrektur', prompt: 'Welches Bauteil musst du neu ausrichten und nullen?', explain: 'Der <b>Druckwandler</b> wird auf Höhe der phlebostatischen Achse (4. Interkostalraum, mittlere Axillarlinie) gebracht und gegen Atmosphärendruck genullt.', after: function (c) { c.patient.transducerOffsetCm = 0; c.alarmPulse('art-line', false); } },
      { type: 'info', title: 'Zusammenfassung', text: '<p>Zwei Alarme – zwei Ursachen:</p><ul><li><b>Echtes Problem:</b> Unterbrechung der Katecholamintherapie (Pumpe ↔ Kreislauf ↔ Monitor).</li><li><b>Messfehler:</b> Hydrostatischer Fehler durch Höhenänderung (Bett ↔ Wandler ↔ Monitor).</li></ul><p>Plausibilitätskontrolle: Klinik, Trend, zweite Messmethode (NIBP) vergleichen.</p>' }
    ]
  });

  /* ------------------------------------------------------------------
     Szenario 4 – Kammerflimmern
     ------------------------------------------------------------------ */
  MT.registerScenario({
    id: 'icu-vf',
    area: 'icu',
    title: 'Notfall: Rhythmusalarm',
    level: 'Fortgeschritten',
    duration: '6 min',
    summary: 'Der Monitor zeigt einen lebensbedrohlichen Rhythmus. Unterscheide Artefakt und Notfall und setze den Defibrillator sicher ein.',
    steps: [
      { type: 'info', title: 'Ausgangslage', text: '<p>Lernpatient „P-03“ wird gerade gelagert. Plötzlich zeigt die EKG-Kurve ein unruhiges, zackiges Muster und der Monitor meldet einen Alarm.</p>', enter: function (c) { c.reset(); c.patient.motionArtifact = true; } },
      { type: 'quiz', title: 'Artefakt oder Notfall?', question: 'Die Pleth- und ART-Kurve zeigen weiterhin regelmäßige Pulswellen, der Patient wird bewegt. Was liegt vor?', options: [
        { t: 'Wahrscheinlich ein Bewegungsartefakt – die arterielle Druckkurve zeigt weiterhin eine Herzaktion mit Auswurf.', correct: true, fb: 'Richtig. Eine erhaltene ART- oder Pleth-Kurve mit regelmäßigen Pulsen schließt Kammerflimmern praktisch aus. Trotzdem: Patient immer prüfen!' },
        { t: 'Kammerflimmern – sofort defibrillieren.', correct: false, fb: 'Nein! Pulswellen in ART/Pleth beweisen eine Herzaktion mit Auswurf. Ein Schock wäre hier gefährlich.' }
      ], after: function (c) { c.patient.motionArtifact = false; } },
      { type: 'info', title: 'Jetzt wirklich', text: '<p>Einige Minuten später – der Patient liegt ruhig – zeigt der Monitor <b>KAMMERFLIMMERN</b>. Die ART-Kurve ist flach, die Pleth-Kurve verschwunden. Der Patient reagiert nicht, kein Puls tastbar.</p>', enter: function (c) { c.patient.rhythm = 'vf'; c.alarmPulse('monitor', true); } },
      { type: 'find', device: 'defibrillator', title: 'Gerät holen', prompt: 'Reanimation beginnt (Herzdruckmassage, CPR-Funktion des Bettes). Welches Gerät wird jetzt sofort benötigt?', explain: 'Der <b>Defibrillator</b> vom Notfallwagen. Kammerflimmern ist ein defibrillierbarer Rhythmus – je früher der Schock, desto höher die Erfolgsaussicht.' },
      { type: 'quiz', title: 'Einstellung', question: 'Welche Einstellung ist für Kammerflimmern beim Erwachsenen mit biphasischem Gerät üblich?', options: [
        { t: 'Unsynchronisierter Schock, 120–200 J (gerätespezifisch) bzw. 150–360 J', correct: true, fb: 'Richtig. Bei VF gibt es keine R-Zacke zum Synchronisieren – der Schock wird unsynchronisiert abgegeben. Energie nach Herstellerangabe (meist 150–200 J biphasisch).' },
        { t: 'Synchronisierte Kardioversion mit 50 J', correct: false, fb: 'Synchronisation braucht erkennbare R-Zacken – bei VF gibt es keine; das Gerät würde nicht auslösen.' },
        { t: 'Transkutaner Schrittmacher', correct: false, fb: 'Der Schrittmacher ist für Bradykardien, nicht für Kammerflimmern.' }
      ] },
      { type: 'quiz', title: 'Sicherheit vor dem Schock', question: 'Was muss vor der Schockabgabe sichergestellt werden?', multi: true, options: [
        { t: 'Niemand berührt Patient oder Bett („Alle weg!“)', correct: true },
        { t: 'Sauerstoffquelle (z. B. diskonnektierter Beutel) vom Brustkorb entfernt', correct: true },
        { t: 'Pads mit gutem Hautkontakt, nicht über Schrittmacher oder Pflastern', correct: true },
        { t: 'Beatmungsgerät ausschalten', correct: false }
      ], fb: 'Das Beatmungsgerät bleibt in der Regel konnektiert und eingeschaltet (geschlossenes System); wichtig ist, dass kein freier O₂-Strom am Thorax austritt.' , after: function (c) {
        c.patient.rhythm = 'sinus'; c.patient.hr = 104; c.animate({ sys: 98, dia: 55 }, 4); c.alarmPulse('monitor', false);
      } },
      { type: 'info', title: 'Schock abgegeben – ROSC', text: '<p>Nach dem Schock und weiterer Herzdruckmassage zeigt der Monitor wieder einen <b>Sinusrhythmus</b> mit Pulswellen in ART und Pleth: <b>Wiederkehr eines Spontankreislaufs (ROSC)</b>.</p><p>Probiere die Physik dahinter im <b>Simulationslabor → Defibrillation</b> aus: Energie, Thoraximpedanz und Stromfluss.</p>' }
    ]
  });
})();
