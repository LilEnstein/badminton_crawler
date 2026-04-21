import { DomainError } from "@/domain/user/errors";

export class InvalidDisplayNameError extends DomainError {
  constructor() {
    super("INVALID_DISPLAY_NAME", "Display name must be 1..80 non-blank characters");
  }
}

export class InvalidToleranceError extends DomainError {
  constructor(value: number) {
    super("INVALID_LEVEL_TOLERANCE", `Level tolerance must be 1 or 2 (received: ${value})`);
  }
}

export class InvalidBudgetError extends DomainError {
  constructor(value: number) {
    super(
      "INVALID_BUDGET",
      `Budget must be a non-negative integer in 10,000 VND steps (received: ${value})`
    );
  }
}

export class InvalidCityError extends DomainError {
  constructor() {
    super("INVALID_CITY", "City must be a non-blank string");
  }
}

export class EmptyDistrictsError extends DomainError {
  constructor() {
    super("EMPTY_DISTRICTS", "At least one district must be selected");
  }
}

export class EmptyTimeSlotsError extends DomainError {
  constructor() {
    super("EMPTY_TIME_SLOTS", "At least one time slot must be selected");
  }
}

export class UnknownDistrictError extends DomainError {
  constructor(city: string, district: string) {
    super(
      "UNKNOWN_DISTRICT",
      `District "${district}" is not registered for city "${city}"`
    );
  }
}

export class ProfileAlreadyExistsError extends DomainError {
  constructor() {
    super("PROFILE_ALREADY_EXISTS", "A profile already exists for this user");
  }
}

export class ProfileNotFoundError extends DomainError {
  constructor() {
    super("PROFILE_NOT_FOUND", "Profile not found");
  }
}
