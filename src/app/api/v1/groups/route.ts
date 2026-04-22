import { NextRequest } from "next/server";

import { getGroupContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { addGroupSchema } from "@/interfaces/http/group.schemas";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const { list } = getGroupContainer();
    const groups = await list.execute();
    return ok({ groups: groups.map((g) => g.toPublic()) });
  });
}

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const body = addGroupSchema.parse(await req.json());
    const { add, ids, clock } = getGroupContainer();
    const group = await add.execute({
      id: ids.generate(),
      fbGroupId: body.fbGroupId,
      name: body.name,
      url: body.url
    });

    return ok({ group: group.toPublic() }, { status: 201 });
  });
}
