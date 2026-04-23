export interface MatchScoreBreakdown {
  level: number | null;
  area: number | null;
  budget: number | null;
  time: number | null;
  shuttle: number | null;
}

export interface MatchScore {
  total: number;
  breakdown: MatchScoreBreakdown;
}
