import type { BusinessIdea } from '../types';

export interface ImprovementSuggestion {
  id: string;
  type: 'pivot' | 'niche' | 'premium' | 'strategy';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

export function getImprovementSuggestions(idea: BusinessIdea): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // 1. Competition Analysis
  if (idea.professionalCompetitorCount > 5) {
    suggestions.push({
      id: 'niche-down',
      type: 'niche',
      title: `Spezialisierung für ${idea.targetAudience || 'eine Teilzielgruppe'}`,
      description: `Der Markt für "${idea.title}" ist durch viele Profis besetzt. Eine Spezialisierung auf eine extrem spitze Nische (z.B. nur eine bestimmte Marke oder ein spezielles Problem) reduziert den direkten Wettbewerb.`,
      impact: 'high',
      reason: 'Hohe Dichte an professionellen Wettbewerbern.',
    });
  }

  // 2. Willingness to Pay Analysis
  if (idea.willingnessToPay < 5) {
    suggestions.push({
      id: 'b2b-pivot',
      type: 'pivot',
      title: 'B2B Pivot',
      description: `Statt Privatpersonen direkt anzusprechen, könntest du als Subunternehmer für Firmen oder als Service-Partner für Hausverwaltungen agieren. Geschäftskunden haben oft ein höheres Budget und Interesse an Zuverlässigkeit.`,
      impact: 'high',
      reason: 'Geringe Zahlungsbereitschaft in der aktuellen Zielgruppe.',
    });
  }

  // 3. Urgency Analysis
  if (idea.urgency < 5) {
    suggestions.push({
      id: 'subscription-model',
      type: 'strategy',
      title: 'Abo-Modell / Wartung',
      description: `Da das Problem nicht "brennt", ist der Kaufdruck gering. Verwandle den Service in ein präventives Abo-Modell (z.B. monatliche Kontrolle), um planbare Umsätze zu generieren.`,
      impact: 'medium',
      reason: 'Niedrige Dringlichkeit erschwert den Einmalverkauf.',
    });
  }

  // 4. Trend Analysis
  if (idea.trendDirection === 'seasonal') {
    suggestions.push({
      id: 'off-season-offer',
      type: 'strategy',
      title: 'Ganzjahres-Strategie',
      description: `Entwickle ein Komplementär-Angebot für die Nebensaison, das die gleichen Ressourcen (Werkzeuge, Fahrzeuge, Personal) nutzt, um die Auslastung zu glätten.`,
      impact: 'medium',
      reason: 'Saisonale Schwankungen gefährden den Cashflow.',
    });
  }

  // 5. Pain Point Analysis
  const hasServicePains = idea.painPointEntries.some(p => p.category === 'service' || p.category === 'availability');
  if (hasServicePains) {
    suggestions.push({
      id: 'reliability-usp',
      type: 'premium',
      title: 'Premium Express & Erreichbarkeit',
      description: `Deine Recherche zeigt Pains bei Service/Erreichbarkeit. Positioniere dich als "Der Erreichbare" mit 24h-Antwortgarantie oder Online-Buchung. Das rechtfertigt Premium-Preise.`,
      impact: 'high',
      reason: 'Kunden beschweren sich über schlechten Service der Konkurrenz.',
    });
  }

  // 6. Generic "Similar but better" (The Pivot)
  if (idea.title.toLowerCase().includes('hilfe') || idea.title.toLowerCase().includes('service')) {
    suggestions.push({
      id: 'productized-service',
      type: 'pivot',
      title: 'Productized Service',
      description: `Statt "Stunden gegen Geld" zu tauschen, verkaufe fest definierte Pakete (z.B. "Garten-Winterfest-Paket" zum Festpreis). Das ist skalierbarer und für Kunden leichter zu kaufen.`,
      impact: 'medium',
      reason: 'Dienstleistungen ohne festes Produkt-Gefühl sind schwerer zu vermarkten.',
    });
  }

  // Default fallback if nothing else is found
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'data-collection',
      type: 'strategy',
      title: 'Mehr Evidenz sammeln',
      description: 'Trage mehr Keyword-Daten und Konkurrenz-Analysen ein, um spezifische Verbesserungsvorschläge zu erhalten.',
      impact: 'low',
      reason: 'Zu wenig Daten für eine fundierte Analyse.',
    });
  }

  return suggestions;
}
