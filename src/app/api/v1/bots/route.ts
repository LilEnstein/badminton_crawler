import { NextRequest } from "next/server";
import { z } from "zod";

import { getBotContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const addBotSchema = z.object({
  label: z.string().min(1),
  cookie: z.string().min(1)
});

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const { listBots } = getBotContainer();
    const bots = await listBots();
    return ok({ bots });
  });
}

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const body = addBotSchema.parse(await req.json());
    const { addBot } = getBotContainer();
    const bot = await addBot.execute({ label: body.label, cookiePlaintext: body.cookie });
    return ok({ bot: bot.toPublic() }, { status: 201 });
  });
}
