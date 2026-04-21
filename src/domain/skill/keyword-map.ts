import { createLevel, type Level } from "./level.value-object";
import { normalize } from "./normalize";

export interface KeywordMapping {
  readonly pattern: string;
  readonly normalizedPattern: string;
  readonly min: Level;
  readonly max: Level;
}

interface RawMapping {
  patterns: string[];
  min: number;
  max: number;
}

const RAW: readonly RawMapping[] = [
  { patterns: ["mới chơi", "newbie", "chưa biết gì"], min: 1, max: 2 },
  { patterns: ["mới tập", "cơ bản", "cầu lông giải trí"], min: 2, max: 3 },
  { patterns: ["TB+++", "gần khá"], min: 7, max: 8 },
  { patterns: ["TB++", "có trình", "đánh smash tốt"], min: 6, max: 7 },
  { patterns: ["TB+", "có chút trình", "chơi khá ổn"], min: 5, max: 6 },
  { patterns: ["TB Khá", "phong trào tốt", "Khá"], min: 9, max: 10 },
  { patterns: ["TB", "trung bình", "chơi được"], min: 4, max: 5 }
];

function buildKeywordMap(): readonly KeywordMapping[] {
  const flat: KeywordMapping[] = [];
  for (const row of RAW) {
    for (const p of row.patterns) {
      flat.push({
        pattern: p,
        normalizedPattern: normalize(p),
        min: createLevel(row.min),
        max: createLevel(row.max)
      });
    }
  }
  flat.sort((a, b) => b.normalizedPattern.length - a.normalizedPattern.length);
  return Object.freeze(flat);
}

export const KEYWORD_MAP: readonly KeywordMapping[] = buildKeywordMap();
