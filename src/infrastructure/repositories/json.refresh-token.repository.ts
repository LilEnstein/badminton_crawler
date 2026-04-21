import type { RefreshTokenRepository } from "@/application/auth/ports";
import { RefreshToken } from "@/domain/user/refresh-token.entity";

import type { JsonStore, RefreshTokenRecord } from "../db/json-store";

export class JsonRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly store: JsonStore) {}

  async save(token: RefreshToken): Promise<void> {
    const record: RefreshTokenRecord = {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt.toISOString(),
      revokedAt: token.revokedAt ? token.revokedAt.toISOString() : null,
      replacedBy: token.replacedBy,
      createdAt: new Date().toISOString()
    };
    this.store.mutate((s) => {
      const idx = s.refreshTokens.findIndex((t) => t.id === record.id);
      if (idx >= 0) s.refreshTokens[idx] = record;
      else s.refreshTokens.push(record);
    });
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const row = this.store.refreshTokens().find((t) => t.id === id);
    if (!row) return null;
    return RefreshToken.create({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: new Date(row.expiresAt),
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      replacedBy: row.replacedBy,
      createdAt: new Date(row.createdAt)
    });
  }

  async revoke(id: string, at: Date, replacedBy: string | null): Promise<void> {
    this.store.mutate((s) => {
      const row = s.refreshTokens.find((t) => t.id === id && !t.revokedAt);
      if (row) {
        row.revokedAt = at.toISOString();
        row.replacedBy = replacedBy;
      }
    });
  }

  async revokeAllForUser(userId: string, at: Date): Promise<void> {
    this.store.mutate((s) => {
      for (const row of s.refreshTokens) {
        if (row.userId === userId && !row.revokedAt) {
          row.revokedAt = at.toISOString();
        }
      }
    });
  }
}
