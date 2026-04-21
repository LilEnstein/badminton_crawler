import { NextRequest } from "next/server";

import { getProfileContainer } from "@/infrastructure/container";
import { authenticate } from "@/interfaces/http/bearer";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { updateProfileSchema } from "@/interfaces/http/profile.schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const auth = authenticate(req);
    if (!auth.ok) return auth.response;

    const { get } = getProfileContainer();
    const profile = await get.execute(auth.caller.userId);
    return ok({ profile: profile.toPublic() });
  });
}

export async function PATCH(req: NextRequest) {
  return handle(req, async () => {
    const auth = authenticate(req);
    if (!auth.ok) return auth.response;

    const body = updateProfileSchema.parse(await req.json());
    const { update } = getProfileContainer();
    const profile = await update.execute({
      userId: auth.caller.userId,
      patch: body
    });

    return ok({ profile: profile.toPublic() });
  });
}
