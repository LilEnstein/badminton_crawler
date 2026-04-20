import type { Clock } from "@/application/auth/ports";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
