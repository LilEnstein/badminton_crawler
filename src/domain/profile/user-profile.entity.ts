import { createLevel, type Level } from "@/domain/skill";

import {
  EmptyDistrictsError,
  EmptyTimeSlotsError,
  InvalidBudgetError,
  InvalidCityError,
  InvalidDisplayNameError,
  InvalidToleranceError
} from "./errors";
import type { GenderPreference } from "./gender-preference.value-object";
import type { ShuttleType } from "./shuttle-type.value-object";
import type { TimeSlot } from "./time-slot.value-object";

export type LevelTolerance = 1 | 2;

export interface UserProfileProps {
  userId: string;
  displayName: string;
  level: Level;
  levelTolerance: LevelTolerance;
  city: string;
  districts: string[];
  timeSlots: TimeSlot[];
  budgetVnd: number;
  shuttleType: ShuttleType;
  genderPreference: GenderPreference;
  sessionsCount?: number;
  favoriteCourts?: string;
  favoriteDays?: string[];
  updatedAt: Date;
}

export type UserProfilePatch = Partial<Omit<UserProfileProps, "userId" | "updatedAt">>;

const BUDGET_STEP_VND = 10_000;
const DISPLAY_NAME_MAX = 80;

export class UserProfile {
  private constructor(private props: UserProfileProps) {
    UserProfile.validate(props);
  }

  static create(props: UserProfileProps): UserProfile {
    return new UserProfile(UserProfile.normalize(props));
  }

  private static normalize(props: UserProfileProps): UserProfileProps {
    return {
      ...props,
      displayName: props.displayName.trim(),
      city: props.city.trim(),
      districts: [...props.districts],
      timeSlots: [...props.timeSlots],
      favoriteDays: props.favoriteDays ? [...props.favoriteDays] : [],
      favoriteCourts: props.favoriteCourts?.trim() || "",
      sessionsCount: props.sessionsCount ?? 0
    };
  }

  private static validate(p: UserProfileProps): void {
    if (!p.displayName || p.displayName.length === 0 || p.displayName.length > DISPLAY_NAME_MAX) {
      throw new InvalidDisplayNameError();
    }
    if (!p.city || p.city.length === 0) {
      throw new InvalidCityError();
    }
    if (p.districts.length === 0) {
      throw new EmptyDistrictsError();
    }
    if (p.timeSlots.length === 0) {
      throw new EmptyTimeSlotsError();
    }
    if (p.levelTolerance !== 1 && p.levelTolerance !== 2) {
      throw new InvalidToleranceError(p.levelTolerance);
    }
    if (
      !Number.isInteger(p.budgetVnd)
      || p.budgetVnd < 0
      || p.budgetVnd % BUDGET_STEP_VND !== 0
    ) {
      throw new InvalidBudgetError(p.budgetVnd);
    }
    createLevel(p.level);
  }

  update(patch: UserProfilePatch, now: Date): void {
    const next = UserProfile.normalize({
      ...this.props,
      ...patch,
      updatedAt: now
    });
    UserProfile.validate(next);
    this.props = next;
  }

  get userId(): string { return this.props.userId; }
  get displayName(): string { return this.props.displayName; }
  get level(): Level { return this.props.level; }
  get levelTolerance(): LevelTolerance { return this.props.levelTolerance; }
  get city(): string { return this.props.city; }
  get districts(): readonly string[] { return this.props.districts; }
  get timeSlots(): readonly TimeSlot[] { return this.props.timeSlots; }
  get budgetVnd(): number { return this.props.budgetVnd; }
  get shuttleType(): ShuttleType { return this.props.shuttleType; }
  get genderPreference(): GenderPreference { return this.props.genderPreference; }
  get sessionsCount(): number | undefined { return this.props.sessionsCount; }
  get favoriteCourts(): string | undefined { return this.props.favoriteCourts; }
  get favoriteDays(): readonly string[] | undefined { return this.props.favoriteDays; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toPublic(): UserProfilePublic {
    return {
      userId: this.props.userId,
      displayName: this.props.displayName,
      level: this.props.level,
      levelTolerance: this.props.levelTolerance,
      city: this.props.city,
      districts: [...this.props.districts],
      timeSlots: [...this.props.timeSlots],
      budgetVnd: this.props.budgetVnd,
      shuttleType: this.props.shuttleType,
      genderPreference: this.props.genderPreference,
      sessionsCount: this.props.sessionsCount,
      favoriteCourts: this.props.favoriteCourts,
      favoriteDays: this.props.favoriteDays ? [...this.props.favoriteDays] : [],
      updatedAt: this.props.updatedAt.toISOString()
    };
  }
}

export interface UserProfilePublic {
  userId: string;
  displayName: string;
  level: number;
  levelTolerance: LevelTolerance;
  city: string;
  districts: string[];
  timeSlots: TimeSlot[];
  budgetVnd: number;
  shuttleType: ShuttleType;
  genderPreference: GenderPreference;
  sessionsCount?: number;
  favoriteCourts?: string;
  favoriteDays?: string[];
  updatedAt: string;
}
