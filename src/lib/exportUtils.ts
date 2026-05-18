import type { MarketAnalysis } from '../types'

export function generateReportMarkdown(
  title: string,
  region: string,
  report: MarketAnalysis
): string {
  const date = new Date().toLocaleDateString('de-DE')

  return `# Marktanalyse: ${title}
**Region:** ${region || 'Lokal/Nicht angegeben'}
**Datum:** ${date}
**Score:** ${report.scoreAtGeneration}/100

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