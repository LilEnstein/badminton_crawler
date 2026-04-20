import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import {
  DomainError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidEmailError,
  TokenInvalidError,
  TokenReuseError,
  UserNotFoundError,
  WeakPasswordError
} from "@/domain/user/errors";

import { fail, type Envelope } from "./envelope";

export function zodErrorToResponse(err: ZodError): NextResponse<Envelope<null>> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    fields[issue.path.join(".") || "_"] = issue.message;
  }
  return fail(400, { code: "VALIDATION_ERROR", message: "Invalid input", fields });
}

export function domainErrorToResponse(err: DomainError): NextResponse<Envelope<null>> {
  if (err instanceof InvalidCredentialsError) {
    return fail(401, { code: err.code, message: err.message });
  }
  if (err instanceof EmailAlreadyRegisteredError) {
    return fail(409, { code: err.code, message: err.message });
  }
  if (err instanceof InvalidEmailError || err instanceof WeakPasswordError) {
    return fail(400, { code: err.code, message: err.message });
  }
  if (err instanceof TokenInvalidError || err instanceof TokenReuseError) {
    return fail(401, { code: err.code, message: err.message });
  }
  if (err instanceof UserNotFoundError) {
    return fail(404, { code: err.code, message: err.message });
  }
  return fail(500, { code: err.code, message: err.message });
}

export function unexpectedErrorToResponse(): NextResponse<Envelope<null>> {
  return fail(500, { code: "INTERNAL_ERROR", message: "Something went wrong" });
}
