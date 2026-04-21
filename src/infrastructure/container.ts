import { LoginWithEmailUseCase } from "@/application/auth/login-with-email.use-case";
import { LogoutUseCase } from "@/application/auth/logout.use-case";
import { RegisterUserUseCase } from "@/application/auth/register-user.use-case";
import { RotateRefreshTokenUseCase } from "@/application/auth/rotate-refresh-token.use-case";

import { getJsonStore } from "./db/json-store";
import { JsonRefreshTokenRepository } from "./repositories/json.refresh-token.repository";
import { JsonUserRepository } from "./repositories/json.user.repository";
import { BcryptPasswordHasher } from "./security/bcrypt.password-hasher";
import { JwtTokenSigner } from "./security/jwt.token-signer";
import { SystemClock } from "./security/system-clock";
import { UlidIdGenerator } from "./security/ulid-id-generator";

export interface AuthContainer {
  register: RegisterUserUseCase;
  login: LoginWithEmailUseCase;
  rotate: RotateRefreshTokenUseCase;
  logout: LogoutUseCase;
  tokens: JwtTokenSigner;
}

let cached: AuthContainer | null = null;

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getAuthContainer(): AuthContainer {
  if (cached) return cached;

  const store = getJsonStore();
  const userRepo = new JsonUserRepository(store);
  const refreshRepo = new JsonRefreshTokenRepository(store);
  const hasher = new BcryptPasswordHasher();
  const clock = new SystemClock();
  const ids = new UlidIdGenerator();
  const tokens = new JwtTokenSigner({
    accessSecret: readEnv("JWT_ACCESS_SECRET", "dev-access-secret-change-me-change-me"),
    refreshSecret: readEnv("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me-change-me"),
    accessTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900),
    refreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 2_592_000)
  });

  const deps = { userRepo, refreshRepo, hasher, clock, ids, tokens };

  cached = {
    register: new RegisterUserUseCase(deps),
    login: new LoginWithEmailUseCase(deps),
    rotate: new RotateRefreshTokenUseCase(deps),
    logout: new LogoutUseCase({ tokens, refreshRepo, clock }),
    tokens
  };
  return cached;
}
