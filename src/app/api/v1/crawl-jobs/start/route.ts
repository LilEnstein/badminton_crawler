import { NextRequest } from "next/server";

import { getCrawlContainer, getParseContainer, getStore } from "@/infrastructure/container";
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

    const crawlResults: Array<{ groupId: string; newPosts: number; skipped: number; error?: string }> = [];

    for (const group of groups) {
      try {
        const result = await crawlGroup.execute(group.fbGroupId);
        crawlResults.push({ groupId: group.fbGroupId, ...result });
      } catch (err) {
        crawlResults.push({
          groupId: group.fbGroupId,
          newPosts: 0,
          skipped: 0,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    const totalNew = crawlResults.reduce((s, r) => s + r.newPosts, 0);
    if (totalNew === 0) {
      return ok({ crawlResults, parsed: 0, parseFailed: 0 });
    }

    const store = getStore();
    const pending = await store.rawPosts().then((posts) => posts.filter((p) => p.parseStatus === "pending"));
    const { parsePost } = getParseContainer();

    let parsed = 0;
    let parseFailed = 0;

    for (const record of pending) {
      try {
        const result = await parsePost.execute(record.id);
        if (result.sessionId) parsed++;
        else parseFailed++;
      } catch {
        parseFailed++;
      }
    }

    return ok({ crawlResults, parsed, parseFailed });
  });
}
