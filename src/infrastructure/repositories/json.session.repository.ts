import { Session } from "@/domain/session/session.entity";
import type {
  SessionStatus,
  SessionType,
  SessionGender,
  SessionShuttleType
} from "@/domain/session/session.entity";
import type { SessionRepository } from "@/application/parse/ports";
import type { SearchableSessionRepository } from "@/application/session/ports";
import type { SessionFilter } from "@/domain/session/session-filter.value-object";
import type { TimeSlot } from "@/domain/profile/time-slot.value-object";
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

// Derive time slot from an HH:MM string
function timeStartToSlot(timeStart: string): TimeSlot {
  const hour = parseInt(timeStart.split(":")[0] ?? "0", 10);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 14) return "noon";
  if (hour >= 14 && hour < 18) return "afternoon";
  return "evening";
}

// Returns true if the session's start datetime is more than 24 h before `now`
function isExpired(session: Session, now: Date): boolean {
  const { date, timeStart } = session.datetime;
  if (!date) return false;
  const time = timeStart ?? "00:00";
  const start = new Date(`${date}T${time}:00`);
  return now.getTime() - start.getTime() > 24 * 60 * 60 * 1000;
}

// Returns true if session skill level range overlaps the filter level range
function levelOverlaps(session: Session, levelMin: number, levelMax: number): boolean {
  const { min: sMin, max: sMax } = session.skillLevel;
  if (sMin === null && sMax === null) return true;
  const lo = sMin ?? sMax!;
  const hi = sMax ?? sMin!;
  return lo <= levelMax && levelMin <= hi;
}

export class JsonSessionRepository implements SessionRepository, SearchableSessionRepository {
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

  async findById(id: string): Promise<Session | null> {
    const sessions = await this.store.sessions();
    const record = sessions.find((r) => r.id === id) ?? null;
    return record ? toEntity(record) : null;
  }

  async search(filter: SessionFilter, now: Date): Promise<Session[]> {
    const records = await this.store.sessions();
    const all = records.map(toEntity);

    return all.filter((s) => {
      if (isExpired(s, now)) return false;
      if (!filter.includeNeedsReview && s.needsReview) return false;
      if (filter.status === "open" && s.status !== "open") return false;

      if (filter.levelMin !== undefined || filter.levelMax !== undefined) {
        const lo = filter.levelMin ?? 1;
        const hi = filter.levelMax ?? 10;
        if (!levelOverlaps(s, lo, hi)) return false;
      }

      if (filter.districts && filter.districts.length > 0) {
        if (!s.location.district || !filter.districts.includes(s.location.district)) return false;
      }

      if (filter.budgetMin !== undefined && s.budget.amount !== null) {
        if (s.budget.amount < filter.budgetMin) return false;
      }
      if (filter.budgetMax !== undefined && s.budget.amount !== null) {
        if (s.budget.amount > filter.budgetMax) return false;
      }

      if (filter.timeSlots && filter.timeSlots.length > 0) {
        if (!s.datetime.timeStart) return false;
        const slot = timeStartToSlot(s.datetime.timeStart);
        if (!filter.timeSlots.includes(slot)) return false;
      }

      if (filter.gender && filter.gender !== "any") {
        if (s.gender !== filter.gender && s.gender !== "any" && s.gender !== null) return false;
      }

      if (filter.shuttleTypes && filter.shuttleTypes.length > 0) {
        if (s.shuttleType !== null && !filter.shuttleTypes.includes(s.shuttleType)) return false;
      }

      if (filter.playerCountMin !== undefined && s.playersNeeded !== null) {
        if (s.playersNeeded < filter.playerCountMin) return false;
      }
      if (filter.playerCountMax !== undefined && s.playersNeeded !== null) {
        if (s.playersNeeded > filter.playerCountMax) return false;
      }

      return true;
    });
  }
}
