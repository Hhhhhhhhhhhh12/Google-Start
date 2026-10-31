# Roadmap — Local Demand Scanner / Ideen Scout

Stand: 31.10.2026. Technische Umsetzung, technische Prüfung, visuelle Nutzerabnahme, Integration und Veröffentlichung sind getrennte Zustände.

## Umgesetzt und im Arbeitsstand geprüft

- Speichern und Bearbeiten anhand fester IDs; Notizen, Recherche und Gewichte bleiben erhalten. Geänderte Eingaben machen den angezeigten Bericht ungültig. Löschen der letzten Idee, Rückgängig-Funktion und verständliche Speicherfehler.
- Manueller Rechercheablauf mit Thema, Art, Region, Quelle, Datum, optionalem Link und Unsicherheit; vorhandener Query Builder als manuell geöffnete Recherchehilfe.
- Abgenommene Journalgestaltung umgesetzt: reduzierte Symbolnavigation, Sammlung, Einstellungen oben rechts, drei Prüfschritte, Papier-/Serifengestaltung und lokale Illustration; aufklappbare Ergebnisdetails. Nachweis in [docs/GUIDED_LAYOUT.md](docs/GUIDED_LAYOUT.md).
- Regionale Ideenableitung aus ausgewählten Beobachtungen mit Quellenübernahme; fehlende Signale werden nicht erfunden.
- Sichtbare Abfragefehler, sichere Fehlermeldungen, begrenzte Anfragezeit, Teilresultate und Abbruch. Serper-Schlüssel standardmäßig in der Sitzung, Geräteablage nur ausdrücklich; Löschen beider Ablagen.
- Kennzeichnung von Annahmen und ungeklärter Herkunft in Bericht, Vergleich und Markdown-Export. Kein erfundenes monatliches Suchvolumen aus Trefferzahlen.

Die Nachweise stehen in [docs/WORKFLOW_IMPROVEMENTS.md](docs/WORKFLOW_IMPROVEMENTS.md).

## Nächste eigenständige Aufgaben

- Visuelle Nutzerabnahme der tatsächlichen App mit dem technisch geprüften Journal-Einbau; Details siehe [Layoutnachweis](docs/GUIDED_LAYOUT.md).
- Vollständige JSON-Sicherung und geprüfter Wiederimport: in PR #4 entwickelt, noch nicht nach `main` übernommen; eigene technische Prüfung und Nutzerabnahme erforderlich. Persönliche Datenübernahme nur nach ausdrücklicher Zustimmung.
- Spätere Quellenabdeckung: Messzeiträume, Aktualität und unterschiedliche geografische Granularität fachlich präzisieren.
- Umfang und Aussagekraft des Orientierungs-Scores separat beurteilen; fehlende Zahlungsbereitschaft oder Nachfrage bleiben offene Belege.
- Geräteübergreifende Bedienprüfung und echte externe Abfragen benötigen jeweils einen eigenen freigegebenen Umfang. Öffentliche App-Veröffentlichung ist ein eigener Schritt.

## Bestätigte Richtung und spätere Aufgaben

Recherchehilfe mit belegbaren Daten; Serper bleibt optional. Regeln und Vorlagen sind keine abgeschlossene KI- oder Marktvalidierung. Den Gesamt-Score als nachrangige Orientierung behalten und seine Annahmen sowie fehlende Belege erklären; Formel vorerst erhalten. Was-wäre-wenn und Finanzrechner bleiben spätere eigenständige Aufgaben.

Workflow und Recherchejournal wurden am 28.10.2026 bereits nach `main` übernommen. Der [Integrationsplan](docs/INTEGRATION_2026-10-31.md) trennt historische Befunde von heutigen Änderungen und noch offenen Abnahmen.
