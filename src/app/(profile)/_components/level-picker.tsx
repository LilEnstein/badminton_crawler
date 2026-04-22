"use client";

import { LEVELS } from "@/domain/skill";

interface Props {
  value: number;
  onChange: (level: number) => void;
}

export function LevelPicker({ value, onChange }: Props) {
  return (
    <div className="level-picker">
      <div className="level-grid">
        {LEVELS.map((d) => {
          const selected = d.level === value;
          return (
            <button
              key={d.level}
              type="button"
              className={`level-chip${selected ? " selected" : ""}`}
              onClick={() => onChange(d.level)}
              aria-pressed={selected}
            >
              <span className="level-num">{d.level}</span>
              <span className="level-name">{d.name}</span>
            </button>
          );
        })}
      </div>
      <div className="level-detail">
        {LEVELS.find((d) => d.level === value)?.techniqueBrief ?? ""}
      </div>
    </div>
  );
}
