"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  postJson,
  type AuthUser
} from "@/app/lib/auth-client";
import { fetchMyProfile, type ProfilePublic } from "@/app/lib/profile-client";

interface SessionRecord {
  id: string;
  rawPostId: string;
  type: "looking_for_players" | "court_available";
  status: "open" | "closed" | "unknown";
  location: { district: string | null; city: string | null; address: string | null };
  datetime: { date: string | null; timeStart: string | null; timeEnd: string | null; isRecurring: boolean };
  skillLevel: { min: number | null; max: number | null };
  budget: { amount: number | null; currency: string; per: string | null; negotiable: boolean };
  gender: string | null;
  playersNeeded: number | null;
  contact: string | null;
  confidence: number;
  needsReview: boolean;
  parsedAt: string;
}

interface SessionItem {
  session: SessionRecord;
  matchScore: { total: number } | null;
}

function formatTime(t: string | null) { return t ?? "?"; }

function formatLevel(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min === max || max == null) return `Lv.${min}`;
  if (min == null) return `≤Lv.${max}`;
  return `${min}–${max}`;
}

function formatBudget(b: SessionRecord["budget"]) {
  if (b.negotiable && b.amount == null) return "Thỏa thuận";
  if (b.amount == null) return "—";
  return `${b.amount.toLocaleString("vi-VN")}đ`;
}

