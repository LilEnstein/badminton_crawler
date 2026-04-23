"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getStoredUser } from "@/app/lib/auth-client";

import { NeedsReviewBanner } from "../_components/needs-review-banner";
import { ScoreBreakdown } from "../_components/score-breakdown";
import type { fetchSessionDetail } from "../lib/feed-client";
import { fetchSessionDetail as doFetchDetail } from "../lib/feed-client";

type DetailDto = Awaited<ReturnType<typeof fetchSessionDetail>>;

function formatTime(t: string | null) { return t ?? "?"; }

function formatLevel(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min === max || max == null) return `Lv.${min}`;
  if (min == null) return `≤Lv.${max}`;
  return `Lv.${min}–${max}`;
}

function formatBudget(b: DetailDto["budget"]) {
  if (b.negotiable && b.amount == null) return "Thỏa thuận";
  if (b.amount == null) return "—";
  return `${b.amount.toLocaleString("vi-VN")} VND/${b.per ?? "lần"}`;
}

function formatLocation(loc: DetailDto["location"]) {
  const parts = [loc.address, loc.district, loc.city].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

const STATUS_MAP = {
  open:    { label: "Còn chỗ",  cls: "session-status session-status-open" },
  closed:  { label: "Đã đủ",   cls: "session-status session-status-closed" },
  unknown: { label: "?",        cls: "session-status session-status-unknown" },
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredUser()) { router.replace("/login"); return; }
    doFetchDetail(id)
      .then(setSession)
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <main className="feed-page">
        <div className="feed-container">
          <p className="feed-loading">Đang tải...</p>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="feed-page">
        <div className="feed-container">
          <div className="alert">{error ?? "Không tìm thấy buổi chơi."}</div>
          <Link href="/feed" className="btn btn-secondary" style={{ display: "inline-flex", width: "auto", marginTop: 16 }}>
            ← Quay lại
          </Link>
        </div>
      </main>
    );
  }

  const st = STATUS_MAP[session.status];

  return (
    <main className="feed-page">
      <div className="feed-container">
        {/* Header row */}
        <div className="detail-header">
          <Link href="/feed" className="btn btn-secondary detail-back">← Danh sách</Link>
          <span className={`session-type${session.type === "court_available" ? " court" : ""}`}>
            {session.type === "looking_for_players" ? "🏸 Tìm người chơi" : "🏟 Sân trống"}
          </span>
          <span className={st.cls}>{st.label}</span>
        </div>

        {session.needsReview && <NeedsReviewBanner />}

        {/* Score breakdown (shows total prominently) */}
        {session.matchScore && (
          <div className="detail-score">
            <ScoreBreakdown score={session.matchScore} />
          </div>
        )}

        {/* Session info card */}
        <div className="detail-card">
          <div className="detail-card-title">Thông tin buổi chơi</div>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-label">📍 Địa điểm</span>
              <span className="detail-value">{formatLocation(session.location)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">🕖 Thời gian</span>
              <span className="detail-value">
                {session.datetime.date ?? "?"}
                {" "}{formatTime(session.datetime.timeStart)}–{formatTime(session.datetime.timeEnd)}
                {session.datetime.isRecurring ? " (hàng tuần)" : ""}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-label">🎯 Trình độ</span>
              <span className="detail-value">{formatLevel(session.skillLevel.min, session.skillLevel.max)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">💰 Chi phí</span>
              <span className="detail-value">{formatBudget(session.budget)}</span>
            </div>
            {session.playersNeeded != null && (
              <div className="detail-field">
                <span className="detail-label">👥 Cần thêm</span>
                <span className="detail-value">{session.playersNeeded} người</span>
              </div>
            )}
            {session.totalPlayers != null && (
              <div className="detail-field">
                <span className="detail-label">👥 Tổng số</span>
                <span className="detail-value">{session.totalPlayers} người</span>
              </div>
            )}
            {session.gender && (
              <div className="detail-field">
                <span className="detail-label">Giới tính</span>
                <span className="detail-value">{session.gender}</span>
              </div>
            )}
            {session.shuttleType && (
              <div className="detail-field">
                <span className="detail-label">🏸 Cầu</span>
                <span className="detail-value">{session.shuttleType}</span>
              </div>
            )}
            {session.contact && (
              <div className="detail-field detail-field-wide">
                <span className="detail-label">Liên hệ</span>
                <span className="detail-value detail-contact">{session.contact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="detail-actions">
          {session.fbPostUrl && (
            <a
              href={session.fbPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn detail-fb-btn"
            >
              Mở bài đăng Facebook
            </a>
          )}
          {session.authorProfileUrl && (
            <a
              href={session.authorProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Trang cá nhân người đăng
            </a>
          )}
        </div>

        <p className="detail-parsed-at">
          Đã phân tích lúc {new Date(session.parsedAt).toLocaleString("vi-VN")}
        </p>
      </div>
    </main>
  );
}
