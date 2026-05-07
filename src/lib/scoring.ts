import type { BusinessIdea, IdeaScores, ScoreInput } from '../types';

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

export function calculateScore(input: ScoreInput): Omit<IdeaScores, 'evidenceQuality'> {
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

    const finalScore = Math.round(
        competitionGap * 0.25 +
        painScore * 0.25 +
        commercialScore * 0.2 +
        urgencyScore * 0.2 +
        keywordBreadthScore * 0.1,
    );

    return {
        competitionGap,
        painScore,
        commercialScore,
        urgencyScore,
        keywordBreadthScore,
        finalScore,
    };
}

export function calculateEvidenceQuality(idea: BusinessIdea): 'incomplete' | 'weak' | 'usable' | 'strong' {
    const checkedCount = Object.values(idea.checklist || {}).filter(Boolean).length;
    
    if (checkedCount <= 1) return 'incomplete';
    if (checkedCount <= 3) return 'weak';
    if (checkedCount <= 4) return 'usable';
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
    });

    return {
        ...scores,
        evidenceQuality: calculateEvidenceQuality(idea),
    };
}