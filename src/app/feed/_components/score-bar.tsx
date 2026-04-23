interface ScoreBarProps {
  total: number;
}

function scoreColor(total: number) {
  if (total >= 70) return "#00E87A";
  if (total >= 40) return "#FF7A2F";
  return "#FF3B5C";
}

export function ScoreBar({ total }: ScoreBarProps) {
  const color = scoreColor(total);
  return (
    <div className="score-bar-wrap" title={`Điểm phù hợp: ${total}/100`}>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${total}%`, background: color }} />
      </div>
      <span className="score-bar-label" style={{ color }}>{total}</span>
    </div>
  );
}
