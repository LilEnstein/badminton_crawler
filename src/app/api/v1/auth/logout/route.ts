import { NextRequest } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";
import { REFRESH_COOKIE, clearRefreshCookie } from "@/interfaces/http/cookies";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const token = req.cookies.get(REFRESH_COOKIE)?.value;
    if (token) {
      const { logout } = getAuthContainer();
      await logout.execute({ refreshToken: token });
    }
    const res = ok({ success: true });
    clearRefreshCookie(res);
    return res;
  });
}
