export const WEIGHTS = {
  level: 30,
  area: 20,
  budget: 20,
  time: 20,
  shuttle: 10
} as const;

export type CriterionKey = keyof typeof WEIGHTS;
