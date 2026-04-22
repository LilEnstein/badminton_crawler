import { NextRequest } from "next/server";

import { getStore } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const store = getStore();
    const [sessions, rawPosts] = await Promise.all([store.sessions(), store.rawPosts()]);

    const postMap = new Map(rawPosts.map((p) => [p.id, p]));

    const enriched = sessions.map((s) => {
      const post = postMap.get(s.rawPostId);
      const fbPostUrl = post
        ? `https://www.facebook.com/groups/${post.groupId}/posts/${post.fbPostId}/`
        : null;
      return {
        ...s,
        fbPostUrl,
        authorProfileUrl: post?.authorProfileUrl ?? null
      };
    });

    return ok({ sessions: enriched, total: enriched.length });
  });
}
