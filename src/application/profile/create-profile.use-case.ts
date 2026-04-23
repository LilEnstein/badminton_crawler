import type { Clock } from "@/application/auth/ports";
import {
  ProfileAlreadyExistsError,
  UnknownDistrictError,
  UserProfile,
  type GenderPreference,
  type LevelTolerance,
  type ShuttleType,
  type TimeSlot
} from "@/domain/profile";
import { createLevel } from "@/domain/skill";

import type { DistrictCatalog, UserProfileRepository } from "./ports";

export interface CreateProfileInput {
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
}

export interface CreateProfileDeps {
  repo: UserProfileRepository;
  districts: DistrictCatalog;
  clock: Clock;
}

export class CreateProfileUseCase {
  constructor(private readonly deps: CreateProfileDeps) {}

  async execute(input: CreateProfileInput): Promise<UserProfile> {
    const existing = await this.deps.repo.findByUserId(input.userId);
    if (existing) {
      throw new ProfileAlreadyExistsError();
    }

    for (const d of input.districts) {
      if (!this.deps.districts.exists(input.city, d)) {
        throw new UnknownDistrictError(input.city, d);
      }
    }

    const profile = UserProfile.create({
      userId: input.userId,
      displayName: input.displayName,
      level: createLevel(input.level),
      levelTolerance: input.levelTolerance,
      city: input.city,
      districts: input.districts,
      timeSlots: input.timeSlots,
      budgetVnd: input.budgetVnd,
      shuttleType: input.shuttleType,
      genderPreference: input.genderPreference,
      sessionsCount: input.sessionsCount,
      favoriteCourts: input.favoriteCourts,
      favoriteDays: input.favoriteDays,
      updatedAt: this.deps.clock.now()
    });

    await this.deps.repo.save(profile);
    return profile;
  }
}
