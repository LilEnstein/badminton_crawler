"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

function formatTime(t: string | null) {
  return t ?? "?";
}

function formatLevel(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min === max || max == null) return `${min}`;
  if (min == null) return `≤${max}`;
  return `${min}–${max}`;
}

function formatBudget(b: SessionRecord["budget"]) {
  if (b.negotiable && b.amount == null) return "Thỏa thuận";
  if (b.amount == null) return "—";
  return `${b.amount.toLocaleString("vi-VN")} VND/${b.per ?? "lần"}`;
}

function formatLocation(loc: SessionRecord["location"]) {
  const parts = [loc.address, loc.district, loc.city].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfilePublic | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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
    fetch("/api/v1/sessions")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.sessions) setSessions(json.data.sessions);
      })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, []);

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
        <h1>Xin chào {profile?.displayName ?? ""}</h1>
        <p className="subtitle">BadmintonFinder — tìm lịch đánh cầu lông gần bạn</p>

        <div className="meta">
          <div><strong>Email:</strong> {user.email}</div>
          {profile && (
            <>
              <div><strong>Trình độ:</strong> {profile.level} (±{profile.levelTolerance})</div>
              <div><strong>Khu vực:</strong> {profile.city} — {profile.districts.join(", ")}</div>
              <div><strong>Ngân sách:</strong> {profile.budgetVnd.toLocaleString("vi-VN")} VND</div>
            </>
          )}
        </div>

        <div className="dashboard-actions">
          <Link href="/profile" className="btn btn-secondary">Chỉnh sửa hồ sơ</Link>
          <button className="btn" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>

        <div className="sessions-feed">
          <h2>Lịch thi đấu gần đây ({sessions.length})</h2>

          {loadingSessions && <p className="empty">Đang tải...</p>}

          {!loadingSessions && sessions.length === 0 && (
            <p className="empty">Chưa có lịch nào. Hãy chạy crawler để lấy dữ liệu.</p>
          )}

          {sessions.map((s) => (
            <div key={s.id} className="session-card">
              <div className="session-header">
                <span className={`session-type${s.type === "court_available" ? " court" : ""}`}>
                  {s.type === "looking_for_players" ? "Tìm người chơi" : "Sân trống"}
                </span>
                <span>
                  <span className={`session-status${s.status === "closed" ? " closed" : ""}`}>
                    {s.status === "open" ? "Còn chỗ" : s.status === "closed" ? "Đã đủ" : "?"}
                  </span>
                  {s.needsReview && <span className="session-review-badge">⚠ cần xem lại</span>}
                </span>
              </div>

              <div className="session-rows">
                <span><strong>Địa điểm:</strong> {formatLocation(s.location)}</span>
                <span>
                  <strong>Giờ:</strong>{" "}
                  {formatTime(s.datetime.timeStart)}–{formatTime(s.datetime.timeEnd)}
                  {s.datetime.isRecurring ? " (hàng tuần)" : ""}
                </span>
                <span><strong>Trình độ:</strong> {formatLevel(s.skillLevel.min, s.skillLevel.max)}</span>
                <span><strong>Phí:</strong> {formatBudget(s.budget)}</span>
                {s.playersNeeded != null && (
                  <span><strong>Cần:</strong> {s.playersNeeded} người</span>
                )}
                <span><strong>Giới tính:</strong> {s.gender ?? "—"}</span>
              </div>

              {s.contact && (
                <div className="session-contact">
                  <strong>{s.contact}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
