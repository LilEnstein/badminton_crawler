import type { NextRequest, NextResponse } from "next/server";

import { DomainError } from "@/domain/user/errors";

import type { Envelope } from "./envelope";
import {
  domainErrorToResponse,
  unexpectedErrorToResponse,
  zodErrorToResponse
} from "./errors";

export async function handle<T>(
  _req: NextRequest,
  fn: () => Promise<NextResponse<Envelope<T>>>
): Promise<NextResponse<Envelope<T | null>>> {
  try {
    return (await fn()) as NextResponse<Envelope<T | null>>;
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return zodErrorToResponse(err as never) as NextResponse<Envelope<T | null>>;
    }
    if (err instanceof DomainError) {
      return domainErrorToResponse(err) as NextResponse<Envelope<T | null>>;
    }
    console.warn("auth:unexpected-error", err);
    return unexpectedErrorToResponse() as NextResponse<Envelope<T | null>>;
  }
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
