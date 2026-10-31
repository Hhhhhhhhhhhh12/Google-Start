# Ideen Scout: Entflechtung und Integrationsplan

Stand: 31.10.2026. Kein Merge nach `main`, keine Veröffentlichung, keine persönliche Datenübernahme.

## Verifizierte Ausgangsstände

| Stand | Commit | Vergleich mit aktuellem `main` |
| --- | --- | --- |
| `main` | `6bdc33c18a0eefb7d744d4f2870e9e1e418ff490` | Referenz des Abgleichs |
| PR #3, ursprünglicher Head | `e8f9938a801dbc84e35fe249df21e59834a7f6c7` | 2 voraus, 10 zurück; gemeinsame Basis `97b332d` |
| PR #4, ursprünglicher Head | `f1b7eb432094c38a4e2fe8bf21ee934d7902d6a0` | 1 voraus, 3 zurück; gemeinsame Basis `ac4bb33` |

Die früheren PR-Metadaten bezogen sich teils auf ältere Basestände. Der aktuelle Commitvergleich ist ausschlaggebend: PR #4 hat gegenüber dem heutigen `main` nur noch einen eigenen Commit, keine sechs neu zu integrierenden Entwicklungscommits. Zum Prüfzeitpunkt gab es für beide PRs keine Diskussions- oder Review-Kommentare.

## Bereits enthalten und zu erhalten

`main` enthält bereits `34a3e44` (Serper-Absicherung), `7247760` (Speichern und regionale Recherche), `f7921a0` (geführte Aktionen), `28e3f5e` (Nachweise), `ac4bb33` (geführtes Layout) und danach `2142705` (Recherchejournal), `9b94fdc` (Integrationsnachweis), `6bdc33c` (visuelle README). Die in PR #4 mitgeführte Vorentwicklung wird nicht erneut kopiert. Insbesondere bleibt das neuere Journal samt Illustration, Navigation und technischen Nachweisen erhalten.

Beide PRs führen dieselben Richtungsentscheidungen und historische Migrationsunterlagen mit. PR #3 ist deren gemeinsame Dokumentationsbasis; die zusätzliche JSON-Umsetzung aus PR #4 bleibt eine eigene Änderung. Historische Aussagen über damals fehlende Funktionen sind ausdrücklich als historisch eingeordnet. Bestätigtes Ziel bleibt die belegbare Recherchehilfe mit optionalem Serper; Regeln und Vorlagen sind keine Marktvalidierung.

## Tatsächliche Konflikte

Dateiweise Dreiwege-Zusammenführung mit den über GitHub ermittelten gemeinsamen Ausgangsständen:

| Vergleich | Konflikte | Auflösung |
| --- | --- | --- |
| PR #3 mit `main`, Basis `97b332d` | `README.md`, `Roadmap.md` | Aktuelle README und Funktionsstände behalten; bestätigte Richtung, historische Einordnung und Folgeentscheidungen ergänzen |
| PR #4 mit `main`, Basis `ac4bb33` | `README.md`, `Roadmap.md`, `src/App.tsx` | Dokumentation auf PR #3 aufbauen; `NavigationIcon` aus dem Journal und beide JSON-Imports behalten |

Der App-Konflikt liegt ausschließlich im Importblock. Die Importfunktion und der Sammlungseinbau lassen sich automatisch einfügen. `App.css` lässt sich automatisch ergänzen. `BackupPanel.tsx`, `backup.ts` und `backup.test.ts` sind neue Dateien. Recherchelogik, Berichte, Datenmodell, Schlüsselverwaltung, Speichermodul und bestehende Tests werden nicht durch ältere Fassungen ersetzt.

## Vorgehen in den bestehenden PRs

1. PR #3 erhält einen Mergecommit mit seinem bisherigen Head als erstem und dem geprüften `main` als zweitem Parent. Sein neuer Diff zu `main` enthält ausschließlich Dokumentation und Projektregeln.
2. PR #4 erhält einen Mergecommit mit seinem bisherigen Head als erstem und dem aktualisierten PR-#3-Head als zweitem Parent. Seine Basis wird auf den bestehenden Branch von PR #3 gesetzt. Der gestapelte Diff zeigt dadurch nur die zusätzliche JSON-Funktion und ihre Nachweise.
3. Keine Historie wird umgeschrieben, kein Force-Push benötigt. Beide ursprünglichen Feature-Heads bleiben Vorfahren; `main` bleibt unverändert. Beide PRs bleiben Draft.
4. Zuerst PR #3 inhaltlich abnehmen. Ein späterer Squash-Merge ist eine eigene Nutzerentscheidung. Nach einem Squash-Merge zuerst das dann aktuelle `main` in den bestehenden PR-#4-Branch übernehmen (Mergecommit auf dem Feature-Branch, kein Merge nach `main`). Damit ist auch der Squash-Commit ein Vorfahr von PR #4; blosses Umstellen der Basis könnte sonst die alten Dokumentationscommits erneut im Drei-Punkt-Diff zeigen. Anschliessend die PR-Basis auf `main` umstellen und Diff, Mergefähigkeit sowie bei Anwendungsänderungen die betroffenen Prüfungen wiederholen. Bei unverändertem `main` gegenüber der Dokumentationsbasis sollen nur die JSON-Dateien und deren Dokumentationszusätze übrig bleiben.
5. PR #4 separat anhand von `docs/JSON_ACCEPTANCE.md` technisch und visuell abnehmen. Erst danach über seinen Merge entscheiden. Veröffentlichung und persönliche Datenmigration bleiben weitere Entscheidungen.

## Prüfungen und Grenzen

Für PR #3: Quellen-, Status- und Diffprüfung, historische Einordnung, relative Dokumentationslinks und `git diff --check`; keine neue App-Funktion. Für PR #4 sind die aktuellen Tests, Buildnachweise und offenen Punkte in dessen `docs/JSON_ACCEPTANCE.md` erfasst.

Die Repository-Snapshots wurden über den GitHub-Connector gelesen; ihre lokalen Dateiinhalte wurden gegen Git-Blob-SHAs geprüft. Dreiwege-Konflikte wurden lokal mit `git merge-file` ermittelt. Remote-Commits werden mit den echten GitHub-Parents und vorhandenen Basisbäumen erstellt; lokale Vergleichscommits werden nicht hochgeladen. Ein abschließender GitHub-Vergleich kontrolliert die tatsächlichen Remote-Diffs. Kein Zugriff auf persönliche Browserprofile oder echte API-Schlüssel.

Weitere Änderungen auf `main` nach dem Referenzcommit, ein späterer Squash-Merge, echte externe Abfragen und die fachliche Qualität der recherchierten Quellen sind durch diesen Stand nicht vorweggenommen.
