import { RefreshToken } from "@/domain/user/refresh-token.entity";
import { User } from "@/domain/user/user.entity";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  touchLastLogin(id: string, at: Date): Promise<void>;
}

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findById(id: string): Promise<RefreshToken | null>;
  revoke(id: string, at: Date, replacedBy: string | null): Promise<void>;
  revokeAllForUser(userId: string, at: Date): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface TokenSigner {
  signAccess(payload: AccessTokenPayload): string;
  signRefresh(payload: RefreshTokenPayload): string;
  verifyAccess(token: string): AccessTokenPayload;
  verifyRefresh(token: string): RefreshTokenPayload;
  readonly accessTtlSeconds: number;
  readonly refreshTtlSeconds: number;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  generate(): string;
}
