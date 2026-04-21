import { InvalidLevelError } from "./errors";

declare const levelBrand: unique symbol;
export type Level = number & { readonly [levelBrand]: "Level" };

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 10;

export function createLevel(value: number): Level {
  if (!Number.isInteger(value) || value < LEVEL_MIN || value > LEVEL_MAX) {
    throw new InvalidLevelError(value);
  }
  return value as Level;
}

export function isLevel(value: unknown): value is Level {
  return typeof value === "number"
    && Number.isInteger(value)
    && value >= LEVEL_MIN
    && value <= LEVEL_MAX;
}
