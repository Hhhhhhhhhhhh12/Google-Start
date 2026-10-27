# Datenherkunft kennzeichnen

Stand: 27.10.2026. Umsetzung auf `codex/local-demand-data-provenance`, aufbauend auf der getrennten Build-Korrektur `c14f9c4`.

## Umgesetzt

- Neue Berichte unterscheiden Annahmen, externe Recherche mit Annahmen und ausdrücklich als manuell erfasste Angaben. Der anschließende manuelle Rechercheablauf ist in `WORKFLOW_IMPROVEMENTS.md` dokumentiert.
- Fehlende Herkunft in älteren Berichten wird bei Anzeige, Vergleich und Markdown-Export als ungeklärt behandelt. Die gespeicherten Originalberichte werden dabei nicht verändert.
- Trefferzahlen und Anzeigen werden nicht mehr in monatliches Keyword-Suchvolumen umgerechnet. Anzeigen belegen keine CPC-Prüfung; Serper ersetzt weder Keyword Planner noch Trends.
- Neue reine Annahmenberichte erhalten keinen Recherchefortschritt. Der Fortschritt bezeichnet Vollständigkeit, keine verifizierte Datenqualität.
- Vorschläge aus festen Vorlagen versprechen weder aktuelle Suchtrends noch belegtes Marktpotenzial. Score, SWOT, Zielgruppe und Strategie sind als Orientierung bzw. Arbeitshypothesen gekennzeichnet.
- Die Berechnungsfunktionen für Scoring sowie Query Builder und Storage bleiben erhalten. Neue externe Bewertungen können durch den Wegfall des erfundenen Volumens andere Scores haben.

## Prüfstatus und offene Punkte

- Ausdrücklich freigegeben und bestanden: `npm run test` (25 Tests) und `npm run build`.
- Quellen-, Diff- und Statusprüfung durchgeführt. Keine externen Suchabfragen ausgeführt.
- Browserprüfung, visuelle Abnahme, Integration und Veröffentlichung stehen aus.
- Berichtsweite Herkunft wurde inzwischen um Einzelbeobachtungen mit Quelle, Region, Datum und Unsicherheit sowie sichtbare Abruffehler ergänzt; siehe `WORKFLOW_IMPROVEMENTS.md`.
- Die anschließende Überarbeitung von Serper-Fehlern und Schlüsselablage ist ebenfalls in `WORKFLOW_IMPROVEMENTS.md` beschrieben.
