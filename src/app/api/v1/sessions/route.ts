import { NextRequest } from "next/server";

import { getStore } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const store = getStore();
    const records = await store.sessions();
    return ok({ sessions: records, total: records.length });
  });
}
