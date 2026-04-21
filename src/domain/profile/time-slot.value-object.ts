export const TIME_SLOTS = ["morning", "noon", "afternoon", "evening"] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export function isTimeSlot(value: unknown): value is TimeSlot {
  return typeof value === "string" && (TIME_SLOTS as readonly string[]).includes(value);
}
