import { NextRequest } from "next/server";

import { getCrawlContainer, getParseContainer, getStore } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { authenticate } from "@/interfaces/http/bearer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = authenticate(req);
    if (!auth.ok) return auth.response;

    const { crawlGroup, listGroups } = getCrawlContainer();
    const dbGroups = await listGroups.execute();
    const groups = dbGroups.length > 0 ? dbGroups : getEnvGroups();

    const crawlResults: Array<{
      groupId: string;
      newPosts: number;
      skipped: number;
      error?: string;
      diagnostics?: unknown;
    }> = [];

    for (const group of groups) {
      try {
        const result = await crawlGroup.execute(group.fbGroupId);
        crawlResults.push({
          groupId: group.fbGroupId,
          newPosts: result.newPosts,
          skipped: result.skipped,
          diagnostics: result.diagnostics ?? undefined
        });
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

// Fallback: parse group IDs from FACEBOOK_GROUP_URLS env var when no groups are in the DB.
// Accepts full URLs (https://facebook.com/groups/123) or bare IDs (123).
function getEnvGroups(): Array<{ fbGroupId: string }> {
  const raw = process.env.FACEBOOK_GROUP_URLS ?? "";
  return raw
    .split(",")
    .map((s) => {
      const trimmed = s.trim();
      const match = trimmed.match(/\/groups\/([^/?]+)/);
      return match ? match[1] : trimmed;
    })
    .filter(Boolean)
    .map((fbGroupId) => ({ fbGroupId }));
}
