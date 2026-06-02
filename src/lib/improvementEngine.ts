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
      title: `Specialize for ${idea.targetAudience || 'a sub-target group'}`,
      description: `The market for "${idea.title}" is occupied by many professionals. Specializing in an extremely narrow niche (e.g. only a specific brand or a special problem) reduces direct competition.`,
      impact: 'high',
      reason: 'High density of professional competitors.',
    });
  }

  // 2. Willingness to Pay Analysis
  if (idea.willingnessToPay < 5) {
    suggestions.push({
      id: 'b2b-pivot',
      type: 'pivot',
      title: 'B2B Pivot',
      description: `Instead of targeting private individuals directly, you could act as a subcontractor for companies or as a service partner for property management firms. Business customers often have a higher budget and interest in reliability.`,
      impact: 'high',
      reason: 'Low willingness to pay in the current target group.',
    });
  }

  // 3. Urgency Analysis
  if (idea.urgency < 5) {
    suggestions.push({
      id: 'subscription-model',
      type: 'strategy',
      title: 'Subscription Model / Maintenance',
      description: `Since the problem is not "burning", purchase pressure is low. Transform the service into a preventive subscription model (e.g. monthly check-up) to generate predictable revenue.`,
      impact: 'medium',
      reason: 'Low urgency makes one-time sales difficult.',
    });
  }

  // 4. Trend Analysis
  if (idea.trendDirection === 'seasonal') {
    suggestions.push({
      id: 'off-season-offer',
      type: 'strategy',
      title: 'Year-Round Strategy',
      description: `Develop a complementary off-season offering that uses the same resources (tools, vehicles, staff) to smooth out utilization.`,
      impact: 'medium',
      reason: 'Seasonal fluctuations endanger cash flow.',
    });
  }

  // 5. Pain Point Analysis
  const hasServicePains = idea.painPointEntries.some(p => p.category === 'service' || p.category === 'availability');
  if (hasServicePains) {
    suggestions.push({
      id: 'reliability-usp',
      type: 'premium',
      title: 'Premium Express & Availability',
      description: `Your research shows pains around service/availability. Position yourself as "The Reachable One" with a 24h response guarantee or online booking. This justifies premium pricing.`,
      impact: 'high',
      reason: 'Customers complain about poor service from the competition.',
    });
  }

  // 6. Generic "Similar but better" (The Pivot)
  if (idea.title.toLowerCase().includes('help') || idea.title.toLowerCase().includes('service')) {
    suggestions.push({
      id: 'productized-service',
      type: 'pivot',
      title: 'Productized Service',
      description: `Instead of trading "hours for money", sell clearly defined packages (e.g. "Garden Winter-Ready Package" at a fixed price). This is more scalable and easier for customers to buy.`,
      impact: 'medium',
      reason: 'Services without a clear product feel are harder to market.',
    });
  }

  // Default fallback if nothing else is found
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'data-collection',
      type: 'strategy',
      title: 'Collect More Evidence',
      description: 'Enter more keyword data and competition analyses to receive specific improvement suggestions.',
      impact: 'low',
      reason: 'Too little data for a well-founded analysis.',
    });
  }

  return suggestions;
}
