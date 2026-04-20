import { ulid } from "ulid";

import type { IdGenerator } from "@/application/auth/ports";

export class UlidIdGenerator implements IdGenerator {
  generate(): string {
    return ulid();
  }
}
