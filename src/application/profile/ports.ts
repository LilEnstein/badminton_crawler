import type { UserProfile } from "@/domain/profile";

export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface DistrictCatalog {
  exists(city: string, district: string): boolean;
  list(city: string): readonly string[];
  cities(): readonly string[];
}
