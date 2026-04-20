import type { Clock, RefreshTokenRepository, TokenSigner } from "./ports";

export interface LogoutInput {
  refreshToken: string;
}

export interface LogoutDeps {
  tokens: TokenSigner;
  refreshRepo: RefreshTokenRepository;
  clock: Clock;
}

export class LogoutUseCase {
  constructor(private readonly deps: LogoutDeps) {}

  async execute(input: LogoutInput): Promise<void> {
    let jti: string;
    try {
      jti = this.deps.tokens.verifyRefresh(input.refreshToken).jti;
    } catch {
      return;
    }
    const stored = await this.deps.refreshRepo.findById(jti);
    if (!stored || stored.isRevoked()) {
      return;
    }
    await this.deps.refreshRepo.revoke(jti, this.deps.clock.now(), null);
  }
}