function formatLocation(loc: SessionRecord["location"]) {
  const parts = [loc.address, loc.district, loc.city].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function scoreColor(total: number) {
  if (total >= 70) return "#00E87A";
  if (total >= 40) return "#FF7A2F";
  return "#FF3B5C";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const STATUS_MAP = {
  open:    { label: "Còn chỗ",  cls: "session-status session-status-open" },
  closed:  { label: "Đã đủ",   cls: "session-status session-status-closed" },
  unknown: { label: "?",        cls: "session-status session-status-unknown" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    const token = getAccessToken();
    setLoadingSessions(true);
    fetch("/api/v1/sessions", token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.sessions) setSessions(json.data.sessions as SessionItem[]);
      })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace("/login");
      return;
    }
    Promise.all([
      fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          const json = await res.json().catch(() => null);
          if (!res.ok || !json?.data?.user) throw new Error("session-invalid");
          return json.data.user as AuthUser;
        }),
      fetchMyProfile()
    ])
      .then(([fresh, profRes]) => {
        setUser({ ...stored, ...fresh });
        if (profRes.ok) {
          setProfile(profRes.data.profile);
        } else if (profRes.error.code === "PROFILE_NOT_FOUND") {
          router.replace("/onboarding");
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function onCrawl() {
    const token = getAccessToken();
    if (!token) return;
    setCrawling(true);
    setCrawlResult(null);
    try {
      const res = await fetch("/api/v1/crawl-jobs/start", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: "{}"
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setCrawlResult(`Lỗi: ${json?.error?.message ?? res.statusText}`);
      } else {
        const crawlResults: Array<{ groupId: string; newPosts: number; skipped: number; error?: string }> =
          json?.data?.crawlResults ?? [];
        const totalNew = crawlResults.reduce((s, r) => s + r.newPosts, 0);
        const totalSkip = crawlResults.reduce((s, r) => s + r.skipped, 0);
        const parsed: number = json?.data?.parsed ?? 0;
        const errors = crawlResults.filter((r) => r.error).map((r) => r.error!);
        let msg: string;
        if (crawlResults.length === 0) {
          msg = "Chưa có nhóm nào được cấu hình.";
        } else if (errors.length > 0 && totalNew === 0) {
          msg = `Lỗi: ${errors[0]}`;
        } else if (totalNew === 0) {
          msg = `${totalSkip} bài đã có, không có bài mới.`;
        } else {
          msg = `${totalNew} bài mới, ${parsed} lịch đã phân tích, ${totalSkip} bỏ qua.`;
        }
        setCrawlResult(msg);
        loadSessions();
      }
    } catch (err) {
      setCrawlResult(`Lỗi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCrawling(false);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    await postJson("/api/v1/auth/logout", {});
    clearSession();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card"><p className="subtitle">Đang tải...</p></div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="page" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div className="card dashboard">
        {/* Hero section */}
        <div className="dashboard-hero">
          <div className="dashboard-avatar-wrap">
            <div className="dashboard-avatar">
              {getInitials(profile?.displayName ?? user.email.split("@")[0])}
            </div>
            {profile && <span className="dashboard-avatar-level">Lv.{profile.level}</span>}
          </div>
          <div className="dashboard-hero-text">
            <p className="dashboard-greeting">👋 Chào mừng trở lại</p>
            <h1>{profile?.displayName ?? user.email.split("@")[0]}</h1>
            {profile && (
              <p className="dashboard-hero-sub">
                {profile.city}{profile.districts.length > 0 ? ` · ${profile.districts[0]}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Profile summary */}
        <div className="meta">
          <div><strong>Email:</strong> {user.email}</div>
          {profile && (
            <>
              <div><strong>Trình độ:</strong> Lv.{profile.level} (±{profile.levelTolerance})</div>
              <div><strong>Khu vực:</strong> {profile.city} — {profile.districts.join(", ")}</div>
              <div><strong>Ngân sách:</strong> {profile.budgetVnd.toLocaleString("vi-VN")}đ</div>
            </>
          )}
        </div>

        <div className="dashboard-actions">
          <Link href="/profile" className="btn">Chỉnh sửa hồ sơ</Link>
          <button className="btn btn-danger-text" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>

        {/* Sessions feed */}
        <div className="sessions-feed">
          <div className="sessions-feed-header">
            <h2>Lịch thi đấu ({sessions.length})</h2>
            <div className="crawl-controls">
              <button className="btn btn-crawl" onClick={onCrawl} disabled={crawling}>
                {crawling ? "Đang làm mới..." : "↻ Làm mới"}
              </button>
              {crawlResult && <span className="crawl-result">{crawlResult}</span>}
              <Link href="/feed" className="session-link">Xem tất cả →</Link>
            </div>
          </div>

          {loadingSessions && <p className="empty">Đang tải...</p>}

          {!loadingSessions && sessions.length === 0 && (
            <p className="empty">Chưa có lịch nào. Hãy nhấn &quot;Làm mới&quot; để lấy dữ liệu.</p>
          )}

          {sessions.map(({ session: s, matchScore }) => {
            const st = STATUS_MAP[s.status];
            const color = matchScore ? scoreColor(matchScore.total) : undefined;
            return (
              <div key={s.id} className="session-card" style={{ marginBottom: 12 }}>
                <div className="session-card-top">
                  <span className={`session-type${s.type === "court_available" ? " court" : ""}`}>
                    {s.type === "looking_for_players" ? "🏸 Tìm người chơi" : "🏟 Sân trống"}
                  </span>
                  {matchScore != null && (
                    <div className="session-score-badge">
                      <span className="session-score-num" style={{ color }}>{matchScore.total}</span>
                      <span className="session-score-denom">/100</span>
                    </div>
                  )}
                </div>

                <div className="session-info">
                  <div className="session-info-row">
                    <span>📍</span>
                    <span>{formatLocation(s.location)}</span>
                  </div>
                  <div className="session-info-row">
                    <span>🕖</span>
                    <span>
                      {formatTime(s.datetime.timeStart)}–{formatTime(s.datetime.timeEnd)}
                      {s.datetime.isRecurring ? " · hàng tuần" : ""}
                    </span>
                  </div>
                </div>

                <div className="session-meta-row">
                  <span className={st.cls}>{st.label}</span>
                  <span className="session-meta-chip">{formatLevel(s.skillLevel.min, s.skillLevel.max)}</span>
                  <span className="session-meta-chip">{formatBudget(s.budget)}</span>
                  {s.needsReview && <span className="session-review-badge">⚠ xem lại</span>}
                </div>

                {matchScore && (
                  <>
                    <hr className="session-card-divider" />
                    <div className="session-score-bar-wrap">
                      <div className="session-score-bar-bg">
                        <div className="session-score-bar-fill" style={{ width: `${matchScore.total}%`, background: color }} />
                      </div>
                    </div>
                  </>
                )}

                <div className="session-links">
                  <Link href={`/feed/${s.id}`} className="session-link">Xem chi tiết →</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
