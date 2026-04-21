import { KEYWORD_MAP } from "./keyword-map";
import { createLevelRange, type LevelRange } from "./level-range.value-object";
import { normalize } from "./normalize";

export function keywordsToLevelRange(text: string): LevelRange | null {
  const haystack = normalize(text);
  if (!haystack) return null;
  for (const entry of KEYWORD_MAP) {
    if (haystack.includes(entry.normalizedPattern)) {
      return { min: entry.min, max: entry.max };
    }
  }
  return null;
}

export function overlaps(a: LevelRange, b: LevelRange): boolean {
  return a.min <= b.max && b.min <= a.max;
}

export function distance(a: LevelRange, b: LevelRange): number {
  if (overlaps(a, b)) return 0;
  if (a.max < b.min) return b.min - a.max;
  return a.min - b.max;
}

export function expandRange(center: number, tolerance: 1 | 2): LevelRange {
  const lo = Math.max(1, center - tolerance);
  const hi = Math.min(10, center + tolerance);
  return createLevelRange(lo, hi);
}
