import { z } from "zod";

export const addGroupSchema = z.object({
  fbGroupId: z.string().min(1),
  name: z.string().min(1).max(200),
  url: z.string().url()
});

export const updateGroupStatusSchema = z.object({
  status: z.enum(["active", "paused", "no_access"])
});
