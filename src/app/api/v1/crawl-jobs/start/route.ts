import { NextRequest } from "next/server";

import { getCrawlContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { authenticate } from "@/interfaces/http/bearer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = authenticate(req);
    if (!auth.ok) return auth.response;

    const { crawlGroup, listGroups } = getCrawlContainer();
    const groups = await listGroups.execute();

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
