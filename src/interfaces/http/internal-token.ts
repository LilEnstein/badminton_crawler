import type { NextRequest, NextResponse } from "next/server";

import { fail, type Envelope } from "./envelope";

export type InternalTokenResult =
  | { ok: true }
  | { ok: false; response: NextResponse<Envelope<null>> };

export function requireInternalToken(req: NextRequest): InternalTokenResult {
  const token = req.headers.get("x-internal-token");
  const expected = process.env.INTERNAL_TOKEN;
  if (!expected) {
    return { ok: false, response: fail(503, { code: "SERVICE_UNAVAILABLE", message: "Internal token not configured" }) };
  }
  if (!token || token !== expected) {
    return { ok: false, response: fail(401, { code: "UNAUTHORIZED", message: "Missing or invalid X-Internal-Token" }) };
  }
  return { ok: true };
}
