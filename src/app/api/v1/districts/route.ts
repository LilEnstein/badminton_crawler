import type { NextRequest } from "next/server";

import { getProfileContainer } from "@/infrastructure/container";
import { ok } from "@/interfaces/http/envelope";
import { handle } from "@/interfaces/http/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(req, async () => {
    const { districts } = getProfileContainer();
    const cities = districts.cities();
    const byCity: Record<string, readonly string[]> = {};
    for (const city of cities) {
      byCity[city] = districts.list(city);
    }
    return ok({ cities, byCity });
  });
}
