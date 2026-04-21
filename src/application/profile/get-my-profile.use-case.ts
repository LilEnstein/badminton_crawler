import { ProfileNotFoundError, UserProfile } from "@/domain/profile";

import type { UserProfileRepository } from "./ports";

export interface GetMyProfileDeps {
  repo: UserProfileRepository;
}

export class GetMyProfileUseCase {
  constructor(private readonly deps: GetMyProfileDeps) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.deps.repo.findByUserId(userId);
    if (!profile) {
      throw new ProfileNotFoundError();
    }
    return profile;
  }
}
