import { NextRequest } from "next/server";

import { getProfileContainer } from "@/infrastructure/container";
import { authenticate } from "@/interfaces/http/bearer";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { createProfileSchema } from "@/interfaces/http/profile.schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = authenticate(req);
    if (!auth.ok) return auth.response;

    const body = createProfileSchema.parse(await req.json());
    const { create } = getProfileContainer();
    const profile = await create.execute({
      userId: auth.caller.userId,
      ...body
    });

    return ok({ profile: profile.toPublic() }, { status: 201 });
  });
}
