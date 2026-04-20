import { RefreshToken } from "@/domain/user/refresh-token.entity";
import { User } from "@/domain/user/user.entity";

import type {
  Clock,
  IdGenerator,
  PasswordHasher,
  RefreshTokenRepository,
  TokenSigner
} from "./ports";
import type { AuthResult } from "./auth-result";

export interface IssueTokensDeps {
  tokens: TokenSigner;
  refreshRepo: RefreshTokenRepository;
  hasher: PasswordHasher;
  clock: Clock;
  ids: IdGenerator;
}

export async function issueTokensForUser(deps: IssueTokensDeps, user: User): Promise<AuthResult> {
  const { tokens, refreshRepo, hasher, clock, ids } = deps;
  const now = clock.now();
  const jti = ids.generate();
  const refreshToken = tokens.signRefresh({ sub: user.id, jti });
  const tokenHash = await hasher.hash(refreshToken);

  const entity = RefreshToken.create({
    id: jti,
    userId: user.id,
    tokenHash,
    expiresAt: new Date(now.getTime() + tokens.refreshTtlSeconds * 1000),
    revokedAt: null,
    replacedBy: null,
    createdAt: now
  });
  await refreshRepo.save(entity);

  const accessToken = tokens.signAccess({ sub: user.id, email: user.email.value });

  return {
    user: user.toPublic(),
    accessToken,
    refreshToken,
    accessTokenExpiresIn: tokens.accessTtlSeconds,
    refreshTokenExpiresIn: tokens.refreshTtlSeconds
  };
}
