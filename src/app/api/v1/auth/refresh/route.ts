import { NextRequest } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";
import { REFRESH_COOKIE, setRefreshCookie } from "@/interfaces/http/cookies";
import { ok, fail } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const token = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!token) {
      return fail(401, { code: "NO_REFRESH_TOKEN", message: "Refresh token missing" });
    }
    const { rotate } = getAuthContainer();
    const result = await rotate.execute({ refreshToken: token });

    const res = ok({
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    });
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresIn);
    return res;
  });
}
