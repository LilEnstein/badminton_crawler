import { NextRequest } from "next/server";

import { getGroupContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { updateGroupStatusSchema } from "@/interfaces/http/group.schemas";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const body = updateGroupStatusSchema.parse(await req.json());
    const { updateStatus } = getGroupContainer();
    const group = await updateStatus.execute({ id: params.id, status: body.status });
    return ok({ group: group.toPublic() });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const { remove } = getGroupContainer();
    await remove.execute(params.id);
    return ok(null, { status: 204 });
  });
}
