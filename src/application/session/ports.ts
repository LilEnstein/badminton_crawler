import type { Session } from "@/domain/session/session.entity";
import type { SessionFilter } from "@/domain/session/session-filter.value-object";
import type { UserProfile } from "@/domain/profile/user-profile.entity";

export interface SearchableSessionRepository {
  search(filter: SessionFilter, now: Date): Promise<Session[]>;
  findById(id: string): Promise<Session | null>;
}

export interface SessionUserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
}

export interface RawPostFinder {
  findById(id: string): Promise<{ groupId: string; fbPostId: string; authorProfileUrl: string | null } | null>;
}
