import { Session } from "@/domain/session/session.entity";
import type {
  SessionStatus,
  SessionType,
  SessionGender,
  SessionShuttleType
} from "@/domain/session/session.entity";
import type { SessionRepository } from "@/application/parse/ports";
import type { BadmintonStore, SessionRecord } from "../db/json-store";

function toEntity(r: SessionRecord): Session {
  return Session.create({
    id: r.id,
    rawPostId: r.rawPostId,
    location: r.location,
    datetime: r.datetime,
    skillLevel: r.skillLevel,
    budget: {
      amount: r.budget.amount,
      currency: r.budget.currency,
      per: r.budget.per as "session" | "hour" | null,
      negotiable: r.budget.negotiable
    },
    gender: r.gender as SessionGender,
    playersNeeded: r.playersNeeded,
    totalPlayers: r.totalPlayers,
    shuttleType: r.shuttleType as SessionShuttleType,
    contact: r.contact,
    status: r.status as SessionStatus,
    type: r.type as SessionType,
    confidence: r.confidence,
    needsReview: r.needsReview,
    parsedAt: new Date(r.parsedAt)
  });
}

function toRecord(s: Session): SessionRecord {
  return {
    id: s.id,
    rawPostId: s.rawPostId,
    location: s.location,
    datetime: s.datetime,
    skillLevel: s.skillLevel,
    budget: s.budget,
    gender: s.gender,
    playersNeeded: s.playersNeeded,
    totalPlayers: s.totalPlayers,
    shuttleType: s.shuttleType,
    contact: s.contact,
    status: s.status,
    type: s.type,
    confidence: s.confidence,
    needsReview: s.needsReview,
    parsedAt: s.parsedAt.toISOString()
  };
}

export class JsonSessionRepository implements SessionRepository {
  constructor(private store: BadmintonStore) {}

  async save(session: Session): Promise<void> {
    await this.store.mutate((s) => {
      const idx = s.sessions.findIndex((r) => r.id === session.id);
      if (idx >= 0) {
        s.sessions[idx] = toRecord(session);
      } else {
        s.sessions.push(toRecord(session));
      }
    });
  }

  async findByRawPostId(rawPostId: string): Promise<Session | null> {
    const sessions = await this.store.sessions();
    const record = sessions.find((r) => r.rawPostId === rawPostId) ?? null;
    return record ? toEntity(record) : null;
  }
}
