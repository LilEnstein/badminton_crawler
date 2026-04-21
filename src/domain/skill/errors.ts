import { DomainError } from "@/domain/user/errors";

export class InvalidLevelError extends DomainError {
  constructor(value: number) {
    super("INVALID_LEVEL", `Level must be an integer between 1 and 10 (received: ${value})`);
  }
}

export class InvalidRangeError extends DomainError {
  constructor(min: number, max: number) {
    super(
      "INVALID_LEVEL_RANGE",
      `Level range min must be <= max (received ${min}..${max})`
    );
  }
}
