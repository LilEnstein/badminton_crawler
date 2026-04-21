import type { Clock } from "@/application/auth/ports";
import {
  ProfileNotFoundError,
  UnknownDistrictError,
  UserProfile,
  type GenderPreference,
  type LevelTolerance,
  type ShuttleType,
  type TimeSlot,
  type UserProfilePatch
} from "@/domain/profile";
import { createLevel } from "@/domain/skill";

import type { DistrictCatalog, UserProfileRepository } from "./ports";

export interface UpdateProfilePatchInput {
  displayName?: string;
  level?: number;
  levelTolerance?: LevelTolerance;
  city?: string;
  districts?: string[];
  timeSlots?: TimeSlot[];
  budgetVnd?: number;
  shuttleType?: ShuttleType;
  genderPreference?: GenderPreference;
}

export interface UpdateProfileInput {
  userId: string;
  patch: UpdateProfilePatchInput;
}

export interface UpdateProfileDeps {
  repo: UserProfileRepository;
  districts: DistrictCatalog;
  clock: Clock;
}

export class UpdateProfileUseCase {
  constructor(private readonly deps: UpdateProfileDeps) {}

  async execute(input: UpdateProfileInput): Promise<UserProfile> {
    const profile = await this.deps.repo.findByUserId(input.userId);
    if (!profile) {
      throw new ProfileNotFoundError();
    }

    const targetCity = input.patch.city ?? profile.city;
    const targetDistricts = input.patch.districts ?? null;
    if (targetDistricts) {
      for (const d of targetDistricts) {
        if (!this.deps.districts.exists(targetCity, d)) {
          throw new UnknownDistrictError(targetCity, d);
        }
      }
    } else if (input.patch.city) {
      for (const d of profile.districts) {
        if (!this.deps.districts.exists(targetCity, d)) {
          throw new UnknownDistrictError(targetCity, d);
        }
      }
    }

    const { level: rawLevel, ...rest } = input.patch;
    const patch: UserProfilePatch = { ...rest };
    if (rawLevel !== undefined) {
      patch.level = createLevel(rawLevel);
    }

    profile.update(patch, this.deps.clock.now());
    await this.deps.repo.save(profile);
    return profile;
  }
}
