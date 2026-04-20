import { NextRequest } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";
import { rateLimit } from "@/infrastructure/http/rate-limiter";
import { setRefreshCookie } from "@/interfaces/http/cookies";
import { ok, fail } from "@/interfaces/http/envelope";
import { clientIp, handle } from "@/interfaces/http/handle";
import { loginSchema } from "@/interfaces/http/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const body = loginSchema.parse(await req.json());
    const emailKey = body.email.trim().toLowerCase();

    const ipLimit = rateLimit(`login:ip:${clientIp(req)}`, 10, 60);
    const emailLimit = rateLimit(`login:email:${emailKey}`, 5, 300);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      const retry = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds);
      return fail(429, { code: "RATE_LIMITED", message: `Try again in ${retry}s` });
    }

    const { login } = getAuthContainer();
    const result = await login.execute(body);

    const res = ok({
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    });
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresIn);
    return res;
  });
}
