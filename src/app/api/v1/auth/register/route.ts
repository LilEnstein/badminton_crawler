import { NextRequest } from "next/server";

import { getAuthContainer } from "@/infrastructure/container";
import { rateLimit } from "@/infrastructure/http/rate-limiter";
import { setRefreshCookie } from "@/interfaces/http/cookies";
import { ok, fail } from "@/interfaces/http/envelope";
import { clientIp, handle } from "@/interfaces/http/handle";
import { registerSchema } from "@/interfaces/http/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handle(req, async () => {
    const limit = rateLimit(`register:${clientIp(req)}`, 5, 60);
    if (!limit.allowed) {
      return fail(429, {
        code: "RATE_LIMITED",
        message: `Try again in ${limit.retryAfterSeconds}s`
      });
    }

    const body = registerSchema.parse(await req.json());
    const { register } = getAuthContainer();
    const result = await register.execute(body);

    const res = ok({
      user: result.user,
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn
    }, { status: 201 });
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresIn);
    return res;
  });
}
