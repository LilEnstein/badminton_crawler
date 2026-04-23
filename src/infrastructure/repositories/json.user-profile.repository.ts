import type { UserProfileRepository } from "@/application/profile/ports";
import {
  UserProfile,
  isGenderPreference,
  isShuttleType,
  isTimeSlot,
  type GenderPreference,
  type LevelTolerance,
  type ShuttleType,
  type TimeSlot
} from "@/domain/profile";
import { createLevel } from "@/domain/skill";

import type { BadmintonStore, UserProfileRecord } from "../db/json-store";

export class JsonUserProfileRepository implements UserProfileRepository {
  constructor(private readonly store: BadmintonStore) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const rows = await this.store.profiles();
    const row = rows.find((p) => p.userId === userId);
    return row ? this.toEntity(row) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const record = this.toRecord(profile);
    await this.store.mutate((s) => {
      const idx = s.profiles.findIndex((p) => p.userId === record.userId);
      if (idx >= 0) s.profiles[idx] = record;
      else s.profiles.push(record);
    });
  }

  private toRecord(profile: UserProfile): UserProfileRecord {
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      level: profile.level as number,
      levelTolerance: profile.levelTolerance,
      city: profile.city,
      districts: [...profile.districts],
      timeSlots: [...profile.timeSlots],
      budgetVnd: profile.budgetVnd,
      shuttleType: profile.shuttleType,
      genderPreference: profile.genderPreference,
      sessionsCount: profile.sessionsCount,
      favoriteCourts: profile.favoriteCourts,
      favoriteDays: profile.favoriteDays ? [...profile.favoriteDays] : [],
      updatedAt: profile.updatedAt.toISOString()
    };
  }

  private toEntity(row: UserProfileRecord): UserProfile {
    const timeSlots: TimeSlot[] = row.timeSlots.filter(isTimeSlot);
    const tolerance: LevelTolerance = row.levelTolerance === 2 ? 2 : 1;
    const shuttle: ShuttleType = isShuttleType(row.shuttleType) ? row.shuttleType : "any";
    const gender: GenderPreference = isGenderPreference(row.genderPreference)
      ? row.genderPreference
      : "any";

    return UserProfile.create({
      userId: row.userId,
      displayName: row.displayName,
      level: createLevel(row.level),
      levelTolerance: tolerance,
      city: row.city,
      districts: row.districts,
      timeSlots,
      budgetVnd: row.budgetVnd,
      shuttleType: shuttle,
      genderPreference: gender,
      sessionsCount: row.sessionsCount,
      favoriteCourts: row.favoriteCourts,
      favoriteDays: row.favoriteDays,
      updatedAt: new Date(row.updatedAt)
    });
  }
}
