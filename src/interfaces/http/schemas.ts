import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128)
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1).max(128)
  })
  .strict();

export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1)
  })
  .strict()
  .optional();

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
