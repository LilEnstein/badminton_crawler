import type { MatchScore } from "@/domain/match/match-score.value-object";
import { WEIGHTS } from "@/domain/match/weights";

interface ScoreBreakdownProps {
  score: MatchScore;
}

const LABELS: Record<keyof typeof WEIGHTS, string> = {
  level:  "🎯 Trình độ",
  area:   "📍 Khu vực",
  budget: "💰 Chi phí",
  time:   "🕖 Thời gian",
  shuttle: "🏸 Cầu"
};

function barColor(pct: number) {
  if (pct >= 0.7) return "#00E87A";
  if (pct >= 0.4) return "#FF7A2F";
  return "#FF3B5C";
}

function totalColor(total: number) {
  if (total >= 70) return "#00E87A";
  if (total >= 40) return "#FF7A2F";
  return "#FF3B5C";
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const criteria = Object.entries(LABELS) as [keyof typeof WEIGHTS, string][];

  return (
    <div className="score-breakdown">
      <div className="score-breakdown-header">
        <span className="score-breakdown-total" style={{ color: totalColor(score.total) }}>
          {score.total}
        </span>
        <span className="score-breakdown-denom">/100</span>
      </div>
      <div className="score-breakdown-title">Phân tích điểm phù hợp</div>
      {criteria.map(([key, label]) => {
        const raw = score.breakdown[key];
        if (raw === null) return null;
        const max = WEIGHTS[key];
        const pct = raw / max;
        return (
          <div key={key} className="score-breakdown-row">
            <span className="score-breakdown-label">{label}</span>
            <div className="score-breakdown-bar-bg">
              <div
                className="score-breakdown-bar-fill"
                style={{ width: `${pct * 100}%`, background: barColor(pct) }}
              />
            </div>
            <span className="score-breakdown-value">{raw}/{max}</span>
          </div>
        );
      })}
    </div>
  );
}
