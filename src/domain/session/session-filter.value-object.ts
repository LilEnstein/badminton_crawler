import type { TimeSlot } from "@/domain/profile/time-slot.value-object";

import type { SessionGender, SessionShuttleType } from "./session.entity";
import { InvalidFilterError } from "./errors";

export interface SessionFilter {
  levelMin?: number;
  levelMax?: number;
  districts?: string[];
  budgetMin?: number;
  budgetMax?: number;
  timeSlots?: TimeSlot[];
  gender?: SessionGender;
  shuttleTypes?: SessionShuttleType[];
  playerCountMin?: number;
  playerCountMax?: number;
  status: "open" | "all";
  includeNeedsReview: boolean;
  page: number;
  pageSize: number;
}

export type RawSessionFilter = Partial<Omit<SessionFilter, "status" | "includeNeedsReview" | "page" | "pageSize">> & {
  status?: "open" | "all";
  includeNeedsReview?: boolean;
  page?: number;
  pageSize?: number;
};

export function createSessionFilter(raw: RawSessionFilter): SessionFilter {
  const { levelMin, levelMax, budgetMin, budgetMax, playerCountMin, playerCountMax } = raw;

  if (levelMin !== undefined && (levelMin < 1 || levelMin > 10)) {
    throw new InvalidFilterError("levelMin must be 1–10");
  }
  if (levelMax !== undefined && (levelMax < 1 || levelMax > 10)) {
    throw new InvalidFilterError("levelMax must be 1–10");
  }
  if (levelMin !== undefined && levelMax !== undefined && levelMin > levelMax) {
    throw new InvalidFilterError("levelMin must be <= levelMax");
  }
  if (budgetMin !== undefined && budgetMin < 0) {
    throw new InvalidFilterError("budgetMin must be >= 0");
  }
  if (budgetMax !== undefined && budgetMax < 0) {
    throw new InvalidFilterError("budgetMax must be >= 0");
  }
  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
    throw new InvalidFilterError("budgetMin must be <= budgetMax");
  }
  if (playerCountMin !== undefined && playerCountMin < 0) {
    throw new InvalidFilterError("playerCountMin must be >= 0");
  }
  if (playerCountMax !== undefined && playerCountMax < 0) {
    throw new InvalidFilterError("playerCountMax must be >= 0");
  }

  const page = raw.page ?? 1;
  const pageSize = raw.pageSize ?? 20;

  if (page < 1) throw new InvalidFilterError("page must be >= 1");
  if (pageSize < 1 || pageSize > 100) throw new InvalidFilterError("pageSize must be 1–100");

  return {
    ...raw,
    status: raw.status ?? "open",
    includeNeedsReview: raw.includeNeedsReview ?? false,
    page,
    pageSize
  };
}
