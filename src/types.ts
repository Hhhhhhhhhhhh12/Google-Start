export interface BusinessIdea {
  id: string;
  title: string;
  region: string;
  targetAudience: string;
  keywords: string[];
  
  // Research Data
  competitorCount: number;
  professionalCompetitorCount: number;
  
  // Qualitative Scores (1-10)
  complaintDensity: number; // Beschwerdedichte
  urgency: number; // Dringlichkeit
  willingnessToPay: number; // Zahlungsbereitschaft
  commercialCompetition: number; // Kommerzieller Druck
  
  // Notes & Snippets
  notes: string;
  painPoints: string[];
  
  // Checklist
  checklist: {
    keywordPlannerChecked: boolean;
    googleTrendsChecked: boolean;
    googleMapsChecked: boolean;
    reviewsChecked: boolean;
    cpcChecked: boolean;
  };

  createdAt: number;
  updatedAt: number;
}

export interface IdeaScores {
  competitionGap: number;
  painScore: number;
  commercialScore: number;
  urgencyScore: number;
  keywordBreadthScore: number;
  evidenceQuality: 'incomplete' | 'weak' | 'usable' | 'strong';
  finalScore: number;
}

export interface ScoreInput {
  competitorCount: number;
  professionalCompetitorCount: number;
  complaintDensity: number;
  urgency: number;
  willingnessToPay: number;
  commercialCompetition: number;
  keywordCount: number;
}