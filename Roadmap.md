# Roadmap — Local Demand Scanner / Ideen Scout

Stand: 27.10.2026. Technische Umsetzung, technische Prüfung, visuelle Nutzerabnahme, Integration und Veröffentlichung sind getrennte Zustände.

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
- Workflow-Verbesserungen samt Journal-Einbau am 28.10.2026 auf Nutzerauftrag nach `main` übernommen und zu GitHub übertragen; Nachweis im [Layoutnachweis](docs/GUIDED_LAYOUT.md). Getrennte Migrations- und Backup-Zweige bleiben eigenständig.
- Vollständiger Datenexport, Wiederimport und nachvollziehbare Datenübernahme bei einem Wechsel der lokalen Adresse.
- Spätere Quellenabdeckung: Messzeiträume, Aktualität und unterschiedliche geografische Granularität fachlich präzisieren.
- Umfang und Aussagekraft des Orientierungs-Scores separat beurteilen; fehlende Zahlungsbereitschaft oder Nachfrage bleiben offene Belege.
- Geräteübergreifende Bedienprüfung und echte externe Abfragen benötigen jeweils einen eigenen freigegebenen Umfang. Öffentliche App-Veröffentlichung ist ein eigener Schritt.
