import { NextRequest } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";
import { ok, fail } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const header = req.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return fail(401, { code: "NO_ACCESS_TOKEN", message: "Missing bearer token" });
    }
    const token = header.slice("Bearer ".length);
    try {
      const payload = getAuthContainer().tokens.verifyAccess(token);
      return ok({ user: { id: payload.sub, email: payload.email } });
    } catch {
      return fail(401, { code: "TOKEN_INVALID", message: "Access token invalid" });
    }
  });
}
