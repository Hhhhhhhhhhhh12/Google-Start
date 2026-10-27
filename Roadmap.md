# Roadmap — Local Demand Scanner / Ideen Scout

Stand: 27.10.2026. Technische Umsetzung, technische Prüfung, visuelle Nutzerabnahme, Integration und Veröffentlichung sind getrennte Zustände.

## Umgesetzt und im Arbeitsstand geprüft

- Speichern und Bearbeiten anhand fester IDs; Notizen, Recherche und Gewichte bleiben erhalten. Geänderte Eingaben machen den angezeigten Bericht ungültig. Löschen der letzten Idee, Rückgängig-Funktion und verständliche Speicherfehler.
- Manueller Rechercheablauf mit Thema, Art, Region, Quelle, Datum, optionalem Link und Unsicherheit; vorhandener Query Builder als manuell geöffnete Recherchehilfe.
- Freigegebener Layoutentwurf umgesetzt: reduzierte Seitenleiste mit drei Hauptwegen, Sammlung und Einstellungen; drei Prüfschritte; aufklappbare Ergebnisdetails.
- Regionale Ideenableitung aus ausgewählten Beobachtungen mit Quellenübernahme; fehlende Signale werden nicht erfunden.
- Sichtbare Abfragefehler, sichere Fehlermeldungen, begrenzte Anfragezeit, Teilresultate und Abbruch. Serper-Schlüssel standardmäßig in der Sitzung, Geräteablage nur ausdrücklich; Löschen beider Ablagen.
- Kennzeichnung von Annahmen und ungeklärter Herkunft in Bericht, Vergleich und Markdown-Export. Kein erfundenes monatliches Suchvolumen aus Trefferzahlen.

Die Nachweise stehen in [docs/WORKFLOW_IMPROVEMENTS.md](docs/WORKFLOW_IMPROVEMENTS.md).

## Nächste eigenständige Aufgaben

- Visuelle Nutzerabnahme der tatsächlichen App nach dem freigegebenen Layoutentwurf; Details siehe [Layoutnachweis](docs/GUIDED_LAYOUT.md).
- Integration und GitHub-Übertragung der fünf neuen Verbesserungen separat freigeben.
- Vollständiger JSON-Export und geprüfter Wiederimport sind im Arbeitszweig umgesetzt; die tatsächliche Übertragung persönlicher Browserdaten sowie Integration und visuelle Nutzerabnahme stehen separat aus. Siehe [JSON-Sicherung](docs/JSON_BACKUP.md).
- Spätere Quellenabdeckung: Messzeiträume, Aktualität und unterschiedliche geografische Granularität fachlich präzisieren.
- Umfang und Aussagekraft des Orientierungs-Scores separat beurteilen; fehlende Zahlungsbereitschaft oder Nachfrage bleiben offene Belege.
- Geräteübergreifende Bedienprüfung und echte externe Abfragen benötigen jeweils einen eigenen freigegebenen Umfang. Öffentliche App-Veröffentlichung ist ein eigener Schritt.
