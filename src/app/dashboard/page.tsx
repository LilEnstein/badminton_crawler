"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  type AuthUser
} from "@/app/lib/auth-client";
import { fetchMyProfile, type ProfilePublic } from "@/app/lib/profile-client";
import { TopBar } from "@/app/_components/top-bar";

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
interface SessionItem { session: SessionRecord; matchScore: { total: number } | null; }

const LEVEL_LABELS: Record<number, string> = {
  1: "Mới", 2: "Mới", 3: "Y", 4: "Y+", 5: "TB", 6: "TB+", 7: "Khá", 8: "Khá+", 9: "Cao", 10: "Cao+"
};
const STATUS_MAP = {
  open:    { label: "Còn chỗ",  cls: "session-status session-status-open" },
  closed:  { label: "Đã đủ",   cls: "session-status session-status-closed" },
  unknown: { label: "?",        cls: "session-status session-status-unknown" },
};
const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getInitials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function getLevelLabel(level: number) { return LEVEL_LABELS[level] ?? `Lv.${level}`; }
function scoreLabel(total: number) {
  if (total >= 70) return "Rất phù hợp";
  if (total >= 40) return "Phù hợp";
  return "Ít phù hợp";
}
function scoreColor(total: number) {
  if (total >= 70) return "#00E87A";
  if (total >= 40) return "#FF7A2F";
  return "#FF3B5C";
}
function formatTime(t: string | null) { return t ?? "?"; }
function formatLevel(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min === max || max == null) return `Lv.${min}`;
  if (min == null) return `≤Lv.${max}`;
  return `${min}–${max}`;
}
function formatBudget(b: SessionRecord["budget"]) {
  if (b.negotiable && b.amount == null) return "Thỏa thuận";
  if (b.amount == null) return null;
  return `${b.amount.toLocaleString("vi-VN")}đ`;
}
function getMostCommonDay(sessions: SessionItem[]): string {
  const count: Record<number, number> = {};
  for (const { session: s } of sessions) {
    if (!s.datetime.date) continue;
    const d = new Date(s.datetime.date).getDay();
    count[d] = (count[d] ?? 0) + 1;
  }
  const entries = Object.entries(count);
  if (!entries.length) return "—";
  return DAYS[Number(entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0][0])];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlMsg, setCrawlMsg] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    const token = getAccessToken();
    setLoadingSessions(true);
    fetch("/api/v1/sessions", token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((r) => r.json())
      .then((json) => { if (json?.data?.sessions) setSessions(json.data.sessions); })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) { router.replace("/login"); return; }
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
        if (profRes.ok) setProfile(profRes.data.profile);
        else if (profRes.error.code === "PROFILE_NOT_FOUND") { router.replace("/onboarding"); return; }
        setLoading(false);
      })
      .catch(() => { clearSession(); router.replace("/login"); });
  }, [router]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  async function onCrawl() {
    const token = getAccessToken();
    if (!token) return;
    setCrawling(true); setCrawlMsg(null);
    try {
      const res = await fetch("/api/v1/crawl-jobs/start", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{}"
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setCrawlMsg(`Lỗi: ${json?.error?.message ?? res.statusText}`); return; }
      type CrawlRow = { groupId: string; newPosts: number; skipped: number; error?: string; diagnostics?: { hasLoginForm: boolean; isLoginWallUrl: boolean; navError: string | null; postIdsFound: number; htmlLength: number; pageTitle: string } };
      const results: CrawlRow[] = json?.data?.crawlResults ?? [];
      const totalNew = results.reduce((s, r) => s + r.newPosts, 0);
      const parsed: number = json?.data?.parsed ?? 0;
      const err = results.find((r) => r.error)?.error;
      if (!results.length) setCrawlMsg("Chưa có nhóm nào được cấu hình.");
      else if (err && totalNew === 0) setCrawlMsg(`Lỗi: ${err}`);
      else if (totalNew === 0) {
        const d = results[0]?.diagnostics;
        const reason = d?.isLoginWallUrl || d?.hasLoginForm ? "Facebook chặn (cần làm mới cookie bot)"
          : d?.navError ? `Lỗi tải trang: ${d.navError}`
          : `Không thấy bài viết (postIds=${d?.postIdsFound ?? 0})`;
        setCrawlMsg(reason);
      } else { setCrawlMsg(`${totalNew} bài mới, ${parsed} lịch đã phân tích.`); loadSessions(); }
    } catch (err) { setCrawlMsg(`Lỗi: ${err instanceof Error ? err.message : String(err)}`); }
    finally { setCrawling(false); }
  }

  if (loading) return <main className="page"><div className="card"><p className="subtitle">Đang tải...</p></div></main>;
  if (!user) return null;

  const displayName = profile?.displayName ?? user.email.split("@")[0];
  const topBarUser = { displayName, email: user.email, level: profile?.level ?? null, city: profile?.city, district: profile?.districts?.[0] };

  return (
    <>
      <TopBar user={topBarUser} />
      <main className="page dash-page">
        <div className="card dashboard">

          {/* ── Unified profile card ── */}
          <div className="profile-unified">
            <div className="profile-u-avatar-wrap">
              <div className="profile-u-avatar">{getInitials(displayName)}</div>
              {profile && <span className="profile-u-level-badge">Lv.{profile.level}</span>}
            </div>
            <div className="profile-u-info">
              <div className="profile-u-name-row">
                <h2 className="profile-u-name">{displayName}</h2>
                <Link href="/profile" className="btn-edit-profile">✏ Sửa</Link>
              </div>
              <p className="profile-u-meta">
                {user.email}
                {profile?.city ? ` · ${profile.city}` : ""}
                {profile?.districts?.[0] ? ` · ${profile.districts[0]}` : ""}
              </p>
              {profile && (
                <div className="profile-u-tags">
                  <span className="profile-tag-level">
                    {getLevelLabel(profile.level)} · Lv.{profile.level} (±{profile.levelTolerance})
                  </span>
                  <span className="profile-tag-budget">
                    ≤ {profile.budgetVnd.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="dash-stats">
            {[
              { val: profile?.sessionsCount ?? (sessions.length || "0"), lbl: "Buổi chơi" },
              { val: profile?.favoriteCourts || profile?.districts?.length || "—", lbl: "Sân ưa thích" },
              { val: profile?.favoriteDays?.length ? profile.favoriteDays.join(", ") : getMostCommonDay(sessions), lbl: "Ngày hay chơi" },
            ].map(({ val, lbl }) => (
              <Link href="/profile" key={lbl} className="dash-stat" title="Bấm để chỉnh sửa">
                <span className="dash-stat-val">{val}</span>
                <span className="dash-stat-lbl">{lbl}</span>
              </Link>
            ))}
          </div>

          {/* ── Sessions ── */}
          <div className="sessions-section">
            <div className="sessions-header">
              <h2 className="sessions-title">Lịch thi đấu ({sessions.length})</h2>
              <div className="sessions-header-actions">
                <button className="btn-refresh" onClick={onCrawl} disabled={crawling}>
                  {crawling ? "↻ Đang..." : "↻ Làm mới"}
                </button>
                <Link href="/feed" className="session-link">Xem tất cả →</Link>
              </div>
            </div>
            {crawlMsg && <p className="crawl-result">{crawlMsg}</p>}
            {loadingSessions && <p className="empty">Đang tải...</p>}
            {!loadingSessions && sessions.length === 0 && (
              <p className="empty">Chưa có lịch nào. Hãy nhấn &quot;Làm mới&quot; để lấy dữ liệu.</p>
            )}
            {sessions.map(({ session: s, matchScore }) => {
              const st = STATUS_MAP[s.status];
              const color = matchScore ? scoreColor(matchScore.total) : undefined;
              const title = s.location.address || s.location.district || "Không rõ địa điểm";
              const levelStr = formatLevel(s.skillLevel.min, s.skillLevel.max);
              const budgetStr = formatBudget(s.budget);
              return (
                <div key={s.id} className="session-card-v2">
                  <div className="session-card-v2-body">
                    <div className="session-card-v2-left">
                      <span className={`session-type${s.type === "court_available" ? " court" : ""}`}>
                        {s.type === "looking_for_players" ? "🏸 Tìm người chơi" : "🏟 Sân trống"}
                      </span>
                      <h3 className="session-title">{title}</h3>
                      <div className="session-meta-lines">
                        {s.location.district && (
                          <span className="session-meta-row">
                            📍 {s.location.district}{s.location.city ? ` · ${s.location.city}` : ""}
                          </span>
                        )}
                        <span className="session-meta-row">
                          🕐 {formatTime(s.datetime.timeStart)}–{formatTime(s.datetime.timeEnd)}
                          {s.datetime.isRecurring ? " · Hàng tuần" : ""}
                          {levelStr ? ` · ${levelStr}` : ""}
                        </span>
                      </div>
                      <div className="session-chips-row">
                        <span className={st.cls}>{st.label}</span>
                        {s.playersNeeded != null && s.playersNeeded > 0 && (
                          <span className="chip-urgency">Còn {s.playersNeeded} người</span>
                        )}
                        {levelStr && <span className="session-meta-chip">{levelStr}</span>}
                        {budgetStr && <span className="session-meta-chip">{budgetStr}</span>}
                        {s.needsReview && <span className="session-review-badge">⚠ xem lại</span>}
                      </div>
                      {matchScore && (
                        <div className="session-score-bar-wrap">
                          <div className="session-score-bar-bg">
                            <div className="session-score-bar-fill" style={{ width: `${matchScore.total}%`, background: color }} />
                          </div>
                          <span className="session-score-pct" style={{ color }}>{matchScore.total}%</span>
                        </div>
                      )}
                    </div>
                    {matchScore && (
                      <div className="session-score-widget">
                        <span className="session-score-big" style={{ color }}>{matchScore.total}</span>
                        <span className="session-score-denom">/100</span>
                        <span className="session-score-label" style={{ color }}>{scoreLabel(matchScore.total)}</span>
                      </div>
                    )}
                  </div>
                  <div className="session-card-footer">
                    <Link href={`/feed/${s.id}`} className="session-link">Xem chi tiết →</Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </>
  );
}
