import type { BusinessIdea } from '../types';
import { normalizeRegion, scopedResearch } from './research';

export interface GeneratorSignals {
  region: string;
  interests: string[];
  serviceCategories: string[];
}

export function generateHypothesisIdeas(signals: GeneratorSignals): Partial<BusinessIdea>[] {
  const { region, interests, serviceCategories } = signals;
  const hypotheses: Partial<BusinessIdea>[] = [];

  // Simple combinatorial logic to generate local business hypotheses
  serviceCategories.forEach(category => {
    interests.forEach(interest => {
      hypotheses.push({
        title: `${category} für ${interest}`,
        region: region,
        targetAudience: interest,
        notes: `Hypothese generiert für ${category} in ${region}.`,
        // Default starting points
        keywords: [category, `${category} ${region}`, `${category} für ${interest}`],
      });
    });
  });

  // Add some "Smart" combinations if certain keywords are present
  if (serviceCategories.includes('Pflege') || serviceCategories.includes('Service')) {
    hypotheses.push({
      title: `Digitaler ${serviceCategories[0]} Begleiter`,
      region: region,
      targetAudience: 'Vielbeschäftigte Berufstätige',
      notes: 'Kombination aus physischem Service und digitaler Verwaltung.',
      keywords: [`${serviceCategories[0]} online buchen`, `hausnahe dienstleistungen ${region}`],
    });
  }

  return hypotheses.slice(0, 5); // Return top 5 suggestions
}

export interface RegionalIdea {
  title: string
  reason: string
  potential: string
  region: string
  targetAudience: string
  keywords: string[]
  researchEntries: import('../types').ResearchEntry[]
}

export function generateRegionalIdeas(input: { region: string; terms: string[]; interests: string[]; observations: import('../types').ResearchEntry[] }): RegionalIdea[] {
  const region = input.region.trim()
  const filters = input.terms.map(normalizeRegion).filter(Boolean)
  const observations = scopedResearch(input.observations, region).filter(entry => !filters.length || filters.some(term => normalizeRegion(`${entry.topic} ${entry.notes}`).includes(term)))
  const services: Array<[RegExp, string, string]> = [
    [/fahrrad|bike|pedelec|e-bike/i, 'Mobiler Fahrradservice', 'Fahrradreparatur'],
    [/solar|photovoltaik|pv[- ]/i, 'Reinigung und Pflege von Solaranlagen', 'Solaranlagen reinigen'],
    [/wärmepumpe|heizung/i, 'Wartungskoordination für Heizungen', 'Heizungswartung'],
    [/senior|\bpflege|altenpflege|krankenpflege|alltagshilfe/i, 'Alltagsunterstützung vor Ort', 'Alltagshilfe'],
    [/garten|hecke|rasen/i, 'Flexibler Gartenservice', 'Gartenpflege'],
    [/reinig|putz/i, 'Lokaler Reinigungsservice', 'Reinigung'],
    [/hund|katze|tierbetreuung/i, 'Tierbetreuung in der Nachbarschaft', 'Tierbetreuung'],
  ]
  const groups = new Map<string, RegionalIdea>()
  const sorted = [...observations].sort((a, b) => b.observedOn.localeCompare(a.observedOn) || b.recordedAt - a.recordedAt)
  for (const entry of sorted) {
    const text = `${entry.topic} ${entry.notes}`
    const rule = services.find(([pattern]) => pattern.test(text))
    const service = rule?.[1] ?? `Unterstützung rund um ${entry.topic}`
    const keyword = rule?.[2] ?? entry.topic
    const existing = groups.get(service)
    if (existing) { existing.researchEntries.push(entry); existing.keywords = [...new Set([...existing.keywords, entry.topic])]; continue }
    groups.set(service, {
      title: `${service} in ${region}`,
      region,
      targetAudience: input.interests.map(term => term.trim()).filter(Boolean).join(', ') || `Menschen in ${region}`,
      keywords: [...new Set([keyword, entry.topic])],
      researchEntries: [entry],
      reason: `Arbeitshypothese aus „${entry.topic}“ in ${entry.region} (Quelle: ${entry.source}, ${entry.observedOn}). Daraus lässt sich ein Angebot für ${keyword} untersuchen.`,
      potential: 'Offen – die Beobachtung belegt noch keine tragfähige Geschäftsidee.',
    })
  }
  return [...groups.values()].slice(0, 5)
}
