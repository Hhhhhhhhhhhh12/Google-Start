import type { BusinessIdea, IdeaScores, ScoreInput, TrendDirection } from '../types';

export function clamp(value: number, min = 0, max = 100): number {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
}

export function calculateCompetitionGap(
    competitorCount: number,
    professionalCompetitorCount: number,
): number {
    if (competitorCount <= 0) return 100;

    const safeProfessionalCompetitors = clamp(
        professionalCompetitorCount,
        0,
        competitorCount,
    );

    const professionalShare = safeProfessionalCompetitors / competitorCount;
    const crowdingPenalty = Math.max(competitorCount - 12, 0) * 3;

    return Math.round(clamp(100 - professionalShare * 75 - crowdingPenalty));
}

export function calculatePainScore(complaintDensity: number): number {
    return Math.round(clamp(complaintDensity * 10));
}

export function calculateCommercialScore(
    willingnessToPay: number,
    commercialCompetition: number,
): number {
    return Math.round(
        clamp(((willingnessToPay + commercialCompetition) / 2) * 10),
    );
}

export function calculateUrgencyScore(urgency: number): number {
    return Math.round(clamp(urgency * 10));
}

export function calculateKeywordBreadthScore(keywordCount: number): number {
    return Math.round(clamp(keywordCount * 8));
}

export function calculateTrendScore(trendDirection: TrendDirection): number {
    switch (trendDirection) {
        case 'rising': return 100;
        case 'stable': return 70;
        case 'seasonal': return 50;
        case 'declining': return 20;
        default: return 50;
    }
}

export function calculateScore(input: ScoreInput): Omit<IdeaScores, 'evidenceQuality' | 'evidencePercent'> {
    const competitionGap = calculateCompetitionGap(
        input.competitorCount,
        input.professionalCompetitorCount,
    );

    const painScore = calculatePainScore(input.complaintDensity);

    const commercialScore = calculateCommercialScore(
        input.willingnessToPay,
        input.commercialCompetition,
    );

    const urgencyScore = calculateUrgencyScore(input.urgency);
    const keywordBreadthScore = calculateKeywordBreadthScore(input.keywordCount);
    const trendScore = calculateTrendScore(input.trendDirection);

    // New Factor: Search Volume Intensity (Logarithmic scale for volume)
    // 0 -> 0, 100 -> 30, 1000 -> 70, 10000+ -> 100
    const volumeScore = Math.round(clamp(Math.log10(input.totalSearchVolume + 1) * 25));

    // New Factor: Quality Gap (Low ratings = high opportunity)
    // 5.0 rating -> 0 score, 1.0 rating -> 100 score
    const qualityGapScore = input.averageCompetitorRating > 0 
        ? Math.round(clamp((5 - input.averageCompetitorRating) * 25))
        : 50; // Neutral if no data

    const finalScore = Math.round(
        competitionGap * 0.15 +
        painScore * 0.15 +
        commercialScore * 0.15 +
        urgencyScore * 0.10 +
        keywordBreadthScore * 0.10 +
        trendScore * 0.15 +
        volumeScore * 0.10 +
        qualityGapScore * 0.10
    );

    return {
        competitionGap,
        painScore,
        commercialScore,
        urgencyScore,
        keywordBreadthScore,
        trendScore,
        finalScore,
    };
}

export function calculateEvidencePercent(idea: BusinessIdea): number {
    let total = 0;
    let filled = 0;

    // Checklist items (5 items, each worth 12% = 60%)
    const checklistItems = Object.values(idea.checklist || {});
    total += checklistItems.length;
    filled += checklistItems.filter(Boolean).length;

    // Has keyword volume data? (worth 1 point)
    total += 1;
    if ((idea.keywordData || []).some(kd => kd.monthlyVolume !== undefined && kd.monthlyVolume > 0)) {
        filled += 1;
    }

    // Has competitor entries? (worth 1 point)
    total += 1;
    if ((idea.competitors || []).length > 0) {
        filled += 1;
    }

    // Has pain point entries? (worth 1 point)
    total += 1;
    if ((idea.painPointEntries || []).length > 0) {
        filled += 1;
    }

    // Has trend direction set? (worth 1 point)
    total += 1;
    if (idea.trendDirection && idea.trendDirection !== 'stable') {
        filled += 1;
    }

    return Math.round((filled / total) * 100);
}

export function calculateEvidenceQuality(idea: BusinessIdea): 'incomplete' | 'weak' | 'usable' | 'strong' {
    const percent = calculateEvidencePercent(idea);

    if (percent <= 20) return 'incomplete';
    if (percent <= 50) return 'weak';
    if (percent <= 80) return 'usable';
    return 'strong';
}

export function calculateIdeaScore(idea: BusinessIdea): IdeaScores {
    const scores = calculateScore({
        competitorCount: idea.competitorCount,
        professionalCompetitorCount: idea.professionalCompetitorCount,
        complaintDensity: idea.complaintDensity,
        urgency: idea.urgency,
        willingnessToPay: idea.willingnessToPay,
        commercialCompetition: idea.commercialCompetition,
        keywordCount: idea.keywords.length,
        trendDirection: idea.trendDirection || 'stable',
        painPointEntryCount: (idea.painPointEntries || []).length,
        averageCompetitorRating: idea.competitors?.length
            ? idea.competitors.reduce((sum, c) => sum + c.rating, 0) / idea.competitors.length
            : 0,
        totalSearchVolume: (idea.keywordData || []).reduce((sum, kd) => sum + (kd.monthlyVolume || 0), 0),
    });

    return {
        ...scores,
        evidenceQuality: calculateEvidenceQuality(idea),
        evidencePercent: calculateEvidencePercent(idea),
    };
}
export function getCompetitionVerdict(idea: BusinessIdea): { label: string; color: string; description: string } {
    const profCount = idea.professionalCompetitorCount;
    const totalCount = idea.competitorCount;
    
    if (totalCount === 0) return { label: 'Unbekannt', color: 'gray', description: 'Trage die Anzahl der lokalen Anbieter ein.' };
    
    const profShare = totalCount > 0 ? profCount / totalCount : 0;
    
    if (profCount > 8 || profShare > 0.6) {
        return { 
            label: 'Viele starke Profis', 
            color: '#ef4444', 
            description: 'Der Markt ist fest in der Hand von etablierten Profis. Ein direkter Einstieg ist schwer.' 
        };
    }
    
    if (profCount > 3 || profShare > 0.3) {
        return { 
            label: 'Moderate Konkurrenz', 
            color: '#f59e0b', 
            description: 'Es gibt einige starke Anbieter. Du brauchst ein klares Alleinstellungsmerkmal.' 
        };
    }
    
    if (totalCount > 10) {
        return { 
            label: 'Überfüllter Markt (Hobbyisten)', 
            color: '#f59e0b', 
            description: 'Viele Anbieter, aber kaum Profis. Qualität und Zuverlässigkeit könnten deine Lücke sein.' 
        };
    }
    
    return { 
        label: 'Wenig Profis', 
        color: '#10b981', 
        description: 'Kaum professionelle Konkurrenz. Gute Chancen für einen qualitativen Markteintritt.' 
    };
}
