import type { MarketAnalysis } from '../types'
import { describeDataBasis, prepareReportForDisplay } from './reportProvenance'
import { RESEARCH_LABELS } from './research'

export function generateReportMarkdown(
  title: string,
  region: string,
  report: MarketAnalysis
): string {
  const date = new Date(report.generatedAt).toLocaleDateString('de-DE')
  report = prepareReportForDisplay(report)

  return `# Marktanalyse: ${title}
**Region:** ${region || 'Lokal/Nicht angegeben'}
**Datum:** ${date}
**Orientierungs-Score:** ${report.scoreAtGeneration}/100
**Datenbasis:** ${describeDataBasis(report)}

Score, SWOT, Zielgruppe und Strategie sind regelbasierte Arbeitshypothesen. Sie belegen weder regionale Nachfrage noch Zahlungsbereitschaft.

## Datenherkunft
${report.sources.map(source => `- ${source}`).join('\n')}

${report.researchWarnings?.length ? `## Einschränkungen der Recherche\n${report.researchWarnings.map(warning => `- ${warning}`).join('\n')}` : ''}

${report.researchEntries?.length ? `## Erfasste Beobachtungen\n${report.researchEntries.map(entry => `- **${RESEARCH_LABELS[entry.kind]}:** ${entry.topic}${entry.value !== undefined ? ` (${entry.value})` : ''}${entry.trend ? ` (${entry.trend})` : ''}\n  Region: ${entry.region}; beobachtet am: ${entry.observedOn}; Quelle: ${entry.source}${entry.sourceUrl ? `; ${entry.sourceUrl}` : ''}${entry.notes ? `\n  Einordnung: ${entry.notes}` : ''}`).join('\n')}` : ''}

## Zusammenfassung
${report.verdict}

## Marktkennzahlen
- **Konkurrenz:** ${report.metrics.competition}
- **Suchvolumen:** ${report.metrics.searchVolume}
- **Trend:** ${report.metrics.trend}
- **CPC (Ads):** ${report.metrics.cpc}
${report.metrics.totalResults ? `- **Google Treffer:** ${report.metrics.totalResults.toLocaleString('de-DE')}` : ''}

## SWOT Analyse
### Stärken
${report.swot.strengths.map(s => `- ${s}`).join('\n')}

### Schwächen
${report.swot.weaknesses.map(s => `- ${s}`).join('\n')}

### Chancen
${report.swot.opportunities.map(s => `- ${s}`).join('\n')}

### Risiken
${report.swot.threats.map(s => `- ${s}`).join('\n')}

## Zielgruppe (Persona)
**Name:** ${report.persona.name}
**Schmerzpunkte:** ${report.persona.painPoints.join(', ')}
**Zahlungsbereitschaft:** ${report.persona.willingnessToPay}

## Strategie & Erlösmodelle
**Go-to-Market Strategie:**
${report.strategyRecommendation}

**Empfohlene Erlösmodelle:**
${report.revenueModels.map(m => `- ${m}`).join('\n')}

## Nächste Schritte
${report.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---
*Generiert von Ideen Scout - Local Demand Engine*
`
}
