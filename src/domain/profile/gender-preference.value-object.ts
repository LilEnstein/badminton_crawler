export const GENDER_PREFERENCES = ["male", "female", "mixed", "any"] as const;

export type GenderPreference = (typeof GENDER_PREFERENCES)[number];

export function isGenderPreference(value: unknown): value is GenderPreference {
  return typeof value === "string"
    && (GENDER_PREFERENCES as readonly string[]).includes(value);
}
