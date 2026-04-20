import type { Database } from "better-sqlite3";

import type { RefreshTokenRepository } from "@/application/auth/ports";
import { RefreshToken } from "@/domain/user/refresh-token.entity";

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  replaced_by: string | null;
  created_at: string;
}

export class SqliteRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: Database) {}

  async save(token: RefreshToken): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO refresh_tokens
           (id, user_id, token_hash, expires_at, revoked_at, replaced_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        token.id,
        token.userId,
        token.tokenHash,
        token.expiresAt.toISOString(),
        token.revokedAt ? token.revokedAt.toISOString() : null,
        token.replacedBy,
        new Date().toISOString()
      );
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const row = this.db
      .prepare<[string], RefreshTokenRow>("SELECT * FROM refresh_tokens WHERE id = ?")
      .get(id);
    if (!row) return null;
    return RefreshToken.create({
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
      replacedBy: row.replaced_by,
      createdAt: new Date(row.created_at)
    });
  }

  async revoke(id: string, at: Date, replacedBy: string | null): Promise<void> {
    this.db
      .prepare(
        "UPDATE refresh_tokens SET revoked_at = ?, replaced_by = ? WHERE id = ? AND revoked_at IS NULL"
      )
      .run(at.toISOString(), replacedBy, id);
  }

  async revokeAllForUser(userId: string, at: Date): Promise<void> {
    this.db
      .prepare(
        "UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL"
      )
      .run(at.toISOString(), userId);
  }
}
