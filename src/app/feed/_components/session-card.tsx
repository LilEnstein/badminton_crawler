import Link from "next/link";

import type { MatchScore } from "@/domain/match/match-score.value-object";

interface SessionCardProps {
  session: {
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
    needsReview: boolean;
  };
  matchScore: MatchScore | null;
}

function formatTime(t: string | null) { return t ?? "?"; }

function formatLevel(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min === max || max == null) return `Lv.${min}`;
  if (min == null) return `≤Lv.${max}`;
  return `Lv.${min}–${max}`;
}

function formatBudget(b: SessionCardProps["session"]["budget"]) {
  if (b.negotiable && b.amount == null) return "Thỏa thuận";
  if (b.amount == null) return null;
  return `${b.amount.toLocaleString("vi-VN")}đ`;
}

function formatLocation(loc: SessionCardProps["session"]["location"]) {
  const parts = [loc.address, loc.district, loc.city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function scoreColor(total: number) {
  if (total >= 70) return "#00E87A";
  if (total >= 40) return "#FF7A2F";
  return "#FF3B5C";
}

const STATUS_MAP = {
  open:    { label: "Còn chỗ",  cls: "session-status session-status-open" },
  closed:  { label: "Đã đủ",   cls: "session-status session-status-closed" },
  unknown: { label: "?",        cls: "session-status session-status-unknown" },
};

export function SessionCard({ session: s, matchScore }: SessionCardProps) {
  const color = matchScore ? scoreColor(matchScore.total) : undefined;
  const st = STATUS_MAP[s.status];
  const level = formatLevel(s.skillLevel.min, s.skillLevel.max);
  const budget = formatBudget(s.budget);
  const location = formatLocation(s.location);

  return (
    <Link href={`/feed/${s.id}`} className="session-card-link">
      <div className="session-card">
        {/* Top row: type badge + score badge */}
        <div className="session-card-top">
          <span className={`session-type${s.type === "court_available" ? " court" : ""}`}>
            {s.type === "looking_for_players" ? "🏸 Tìm người chơi" : "🏟 Sân trống"}
          </span>
          {matchScore && (
            <div className="session-score-badge">
              <span className="session-score-num" style={{ color }}>
                {matchScore.total}
              </span>
              <span className="session-score-denom">/100</span>
            </div>
          )}
        </div>

        {/* Location + time */}
        <div className="session-info">
          {location && (
            <div className="session-info-row">
              <span>📍</span>
              <span>{location}</span>
            </div>
          )}
          <div className="session-info-row">
            <span>🕖</span>
            <span>
              {formatTime(s.datetime.timeStart)}–{formatTime(s.datetime.timeEnd)}
              {s.datetime.isRecurring
                ? " · hàng tuần"
                : s.datetime.date
                  ? ` · ${s.datetime.date}`
                  : ""}
            </span>
          </div>
        </div>

        {/* Status + meta chips */}
        <div className="session-meta-row">
          <span className={st.cls}>{st.label}</span>
          {level && <span className="session-meta-chip">{level}</span>}
          {budget && <span className="session-meta-chip">{budget}</span>}
          {s.playersNeeded != null && (
            <span className="session-meta-chip">👥 +{s.playersNeeded}</span>
          )}
          {s.needsReview && <span className="session-review-badge">⚠ xem lại</span>}
        </div>

        {/* Score progress bar */}
        {matchScore && (
          <>
            <hr className="session-card-divider" />
            <div className="session-score-bar-wrap">
              <div className="session-score-bar-bg">
                <div
                  className="session-score-bar-fill"
                  style={{ width: `${matchScore.total}%`, background: color }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
