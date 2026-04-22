import type { ParseFailure } from "@/domain/session/parse-failure.entity";
import type { Session } from "@/domain/session/session.entity";
import type { RawPost } from "@/domain/crawl/raw-post.entity";

export interface ParserOutput {
  type: "looking_for_players" | "court_available";
  location: { district: string | null; city: string | null; address: string | null };
  datetime: {
    date: string | null;
    timeStart: string | null;
    timeEnd: string | null;
    isRecurring: boolean;
  };
  skillLevel: { min: number | null; max: number | null };
  budget: { amount: number | null; currency: string; per: "session" | "hour" | null; negotiable: boolean };
  gender: "male" | "female" | "mixed" | "any" | null;
  playersNeeded: number | null;
  totalPlayers: number | null;
  shuttleType: "plastic" | "feather" | "any" | null;
  contact: string | null;
  status: "open" | "closed" | "unknown";
  confidence: number;
}

export interface PostParser {
  readonly name: string;
  parse(text: string): Promise<ParserOutput>;
}

export interface RawPostReadRepository {
  findById(id: string): Promise<RawPost | null>;
  save(post: RawPost): Promise<void>;
}

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findByRawPostId(rawPostId: string): Promise<Session | null>;
}

export interface ParseFailureRepository {
  save(failure: ParseFailure): Promise<void>;
}
