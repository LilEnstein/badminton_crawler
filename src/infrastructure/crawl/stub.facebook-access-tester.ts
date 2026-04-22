import type { FacebookAccessTester } from "@/application/crawl/ports";

// Placeholder until Feature 04 wires the Playwright bot session.
// Always returns true so the operator can add groups during development.
export class StubFacebookAccessTester implements FacebookAccessTester {
  async canAccess(_url: string): Promise<boolean> {
    return true;
  }
}
