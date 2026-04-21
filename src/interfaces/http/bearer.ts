import type { NextRequest, NextResponse } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";

import { fail, type Envelope } from "./envelope";

export type AuthenticatedCaller = { userId: string; email: string };

export type BearerResult =
  | { ok: true; caller: AuthenticatedCaller }
  | { ok: false; response: NextResponse<Envelope<null>> };

export function authenticate(req: NextRequest): BearerResult {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return {
      ok: false,
      response: fail(401, { code: "NO_ACCESS_TOKEN", message: "Missing bearer token" })
    };
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = getAuthContainer().tokens.verifyAccess(token);
    return { ok: true, caller: { userId: payload.sub, email: payload.email } };
  } catch {
    return {
      ok: false,
      response: fail(401, { code: "TOKEN_INVALID", message: "Access token invalid" })
    };
  }
}
