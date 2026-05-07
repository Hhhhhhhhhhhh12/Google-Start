import type { BusinessIdea } from '../types';

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
