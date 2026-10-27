# Übernahme aus Antigravity

Stand: 27.10.2026.

## Herkunft

- Vorhandenes Projekt: `Google Start`, Produktname in der aktuellen Oberfläche: Ideen Scout.
- Ausgangspunkt: Hauptzweig `main`, Commit `97b332d705c96c550e284a1f0201dc3558360e90`.
- Vorhandenes GitHub-Repository: `Hhhhhhhhhhhh12/Google-Start` (öffentlich).
- Dokumentationsänderungen werden auf `codex/scout-antigravity-migration-20261027` vorbereitet. Die Zustimmung zur GitHub-Sicherung ist keine Integration von Funktionsänderungen.

## Für die Weiterarbeit

Zuerst README, Roadmap und `docs/DECISIONS.md` lesen. Sie trennen das bestätigte Produktziel von den Grenzen des übernommenen Prototyps. Antigravity-Gesprächsarchive, globale Einstellungen, Zugangsdaten und installierte Pakete gehören nicht zum Quellcode-Transfer.

Der ursprüngliche Quellstand bleibt erhalten. Im vorhandenen Worktree `codex/local-demand-build-fix` liegen bereits uncommittete Änderungen an `src/App.tsx` und `src/lib/scraper.ts`; sie wurden nicht übernommen oder verändert. `src/App.tsx.new` bleibt als vorhandene Datei erhalten, ist aber nicht der von `src/main.tsx` verwendete App-Einstieg.

Ideen und API-Schlüssel liegen im Browserprofil unter der bisherigen lokalen Adresse. Ein neuer Projektordner überträgt diese Daten nicht. Vor einem Adress- oder Speicherwechsel ist ein eigener Datenübernahmeplan nötig; Browserdaten werden bei der Quellcode-Migration nicht ausgelesen.

## Prüfstatus dieser Übernahme

Durchgeführt: Quellen-, Git-Status- und Diff-Prüfung sowie Sichtung potenziell vertraulicher Dateien. Nicht durchgeführt: Installation, Testausführung, Lint, Build, Laufzeitprüfung, externe Suchabfragen oder visuelle Abnahme. Vorhandene Testdateien sind kein Beleg für einen aktuellen erfolgreichen Lauf.
