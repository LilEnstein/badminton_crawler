"use client";

type Key = string | number;

interface Option<T extends Key> {
  value: T;
  label: string;
}

interface SingleProps<T extends Key> {
  options: readonly Option<T>[];
  value: T;
  onChange: (next: T) => void;
}

export function ChipGroupSingle<T extends Key>({ options, value, onChange }: SingleProps<T>) {
  return (
    <div className="chip-group">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`chip${selected ? " selected" : ""}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface MultiProps<T extends Key> {
  options: readonly Option<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
}

export function ChipGroupMulti<T extends Key>({ options, value, onChange }: MultiProps<T>) {
  function toggle(opt: T): void {
    const set = new Set(value);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange([...set]);
  }
  return (
    <div className="chip-group">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            className={`chip${selected ? " selected" : ""}`}
            onClick={() => toggle(opt.value)}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
