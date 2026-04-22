import { ParseFailure } from "@/domain/session/parse-failure.entity";
import type { ParseFailureRepository } from "@/application/parse/ports";
import type { BadmintonStore, ParseFailureRecord } from "../db/json-store";

function toRecord(f: ParseFailure): ParseFailureRecord {
  return {
    id: f.id,
    rawPostId: f.rawPostId,
    reason: f.reason,
    providerRaw: f.providerRaw,
    failedAt: f.failedAt.toISOString()
  };
}

export class JsonParseFailureRepository implements ParseFailureRepository {
  constructor(private store: BadmintonStore) {}

  async save(failure: ParseFailure): Promise<void> {
    await this.store.mutate((s) => {
      s.parseFailures.push(toRecord(failure));
    });
  }
}
