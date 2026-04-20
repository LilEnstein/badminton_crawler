import { NextResponse } from "next/server";

export const REFRESH_COOKIE = "bf_refresh";

export function setRefreshCookie(
  res: NextResponse,
  token: string,
  maxAgeSeconds: number
): void {
  res.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: maxAgeSeconds
  });
}

export function clearRefreshCookie(res: NextResponse): void {
  res.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 0
  });
}
