import { z } from "zod";

import { GENDER_PREFERENCES, SHUTTLE_TYPES, TIME_SLOTS } from "@/domain/profile";

const timeSlot = z.enum(TIME_SLOTS);
const gender = z.enum(GENDER_PREFERENCES);
const shuttle = z.enum(SHUTTLE_TYPES);

const tolerance = z.union([z.literal(1), z.literal(2)]);

const budgetVnd = z
  .number()
  .int()
  .min(0)
  .max(10_000_000)
  .refine((v) => v % 10_000 === 0, {
    message: "Budget must be in 10,000 VND steps"
  });

export const createProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80),
    level: z.number().int().min(1).max(10),
    levelTolerance: tolerance,
    city: z.string().trim().min(1).max(80),
    districts: z.array(z.string().trim().min(1)).min(1).max(20),
    timeSlots: z.array(timeSlot).min(1),
    budgetVnd,
    shuttleType: shuttle,
    genderPreference: gender
  })
  .strict();

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    level: z.number().int().min(1).max(10).optional(),
    levelTolerance: tolerance.optional(),
    city: z.string().trim().min(1).max(80).optional(),
    districts: z.array(z.string().trim().min(1)).min(1).max(20).optional(),
    timeSlots: z.array(timeSlot).min(1).optional(),
    budgetVnd: budgetVnd.optional(),
    shuttleType: shuttle.optional(),
    genderPreference: gender.optional()
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required"
  });

export type CreateProfileBody = z.infer<typeof createProfileSchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
