import type { ParseJobQueue } from "@/application/crawl/ports";
import type { BadmintonStore } from "../db/json-store";

export class JsonParseJobQueue implements ParseJobQueue {
  constructor(
    private store: BadmintonStore,
    private ids: { generate(): string },
    private clock: { now(): Date }
  ) {}

  async enqueue(rawPostId: string): Promise<void> {
    await this.store.mutate((s) => {
      s.parseQueue.push({
        id: this.ids.generate(),
        rawPostId,
        status: "pending",
        createdAt: this.clock.now().toISOString(),
        startedAt: null,
        completedAt: null,
        error: null
      });
    });
  }
}
