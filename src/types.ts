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
  complaintDensity: number; // How many people are complaining?
  urgency: number; // How fast do they need it?
  willingnessToPay: number; // How much value is at stake?
  commercialCompetition: number; // How much are others spending on ads?
  
  // Notes & Snippets
  notes: string;
  painPoints: string[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface IdeaScores {
  competitionGap: number;
  painScore: number;
  commercialScore: number;
  urgencyScore: number;
  keywordBreadthScore: number;
  finalScore: number;
}
