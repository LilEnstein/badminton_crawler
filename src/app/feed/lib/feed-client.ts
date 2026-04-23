import { getAccessToken } from "@/app/lib/auth-client";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import type { Session } from "@/domain/session/session.entity";

export interface SessionListItem {
  session: ReturnType<Session["toPublic"]> & { id: string };
  matchScore: MatchScore | null;
}

export interface FeedMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface FeedParams {
  levelMin?: number;
  levelMax?: number;
  districts?: string[];
  budgetMax?: number;
  timeSlots?: string[];
  status?: "open" | "all";
  includeNeedsReview?: boolean;
  page?: number;
  pageSize?: number;
}

export async function fetchFeed(params: FeedParams = {}): Promise<{ items: SessionListItem[]; meta: FeedMeta }> {
  const url = new URL("/api/v1/sessions", window.location.origin);

  if (params.levelMin !== undefined) url.searchParams.set("levelMin", String(params.levelMin));
  if (params.levelMax !== undefined) url.searchParams.set("levelMax", String(params.levelMax));
  if (params.districts?.length) url.searchParams.set("districts", params.districts.join(","));
  if (params.budgetMax !== undefined) url.searchParams.set("budgetMax", String(params.budgetMax));
  if (params.timeSlots?.length) url.searchParams.set("timeSlots", params.timeSlots.join(","));
  if (params.status) url.searchParams.set("status", params.status);
  if (params.includeNeedsReview) url.searchParams.set("includeNeedsReview", "true");
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  const json = await res.json();

  if (!res.ok) throw new Error(json?.error?.message ?? "Lỗi tải dữ liệu");

  return {
    items: json.data?.sessions ?? [],
    meta: { total: json.meta?.total ?? 0, page: json.meta?.page ?? 1, pageSize: json.meta?.pageSize ?? 20 }
  };
}

export async function fetchSessionDetail(id: string): Promise<SessionListItem["session"] & { matchScore: MatchScore | null; fbPostUrl: string | null; authorProfileUrl: string | null }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api/v1/sessions/${id}`, { headers });
  const json = await res.json();

  if (!res.ok) throw new Error(json?.error?.message ?? "Không tìm thấy buổi chơi");

  return json.data?.session;
}
