import type { BusinessIdea, MarketAnalysis } from '../types';
import { calculateIdeaScore, getCompetitionVerdict } from './scoring';
import { currentExternalResearch, latestResearch, projectResearch } from './research';

export function generateMarketAnalysis(input: BusinessIdea): MarketAnalysis {
  const idea = projectResearch(input);
  const observations = idea.researchEntries ?? [];
  const hasObservedVolume = observations.some(entry => entry.kind === 'keyword-volume');
  const observedTrend = latestResearch(observations, 'trend');
  const observedCompetition = latestResearch(observations, 'competition');
  const external = currentExternalResearch(idea) ? idea.externalResearch : undefined;
  const scores = calculateIdeaScore(idea);
  const compVerdict = getCompetitionVerdict(idea);
  const totalVolume = (idea.keywordData || []).reduce((sum, kd) => sum + (kd.monthlyVolume || 0), 0);
  const dataBasis = idea.dataBasis || 'unverified';
  const hasManualData = dataBasis === 'manual';
  const sources: string[] = [];
  if (dataBasis === 'external-mixed' || external) {
    if (idea.organicResults?.length) sources.push('Suchergebnisse über Serper');
    if (idea.competitors.length) sources.push('Maps-Einträge über Serper');
    if (external?.mapsSucceeded) sources.push(`Maps-Abfrage: ${new Date(external.mapsQueriedAt ?? external.queriedAt).toLocaleString('de-DE')} · ${external.region || 'Region nicht angegeben'}`);
    if (external?.searchSucceeded) sources.push(`Suchabfrage: ${new Date(external.searchQueriedAt ?? external.queriedAt).toLocaleString('de-DE')} · ${external.region || 'Region nicht angegeben'}`);
  }
  observations.forEach(entry => sources.push(`${entry.source} · ${entry.observedOn} · ${entry.region}${entry.sourceUrl ? ` · ${entry.sourceUrl}` : ''}`));
  if (hasManualData) sources.push('Manuell erfasste Angaben; nicht unabhängig geprüft');
  sources.push('Regelbasierte Auswertung mit Annahmen und Vorlagen');
  
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
  if (!hasManualData) {
    verdict = 'Potenzial noch offen: Der Score beruht auf Annahmen' +
      (dataBasis === 'external-mixed' || dataBasis === 'researched' ? ' und einzelnen erfassten Beobachtungen.' : '.') +
      ' Regionale Nachfrage und Zahlungsbereitschaft müssen erst belegt werden.';
  }

  // 2. Demand Analysis
  let demandAnalysis = '';
  if (hasObservedVolume) {
    demandAnalysis = `Die erfassten Quellen nennen insgesamt ${totalVolume.toLocaleString('de-DE')} Suchanfragen pro Monat. Die manuell übertragenen Angaben sind nicht unabhängig geprüft. `;
  } else if (!hasManualData) {
    demandAnalysis = 'Kein belegtes monatliches Suchvolumen vorhanden. ';
  } else if (totalVolume > 1000) {
    demandAnalysis = `Starke Marktnachfrage mit ca. ${totalVolume} Suchanfragen pro Monat. `;
  } else if (totalVolume > 0) {
    demandAnalysis = `Moderate Nachfrage (${totalVolume}/Monat). Fokus auf Long-tail Keywords empfohlen. `;
  } else {
    demandAnalysis = 'Nachfrage-Daten fehlen noch. ';
  }

  if (observedTrend) {
    demandAnalysis += `Trend laut erfasster Quelle: ${{ rising: 'steigend', stable: 'stabil', declining: 'sinkend', seasonal: 'saisonabhängig' }[observedTrend.trend!]}.`;
  } else if (!hasManualData || !idea.checklist.googleTrendsChecked) {
    demandAnalysis += 'Der Trend wurde nicht geprüft.';
  } else if (idea.trendDirection === 'rising') {
    demandAnalysis += 'Der Trend ist wachsend, was auf ein steigendes Interesse in der Zukunft hindeutet.';
  } else if (idea.trendDirection === 'seasonal') {
    demandAnalysis += 'Vorsicht: Das Geschäft ist saisonabhängig. Cashflow-Planung ist kritisch.';
  } else if (idea.trendDirection === 'declining') {
    demandAnalysis += 'Der Markt scheint zu schrumpfen. Ein Einstieg sollte kritisch hinterfragt werden.';
  } else {
    demandAnalysis += 'Das Marktinteresse ist stabil.';
  }

  // 3. Competition Analysis
  let competitionAnalysis = observedCompetition
    ? `Laut erfasster Quelle wurden ${observedCompetition.value} lokale Anbieter gezählt; Abdeckung und Zeitraum der Quelle beachten. `
    : hasManualData
    ? `${compVerdict.label}. ${compVerdict.description} `
    : dataBasis === 'external-mixed' && idea.competitors.length
      ? `${idea.competitors.length} Maps-Einträge erfasst; keine vollständige regionale Konkurrenzübersicht. `
      : 'Konkurrenz noch nicht erhoben. Vorbelegte Werte sind Annahmen. ';
  const ratedCompetitors = idea.competitors.filter(competitor => competitor.rating > 0);
  if (ratedCompetitors.length > 0) {
    const avgRating = ratedCompetitors.reduce((s, c) => s + c.rating, 0) / ratedCompetitors.length;
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
    dataBasis,
    researchEntries: observations,
    researchWarnings: external?.warnings ?? (input.externalResearch ? ['Frühere externe Ergebnisse gehören zu einer anderen Idee oder Region und wurden ausgeschlossen.'] : []),
    verdict,
    demandAnalysis,
    competitionAnalysis,
    strategyRecommendation,
    nextSteps,
    metrics: {
      competition: observedCompetition ? `${observedCompetition.value} Anbieter (manuell erfasst)` : hasManualData ? compVerdict.label : (dataBasis === 'external-mixed' || external?.mapsSucceeded) && (idea.competitors.length || external?.mapsSucceeded) ? `${idea.competitors.length} Maps-Einträge (Ausschnitt)` : 'Nicht erhoben',
      searchVolume: hasObservedVolume || (hasManualData && totalVolume > 0) ? `${totalVolume.toLocaleString('de-DE')} / Monat (manuell angegeben)` : 'Nicht belegt',
      trend: observedTrend || (hasManualData && idea.checklist.googleTrendsChecked) ? `${idea.trendDirection === 'rising' ? 'Steigend' : idea.trendDirection === 'seasonal' ? 'Saisonal' : idea.trendDirection === 'declining' ? 'Sinkend' : 'Stabil'} (manuell angegeben)` : 'Nicht geprüft',
      cpc: hasManualData && idea.checklist.cpcChecked ? 'Manuell als geprüft markiert; kein Betrag erfasst' : 'Nicht erhoben',
    },
    sources,
    checklist: { ...idea.checklist },
    evidencePercent: dataBasis === 'assumptions' ? 0 : dataBasis === 'unverified' ? undefined : scores.evidencePercent,
    evidenceQuality: dataBasis === 'assumptions' ? 'incomplete' : dataBasis === 'unverified' ? undefined : scores.evidenceQuality,
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


