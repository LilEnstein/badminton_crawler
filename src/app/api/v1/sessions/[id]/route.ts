import { NextRequest } from "next/server";

import { getSessionContainer } from "@/infrastructure/container";
import { authenticate } from "@/interfaces/http/bearer";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(req, async () => {
    const authResult = authenticate(req);
    const userId = authResult.ok ? authResult.caller.userId : undefined;

    const { detail } = getSessionContainer();
    const dto = await detail.execute({ sessionId: params.id, userId });

    return ok({ session: dto });
  });
}
