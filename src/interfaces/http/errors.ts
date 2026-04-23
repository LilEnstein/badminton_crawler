import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import type { DomainError } from "@/domain/user/errors";

import { fail, type Envelope } from "./envelope";

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_CREDENTIALS: 401,
  TOKEN_INVALID: 401,
  TOKEN_REUSE_DETECTED: 401,
  EMAIL_ALREADY_REGISTERED: 409,
  PROFILE_ALREADY_EXISTS: 409,
  USER_NOT_FOUND: 404,
  PROFILE_NOT_FOUND: 404,
  INVALID_EMAIL: 400,
  WEAK_PASSWORD: 400,
  INVALID_LEVEL: 400,
  INVALID_LEVEL_RANGE: 400,
  INVALID_DISPLAY_NAME: 400,
  INVALID_LEVEL_TOLERANCE: 400,
  INVALID_BUDGET: 400,
  INVALID_CITY: 400,
  EMPTY_DISTRICTS: 400,
  EMPTY_TIME_SLOTS: 400,
  UNKNOWN_DISTRICT: 400,
  GROUP_NOT_FOUND: 404,
  DUPLICATE_GROUP: 409,
  GROUP_ACCESS_DENIED: 422,
  INVALID_GROUP_URL: 400,
  ILLEGAL_STATUS_TRANSITION: 422,
  LOGIN_WALL: 503,
  BOT_BANNED: 503,
  DOM_CHANGED: 502,
  BOT_NOT_FOUND: 503,
  RAW_POST_NOT_FOUND: 404,
  INVALID_RAW_POST: 400,
  INVALID_BOT: 400,
  INVALID_PARSER_OUTPUT: 422,
  PROVIDER_UNAVAILABLE: 503,
  SESSION_NOT_FOUND: 404,
  INVALID_FILTER: 400
};

export function zodErrorToResponse(err: ZodError): NextResponse<Envelope<null>> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    fields[issue.path.join(".") || "_"] = issue.message;
  }
  return fail(400, { code: "VALIDATION_ERROR", message: "Invalid input", fields });
}

export function domainErrorToResponse(err: DomainError): NextResponse<Envelope<null>> {
  const status = STATUS_BY_CODE[err.code] ?? 500;
  return fail(status, { code: err.code, message: err.message });
}

export function unexpectedErrorToResponse(): NextResponse<Envelope<null>> {
  return fail(500, { code: "INTERNAL_ERROR", message: "Something went wrong" });
}
