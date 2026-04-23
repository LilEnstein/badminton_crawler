import { NextResponse } from "next/server";

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface Envelope<T> {
  data: T | null;
  meta: Record<string, unknown> | null;
  error: ApiError | null;
}

export function ok<T>(
  data: T,
  meta?: Record<string, unknown> | null,
  init?: ResponseInit
): NextResponse<Envelope<T>> {
  return NextResponse.json<Envelope<T>>({ data, meta: meta ?? null, error: null }, init);
}

export function fail(
  status: number,
  error: ApiError,
  init?: ResponseInit
): NextResponse<Envelope<null>> {
  return NextResponse.json<Envelope<null>>(
    { data: null, meta: null, error },
    { ...init, status }
  );
}
