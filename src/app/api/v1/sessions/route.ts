import { NextRequest } from "next/server";
import { z } from "zod";

import { createSessionFilter } from "@/domain/session/session-filter.value-object";
import { getSessionContainer } from "@/infrastructure/container";
import { authenticate } from "@/interfaces/http/bearer";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIME_SLOTS = ["morning", "noon", "afternoon", "evening"] as const;
const GENDERS = ["male", "female", "mixed", "any"] as const;
const SHUTTLE_TYPES = ["plastic", "feather", "any"] as const;

const querySchema = z
  .object({
    levelMin: z.coerce.number().int().min(1).max(10).optional(),
    levelMax: z.coerce.number().int().min(1).max(10).optional(),
    districts: z.string().transform((s) => s.split(",").filter(Boolean)).optional(),
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),
    timeSlots: z
      .string()
      .transform((s) => s.split(",").filter(Boolean) as (typeof TIME_SLOTS)[number][])
      .optional(),
    gender: z.enum(GENDERS).optional(),
    shuttleTypes: z
      .string()
      .transform((s) => s.split(",").filter(Boolean) as (typeof SHUTTLE_TYPES)[number][])
      .optional(),
    playerCountMin: z.coerce.number().int().min(0).optional(),
    playerCountMax: z.coerce.number().int().min(0).optional(),
    status: z.enum(["open", "all"]).optional(),
    includeNeedsReview: z
      .string()
      .transform((s) => s === "true")
      .optional(),
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional()
  })
  .strict();

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = querySchema.parse(raw);
    const filter = createSessionFilter(parsed);

    const authResult = authenticate(req);
    const userId = authResult.ok ? authResult.caller.userId : undefined;

    const { search } = getSessionContainer();
    const result = await search.execute({ filter, userId });

    return ok(
      { sessions: result.items },
      { total: result.total, page: result.page, pageSize: result.pageSize }
    );
  });
}
