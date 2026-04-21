import { InvalidRangeError } from "./errors";
import { createLevel, type Level } from "./level.value-object";

export interface LevelRange {
  readonly min: Level;
  readonly max: Level;
}

export function createLevelRange(min: number, max: number): LevelRange {
  const minL = createLevel(min);
  const maxL = createLevel(max);
  if (minL > maxL) {
    throw new InvalidRangeError(min, max);
  }
  return { min: minL, max: maxL };
}
