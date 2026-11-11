# MedTech Simulator

Interaktive virtuelle Krankenhausumgebung, die **Medizintechnik im klinischen Einsatz** vermittelt.
Lernende besuchen zehn Krankenhausbereiche, klicken Geräte im Raum an, erleben simulierte
Alltagssituationen und vertiefen die Physik dahinter im Simulationslabor.

> **Lernumgebung:** Alle Patientinnen, Patienten und Messwerte sind **fiktiv**. Die Simulationen sind
> vereinfachte Lehrmodelle und ersetzen weder Geräteeinweisung (MPBetreibV) noch Gebrauchsanweisung
> oder klinische Ausbildung. Geräteabbildungen sind generisch; genannte Hersteller sind Beispiele.

## Starten

Es gibt keinen Build-Schritt und keine Abhängigkeiten. Einfach **`index.html` im Browser öffnen**
(Doppelklick genügt, funktioniert auch offline über `file://`). Optional über einen lokalen Webserver:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen. Die Anwendung läuft auf normalen Laptops, Tablets und Smartphones –
sie nutzt 2D-SVG-Raumansichten und Canvas statt 3D-Grafik.

## Inhalte

| Bereich | Geräte (Auswahl) | Szenarien |
|---|---|---|
| **Intensivstation** (Schwerpunkt) | Beatmungsgerät, Patientenmonitor (live), Spritzen-/Infusionspumpen, Absaugung, Defibrillator, Druckwandler, Medienversorgung, Zentrale/PDMS, BGA, Intensivbett, Ernährungspumpe | Dienstbeginn-Check · Sättigungsabfall unter Beatmung · Blutdruckabfall (echt vs. Messfehler) · Rhythmusalarm/Kammerflimmern |
| Operationssaal | Narkosegerät (live), OP-Tisch, OP-Leuchte, HF-Chirurgie, Endoskopieturm, C-Bogen | Narkose-Gerätecheck & Pneumoperitoneum · HF-Chirurgie & Strahlenschutz |
| Notaufnahme | Notfalltrage, 12-Kanal-EKG, Ultraschall, Transportbeatmung, Defibrillator | Brustschmerz → STEMI → Herzkatheter · Schockraum-Check & O₂-Vorrat |
| Radiologie | Röntgen, CT, MRT, PACS, Kontrastmittelinjektor | CT-Angiographie · MRT-Sicherheit |
| Normalstation | Pflegebett, Vitaldatenmessgerät, PCA-Pumpe, Rufanlage, O₂-Flowmeter, Blutzuckermessgerät | Verschlechterung erkennen (NEWS2) |
| Aufwachraum | High-Flow-Sauerstoff, Wärmesystem, PCA, Monitor (live) | Atemdepression & Hypothermie |
| Dialyse | Dialysegerät, Behandlungsstuhl, Wasseraufbereitung | Dialysebehandlung mit Druckalarm |
| Labor | Klinische Chemie, Hämatologie, Gerinnung, Zentrifuge, Mikroskop, Blutdepot, Rohrpost, LIS | Weg einer Blutprobe · Kühlkette |
| Neonatologie | Inkubator, Wärmebett, Phototherapie, Neo-Beatmung/CPAP, transkutane Messung | Bradykardie-Episode & Pflegerunde |
| Herzkatheterlabor | Angiographieanlage, Hämodynamik, KM-Injektor, IABP, ACT-Messung | Akut-PCI beim STEMI |

Zu jedem Gerät: **Bezeichnung, Hersteller (Beispiele), medizinischer Zweck, technische Funktion,
Komponenten, Messwerte, typische Alarme, Verbindungen zu anderen Geräten, Sicherheitsaspekte**,
ggf. Normen und Risikoklasse. Jeder Bereich hat zusätzlich ein interaktives **Geräteverbund-Diagramm**
(Gas, Strom, Daten, Fluide, Signale, Strahlung, klinische Zusammenhänge).

### Simulationslabor

| Simulation | Modell |
|---|---|
| Atemphysiologie & Beatmung | Bewegungsgleichung P = V/C + R·V̇ + PEEP, VC/PC, P-V-Schleife, Auto-PEEP, alveoläre Ventilation, alveoläre Gasgleichung, Shunt |
| EKG | Synthetisches EKG (Gauß-Summen), 9 Rhythmen, EKG-Papier, Artefakte (Elektrode ab, Bewegung, 50 Hz) |
| Sauerstoffsättigung | Severinghaus-Bindungskurve mit Bohr-/Temperatureffekt, Ratio-of-Ratios, CO-Hb-Fehler, Perfusion |
| Blutdruck | Invasiv: Hydrostatik (0,74 mmHg/cm), Dämpfung, Fast-Flush-Test · NIBP: oszillometrische Hüllkurve, Manschettengröße |
| Infusion | Dosis → Rate, Anlaufverzögerung, Okklusion mit Druckaufbau und Bolus |
| Defibrillation | Kondensatorentladung E = ½CU², biphasischer Impuls, Impedanz, synchronisierte Kardioversion |
| Bildgebung | Röntgen (Schwächungsgesetz, kV/mAs, Rauschen), CT (Hounsfield, Fensterung), MRT (T1/T2/PD über TR/TE) |

### Herausforderungen

Gerät finden · Geräte ↔ Aufgaben zuordnen · Komponenten identifizieren · Alarm erkennen (Live-Monitor) ·
Geräteverbund erklären. Die Aufgaben werden aus der Gerätedatenbank erzeugt; der Fortschritt wird lokal im
Browser gespeichert.

## Projektstruktur

```
index.html              Einstieg
css/style.css           Gestaltung (responsiv)
js/core.js              Namespace, Registry, Helfer, Fortschritt, Ton
js/sim/physio.js        Physiologisches Modell und Signalgeneratoren
js/sim/lab-*.js         Simulationen des Labors
js/render/sprites.js    Generische SVG-Gerätedarstellungen
js/render/monitor.js    Patientenmonitor mit Alarmsystem (IEC 60601-1-8 angelehnt)
js/render/room.js       Raum-Renderer mit Hotspots und Live-Bildschirmen
js/data/devices-icu.js  Kerngeräte (ausführlich)
js/data/area-*.js       Bereiche mit eigenen Geräten und Szenarien
js/ui/*.js              Ansichten, Geräteinfo, Szenario-Engine, Herausforderungen
tools/validate.js       Datenvalidierung (node tools/validate.js)
tools/shot.js           Screenshots per Playwright (node tools/shot.js "#/area/icu" out.png --room)
```

## Erweitern

Ein neuer Bereich ist eine Datei `js/data/area-<id>.js`, die in `index.html` eingebunden wird:

- `MT.registerDevice({...})` – Gerät mit Zweck, Funktion, Komponenten (optional `parts` mit Koordinaten
  für die Komponenten-Herausforderung), Messwerten, Alarmen (`prio: high|medium|low`), Verbindungen
  (`type: Gas|Strom|Daten|Fluid|Signal|Klinisch|Strahlung`), Sicherheit und optional `sim`.
- `MT.registerArea({...})` – Raum mit `placements` (Gerät, `visual` aus `sprites.js`, Position im
  1600 × 900-Raum), Dekor, Schläuchen/Kabeln und optional `createState()` für Live-Monitore.
- `MT.registerScenario({...})` – Schritte vom Typ `info`, `find` (Gerät im Raum anklicken) oder `quiz`
  (Einfach- oder Mehrfachauswahl) mit optionalen `enter`/`after`-Hooks, die den Patientenzustand ändern.

Danach `node tools/validate.js` ausführen.
