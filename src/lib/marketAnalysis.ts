import type { BusinessIdea, MarketAnalysis } from '../types';
import { calculateIdeaScore, getCompetitionVerdict } from './scoring';

export function generateMarketAnalysis(idea: BusinessIdea): MarketAnalysis {
  const scores = calculateIdeaScore(idea);
  const compVerdict = getCompetitionVerdict(idea);
  const totalVolume = (idea.keywordData || []).reduce((sum, kd) => sum + (kd.monthlyVolume || 0), 0);
  
  // 1. Verdict logic
  let verdict = '';
  if (scores.finalScore >= 80) {
    verdict = 'Excellent potential: All signals are green. High demand meets surmountable competition.';
  } else if (scores.finalScore >= 60) {
    verdict = 'Good niche potential: The idea is solid but requires precise positioning or specialization.';
  } else if (scores.finalScore >= 40) {
    verdict = 'Challenging: There are market signals, but either competition is strong or willingness to pay is low.';
  } else {
    verdict = 'High risk: Current data shows low chances of success. A pivot or deeper research is recommended.';
  }

  // 2. Demand Analysis
  let demandAnalysis = '';
  if (totalVolume > 1000) {
    demandAnalysis = `Strong market demand with approx. ${totalVolume} searches per month. `;
  } else if (totalVolume > 0) {
    demandAnalysis = `Moderate demand (${totalVolume}/month). Focus on long-tail keywords recommended. `;
  } else {
    demandAnalysis = 'Demand data not yet available. ';
  }

  if (idea.trendDirection === 'rising') {
    demandAnalysis += 'The trend is growing, indicating increasing interest in the future.';
  } else if (idea.trendDirection === 'seasonal') {
    demandAnalysis += 'Caution: The business is seasonal. Cash flow planning is critical.';
  } else if (idea.trendDirection === 'declining') {
    demandAnalysis += 'The market appears to be shrinking. Entry should be critically questioned.';
  } else {
    demandAnalysis += 'Market interest is stable.';
  }

  // 3. Competition Analysis
  let competitionAnalysis = `${compVerdict.label}. ${compVerdict.description} `;
  if (idea.competitors.length > 0) {
    const avgRating = idea.competitors.reduce((s, c) => s + c.rating, 0) / idea.competitors.length;
    if (avgRating < 3.5) {
      competitionAnalysis += `Existing competition has weak ratings (avg: ${avgRating.toFixed(1)}). This is a massive opportunity for a quality market entry.`;
    } else if (avgRating > 4.5) {
      competitionAnalysis += 'The competition is very strong in quality. Competing on quality alone will be difficult.';
    }
  }

  // 4. Strategy Recommendation
  let strategyRecommendation = '';
  const hasServicePains = idea.painPointEntries.some(p => p.category === 'service' || p.category === 'availability');
  
  if (hasServicePains && idea.willingnessToPay >= 7) {
    strategyRecommendation = 'Premium Service Strategy: Position yourself as the reliable, high-priced alternative to the overloaded local providers.';
  } else if (idea.professionalCompetitorCount > 5) {
    strategyRecommendation = `Hyper-Niche Focus: Specialize in ${idea.targetAudience || 'a very narrow target group'} to avoid the established professionals.`;
  } else if (idea.urgency >= 8) {
    strategyRecommendation = 'Speed-to-Market: Since the problem is acute for customers, you win through fast response time and immediate availability.';
  } else {
    strategyRecommendation = 'Standard Entry: Focus on SEO and local visibility to grow organically with the market.';
  }

  // 5. Next Steps
  const nextSteps: string[] = [];
  if (!idea.checklist.keywordPlannerChecked) nextSteps.push('Validate keyword volume in Google Keyword Planner.');
  if (idea.competitors.length < 3) nextSteps.push('Analyze at least 3–5 local competitors in detail.');
  if (idea.painPointEntries.length < 3) nextSteps.push('Read more reviews to find specific customer pain points.');
  if (nextSteps.length === 0) {
    nextSteps.push('Start drafting a business plan.');
    nextSteps.push('Create a first landing page for test ads (MVP).');
  }

  // 6. SWOT Analysis (Logic-driven)
  const swot = {
    strengths: [
      'Low fixed costs in a local setup',
      idea.professionalCompetitorCount < 3 ? 'Little professional competition' : 'High market depth',
      'Direct customer contact'
    ],
    weaknesses: [
      'Dependency on local presence',
      idea.trendDirection === 'seasonal' ? 'Seasonal revenue fluctuations' : 'Scaling requires staff',
    ],
    opportunities: [
      'Expansion into neighboring regions',
      'Digitalization of the booking process',
      'Subscription models for existing customers'
    ],
    threats: [
      'Price war from online platforms',
      'Skilled labor shortage during expansion',
    ]
  };

  // 7. Persona Analysis
  const persona = {
    name: idea.willingnessToPay > 7 ? 'The quality-conscious premium customer' : 'The price-conscious pragmatist',
    painPoints: idea.painPointEntries.length > 0
      ? idea.painPointEntries.slice(0, 3).map(p => p.text)
      : ['Long waiting times', 'Unreliable service providers', 'Lack of transparency'],
    willingnessToPay: idea.willingnessToPay > 7 ? 'High' : 'Medium to Low'
  };

  return {
    verdict,
    demandAnalysis,
    competitionAnalysis,
    strategyRecommendation,
    nextSteps,
    metrics: {
      competition: compVerdict.label === 'Unknown' ? 'Data missing' : compVerdict.label,
      searchVolume: totalVolume > 0 ? `${totalVolume.toLocaleString()} / month` : idea.checklist.keywordPlannerChecked ? 'Simulated (Demo)' : 'API Key required',
      trend: idea.trendDirection === 'rising' ? 'Rising' : idea.trendDirection === 'seasonal' ? 'Seasonal' : idea.trendDirection === 'declining' ? 'Declining' : 'Stable',
      cpc: idea.checklist.cpcChecked ? 'Data available' : '---',
      totalResults: idea.organicResults?.[0] ? undefined : 0
    },
    sources: [
      'Google Search (Live)',
      'Google Maps (Live)',
      'Competition Scan',
    ],
    organicEvidence: idea.organicResults,
    peopleAlsoAsk: idea.peopleAlsoAsk,
    relatedSearches: idea.relatedSearches,
    swot,
    persona,
    revenueModels: idea.willingnessToPay > 7
      ? ['Premium One-Time Payment', 'Exclusive Maintenance (Subscription)', 'Service Level Agreements']
      : ['One-Time Service Fee', 'Material Margin', 'Referral Commission'],
    generatedAt: Date.now(),
    scoreAtGeneration: scores.finalScore
  };
}


