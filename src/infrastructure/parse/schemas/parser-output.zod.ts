import { z } from "zod";

export const parserOutputSchema = z.object({
  type: z.enum(["looking_for_players", "court_available"]),
  location: z.object({
    district: z.string().nullable(),
    city: z.string().nullable(),
    address: z.string().nullable()
  }),
  datetime: z.object({
    date: z.string().nullable(),
    timeStart: z.string().nullable(),
    timeEnd: z.string().nullable(),
    isRecurring: z.boolean()
  }),
  skillLevel: z.object({
    min: z.number().int().min(1).max(10).nullable(),
    max: z.number().int().min(1).max(10).nullable()
  }),
  budget: z.object({
    amount: z.number().positive().nullable(),
    currency: z.literal("VND"),
    per: z.enum(["session", "hour"]).nullable(),
    negotiable: z.boolean()
  }),
  gender: z.enum(["male", "female", "mixed", "any"]).nullable(),
  playersNeeded: z.number().int().positive().nullable(),
  totalPlayers: z.number().int().positive().nullable(),
  shuttleType: z.enum(["plastic", "feather", "any"]).nullable(),
  contact: z.string().nullable(),
  status: z.enum(["open", "closed", "unknown"]),
  confidence: z.number().min(0).max(1)
});

export type ParserOutputSchema = z.infer<typeof parserOutputSchema>;
