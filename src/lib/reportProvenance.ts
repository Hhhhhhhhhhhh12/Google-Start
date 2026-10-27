import type { MarketAnalysis } from '../types'

export function describeDataBasis(report: MarketAnalysis): string {
  switch (report.dataBasis) {
    case 'assumptions':
      return 'Annahmen – keine erhobenen Marktdaten'
    case 'external-mixed':
      return 'Externe Recherche mit Annahmen'
    case 'manual':
      return 'Manuell erfasste Angaben – nicht unabhängig geprüft'
    default:
      return 'Herkunft ungeklärt – älterer Bericht'
  }
}

// Old reports remain stored unchanged; their former Live labels are not evidence.
export function prepareReportForDisplay(report: MarketAnalysis): MarketAnalysis {
  if (report.dataBasis && report.dataBasis !== 'unverified') return report

  return {
    ...report,
    dataBasis: 'unverified',
    verdict: 'Für diesen älteren Bericht ist die Datenherkunft nicht dokumentiert. Score und Vorschläge sind ungeprüfte Orientierung.',
    demandAnalysis: 'Herkunft der gespeicherten Nachfrageangaben ungeklärt.',
    competitionAnalysis: 'Herkunft der gespeicherten Konkurrenzangaben ungeklärt.',
    metrics: {
      competition: 'Herkunft ungeklärt',
      searchVolume: 'Nicht belegt',
      trend: 'Nicht belegt',
      cpc: 'Nicht belegt',
    },
    sources: ['Keine nachvollziehbare Datenherkunft im gespeicherten Bericht'],
    checklist: undefined,
    evidencePercent: undefined,
    evidenceQuality: undefined,
  }
}
