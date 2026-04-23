import { NextRequest } from "next/server";

import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";
import { requireInternalToken } from "@/interfaces/http/internal-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const auth = requireInternalToken(req);
    if (!auth.ok) return auth.response;

    const checks: Record<string, string | boolean> = {
      VERCEL: process.env.VERCEL ?? "(not set)",
      BOT_COOKIE_KEY: !!process.env.BOT_COOKIE_KEY,
      BOT_COOKIES_ENC: !!process.env.BOT_COOKIES_ENC,
      FACEBOOK_GROUP_URLS: process.env.FACEBOOK_GROUP_URLS ?? "(not set)",
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    };

    let playwrightImport: string;
    try {
      await import("playwright-core");
      playwrightImport = "ok";
    } catch (e) {
      playwrightImport = e instanceof Error ? e.message : String(e);
    }

    let chromiumImport: string;
    try {
      await import("@sparticuz/chromium-min");
      chromiumImport = "ok";
    } catch (e) {
      chromiumImport = e instanceof Error ? e.message : String(e);
    }

    return ok({ checks, playwrightImport, chromiumImport });
  });
}
