import type { BusinessIdea, MarketAnalysis } from '../types';
import { calculateIdeaScore, getCompetitionVerdict } from './scoring';

export function generateMarketAnalysis(idea: BusinessIdea): MarketAnalysis {
  const scores = calculateIdeaScore(idea);
  const compVerdict = getCompetitionVerdict(idea);
  const totalVolume = (idea.keywordData || []).reduce((sum, kd) => sum + (kd.monthlyVolume || 0), 0);
  
  // 1. Verdict logic
  let verdict = '';
  if (scores.finalScore >= 80) {
    verdict = 'Exzellentes Potenzial: Alle Signale stehen auf Grün. Hohe Nachfrage trifft auf überwindbare Konkurrenz.';
  } else if (scores.finalScore >= 60) {
    verdict = 'Gutes Nischen-Potenzial: Die Idee ist solide, erfordert aber eine präzise Positionierung oder Spezialisierung.';
  } else if (scores.finalScore >= 40) {
    verdict = 'Herausfordernd: Es gibt Marktsignale, aber entweder ist der Wettbewerb stark oder die Zahlungsbereitschaft gering.';
  } else {
    verdict = 'Hohes Risiko: Aktuelle Daten zeigen geringe Erfolgsaussichten. Ein Pivot oder tiefergehende Recherche wird empfohlen.';
  }

  // 2. Demand Analysis
  let demandAnalysis = '';
  if (totalVolume > 1000) {
    demandAnalysis = `Starke Marktnachfrage mit ca. ${totalVolume} Suchanfragen pro Monat. `;
  } else if (totalVolume > 0) {
    demandAnalysis = `Moderate Nachfrage (${totalVolume}/Monat). Fokus auf Long-tail Keywords empfohlen. `;
  } else {
    demandAnalysis = 'Nachfrage-Daten fehlen noch. ';
  }

  if (idea.trendDirection === 'rising') {
    demandAnalysis += 'Der Trend ist wachsend, was auf ein steigendes Interesse in der Zukunft hindeutet.';
  } else if (idea.trendDirection === 'seasonal') {
    demandAnalysis += 'Vorsicht: Das Geschäft ist saisonabhängig. Cashflow-Planung ist kritisch.';
  } else if (idea.trendDirection === 'declining') {
    demandAnalysis += 'Der Markt scheint zu schrumpfen. Ein Einstieg sollte kritisch hinterfragt werden.';
  } else {
    demandAnalysis += 'Das Marktinteresse ist stabil.';
  }

  // 3. Competition Analysis
  let competitionAnalysis = `${compVerdict.label}. ${compVerdict.description} `;
  if (idea.competitors.length > 0) {
    const avgRating = idea.competitors.reduce((s, c) => s + c.rating, 0) / idea.competitors.length;
    if (avgRating < 3.5) {
      competitionAnalysis += `Die bestehende Konkurrenz hat schwache Bewertungen (Schnitt: ${avgRating.toFixed(1)}). Dies ist eine massive Chance für einen Qualitäts-Markteintritt.`;
    } else if (avgRating > 4.5) {
      competitionAnalysis += 'Die Konkurrenz ist qualitativ sehr stark aufgestellt. Ein reiner Qualitäts-Wettbewerb wird schwierig.';
    }
  }

  // 4. Strategy Recommendation
  let strategyRecommendation = '';
  const hasServicePains = idea.painPointEntries.some(p => p.category === 'service' || p.category === 'availability');
  
  if (hasServicePains && idea.willingnessToPay >= 7) {
    strategyRecommendation = 'Premium-Service-Strategie: Positioniere dich als die zuverlässige, hochpreisige Alternative zu den überlasteten Anbietern vor Ort.';
  } else if (idea.professionalCompetitorCount > 5) {
    strategyRecommendation = `Hyper-Nischen-Fokus: Spezialisiere dich auf ${idea.targetAudience || 'eine extrem spitze Zielgruppe'}, um den etablierten Profis auszuweichen.`;
  } else if (idea.urgency >= 8) {
    strategyRecommendation = 'Speed-to-Market: Da das Problem für Kunden akut ist, gewinnst du durch schnelle Reaktionszeit und sofortige Verfügbarkeit.';
  } else {
    strategyRecommendation = 'Standard-Eintritt: Konzentriere dich auf SEO und lokale Sichtbarkeit, um organisch mit dem Markt zu wachsen.';
  }

  // 5. Next Steps
  const nextSteps: string[] = [];
  if (!idea.checklist.keywordPlannerChecked) nextSteps.push('Keyword-Volumen im Google Keyword Planner validieren.');
  if (idea.competitors.length < 3) nextSteps.push('Mindestens 3-5 lokale Konkurrenten im Detail analysieren.');
  if (idea.painPointEntries.length < 3) nextSteps.push('Mehr Rezensionen lesen, um spezifische Probleme der Kunden zu finden.');
  if (nextSteps.length === 0) {
    nextSteps.push('Business-Plan Entwurf starten.');
    nextSteps.push('Erste Landingpage für Test-Anzeigen (MVP) erstellen.');
  }

  // 6. SWOT Analysis (Logic-driven)
  const swot = {
    strengths: [
      'Geringe Fixkosten im lokalen Setup',
      idea.professionalCompetitorCount < 3 ? 'Wenig professionelle Konkurrenz' : 'Hohe Markttiefe',
      'Direkter Kundenkontakt'
    ],
    weaknesses: [
      'Abhängigkeit von lokaler Präsenz',
      idea.trendDirection === 'seasonal' ? 'Saisonale Umsatzschwankungen' : 'Skalierung erfordert Personal',
    ],
    opportunities: [
      'Expansion in Nachbarregionen',
      'Digitalisierung des Buchungsprozesses',
      'Abo-Modelle für Bestandskunden'
    ],
    threats: [
      'Preiskampf durch Online-Plattformen',
      'Fachkräftemangel bei Expansion',
    ]
  };

  // 7. Persona Analysis
  const persona = {
    name: idea.willingnessToPay > 7 ? 'Der qualitätsbewusste Premium-Kunde' : 'Der preisbewusste Pragmatiker',
    painPoints: idea.painPointEntries.length > 0 
      ? idea.painPointEntries.slice(0, 3).map(p => p.text)
      : ['Lange Wartezeiten', 'Unzuverlässige Dienstleister', 'Mangelnde Transparenz'],
    willingnessToPay: idea.willingnessToPay > 7 ? 'Hoch' : 'Mittel bis Gering'
  };

  return {
    verdict,
    demandAnalysis,
    competitionAnalysis,
    strategyRecommendation,
    nextSteps,
    metrics: {
      competition: compVerdict.label === 'Unbekannt' ? 'Daten fehlen' : compVerdict.label,
      searchVolume: totalVolume > 0 ? `${totalVolume.toLocaleString()} / Monat` : idea.checklist.keywordPlannerChecked ? 'Simuliert (Demo)' : 'API Key benötigt',
      trend: idea.trendDirection === 'rising' ? 'Steigend' : idea.trendDirection === 'seasonal' ? 'Saisonal' : idea.trendDirection === 'declining' ? 'Sinkend' : 'Stabil',
      cpc: idea.checklist.cpcChecked ? 'Daten vorhanden' : '---',
      totalResults: idea.organicResults?.[0] ? undefined : 0
    },
    sources: [
      'Google Search (Live)',
      'Google Maps (Live)',
      'Wettbewerbs-Scan',
    ],
    organicEvidence: idea.organicResults,
    peopleAlsoAsk: idea.peopleAlsoAsk,
    relatedSearches: idea.relatedSearches,
    swot,
    persona,
    revenueModels: idea.willingnessToPay > 7 
      ? ['Premium-Einmalzahlung', 'Exklusiv-Wartung (Abo)', 'Service-Level-Agreements'] 
      : ['Einmaliger Service-Fee', 'Material-Marge', 'Vermittlungsprovision'],
    generatedAt: Date.now(),
    scoreAtGeneration: scores.finalScore
  };
}


