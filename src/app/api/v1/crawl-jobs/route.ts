import { NextRequest } from "next/server";
import { z } from "zod";

import { getCrawlContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const triggerSchema = z.object({
  groupIds: z.array(z.string().min(1)).min(1).optional()
});

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const body = triggerSchema.parse(await req.json());
    const { crawlGroup, listGroups } = getCrawlContainer();

    const groups = body.groupIds
      ? body.groupIds.map((id) => ({ fbGroupId: id }))
      : (await listGroups.execute()).map((g) => ({ fbGroupId: g.fbGroupId }));

    const results: Array<{ groupId: string; newPosts: number; skipped: number; error?: string }> = [];

    for (const group of groups) {
      try {
        const result = await crawlGroup.execute(group.fbGroupId);
        results.push({ groupId: group.fbGroupId, ...result });
      } catch (err) {
        results.push({
          groupId: group.fbGroupId,
          newPosts: 0,
          skipped: 0,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    return ok({ results });
  });
}
