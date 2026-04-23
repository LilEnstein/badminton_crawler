import type { MatchScoreCalculator } from "@/application/match/ports";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import type { Session } from "@/domain/session/session.entity";
import type { SessionFilter } from "@/domain/session/session-filter.value-object";

import type { SearchableSessionRepository, SessionUserProfileRepository } from "./ports";

export interface SearchSessionsInput {
  filter: SessionFilter;
  userId?: string;
  now?: Date;
}

export interface SessionListItem {
  session: ReturnType<Session["toPublic"]>;
  matchScore: MatchScore | null;
}

export interface SearchSessionsOutput {
  items: SessionListItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface Deps {
  sessionRepo: SearchableSessionRepository;
  profileRepo: SessionUserProfileRepository;
  scoreCalc: MatchScoreCalculator;
}

export class SearchSessionsUseCase {
  constructor(private deps: Deps) {}

  async execute(input: SearchSessionsInput): Promise<SearchSessionsOutput> {
    const { filter, userId, now = new Date() } = input;
    const { sessionRepo, profileRepo, scoreCalc } = this.deps;

    const [sessions, profile] = await Promise.all([
      sessionRepo.search(filter, now),
      userId ? profileRepo.findByUserId(userId) : Promise.resolve(null)
    ]);

    type ScoredItem = { session: Session; matchScore: MatchScore | null };

    const scored: ScoredItem[] = sessions.map((s) => ({
      session: s,
      matchScore: profile ? scoreCalc.calculate(profile, s) : null
    }));

    scored.sort((a, b) => {
      if (a.matchScore && b.matchScore) {
        return b.matchScore.total - a.matchScore.total;
      }
      const dateA = a.session.datetime.date ?? "";
      const dateB = b.session.datetime.date ?? "";
      return dateA.localeCompare(dateB);
    });

    const total = scored.length;
    const { page, pageSize } = filter;
    const start = (page - 1) * pageSize;
    const page_items = scored.slice(start, start + pageSize);

    return {
      items: page_items.map((i) => ({ session: i.session.toPublic(), matchScore: i.matchScore })),
      total,
      page,
      pageSize
    };
  }
}
