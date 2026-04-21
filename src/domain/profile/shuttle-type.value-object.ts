export const SHUTTLE_TYPES = ["plastic", "feather", "any"] as const;

export type ShuttleType = (typeof SHUTTLE_TYPES)[number];

export function isShuttleType(value: unknown): value is ShuttleType {
  return typeof value === "string" && (SHUTTLE_TYPES as readonly string[]).includes(value);
}
