import { NextRequest } from "next/server";
import { z } from "zod";

import { getParseContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const parseSchema = z.object({
  rawPostId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const { rawPostId } = parseSchema.parse(await req.json());
    const { parsePost } = getParseContainer();

    const result = await parsePost.execute(rawPostId);
    return ok(result);
  });
}
