import { TokenInvalidError, TokenReuseError, UserNotFoundError } from "@/domain/user/errors";

import type { AuthResult } from "./auth-result";
import { issueTokensForUser, type IssueTokensDeps } from "./issue-tokens";
import type { UserRepository } from "./ports";

export interface RotateRefreshInput {
  refreshToken: string;
}

export interface RotateRefreshDeps extends IssueTokensDeps {
  userRepo: UserRepository;
}

export class RotateRefreshTokenUseCase {
  constructor(private readonly deps: RotateRefreshDeps) {}

  async execute(input: RotateRefreshInput): Promise<AuthResult> {
    const payload = this.verify(input.refreshToken);
    const stored = await this.deps.refreshRepo.findById(payload.jti);
    if (!stored) {
      throw new TokenInvalidError();
    }

    const now = this.deps.clock.now();

    if (stored.isRevoked()) {
      await this.deps.refreshRepo.revokeAllForUser(stored.userId, now);
      throw new TokenReuseError();
    }

    if (!stored.isActive(now)) {
      throw new TokenInvalidError();
    }

    const matches = await this.deps.hasher.verify(input.refreshToken, stored.tokenHash);
    if (!matches) {
      throw new TokenInvalidError();
    }

    const user = await this.deps.userRepo.findById(stored.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const result = await issueTokensForUser(this.deps, user);
    await this.deps.refreshRepo.revoke(stored.id, now, null);
    return result;
  }

  private verify(token: string) {
    try {
      return this.deps.tokens.verifyRefresh(token);
    } catch {
      throw new TokenInvalidError();
    }
  }
}
