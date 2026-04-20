import type { Database } from "better-sqlite3";

import type { UserRepository } from "@/application/auth/ports";
import { Email } from "@/domain/user/email.value-object";
import { User } from "@/domain/user/user.entity";

interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  created_at: string;
  last_login_at: string | null;
}

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = this.db
      .prepare<[string], UserRow>("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase());
    return row ? this.toEntity(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db
      .prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?")
      .get(id);
    return row ? this.toEntity(row) : null;
  }

  async save(user: User): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO users (id, email, password_hash, google_sub, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           password_hash = excluded.password_hash,
           google_sub = excluded.google_sub,
           last_login_at = excluded.last_login_at`
      )
      .run(
        user.id,
        user.email.value,
        user.passwordHash,
        user.googleSub,
        user.createdAt.toISOString(),
        user.lastLoginAt ? user.lastLoginAt.toISOString() : null
      );
  }

  async touchLastLogin(id: string, at: Date): Promise<void> {
    this.db
      .prepare("UPDATE users SET last_login_at = ? WHERE id = ?")
      .run(at.toISOString(), id);
  }

  private toEntity(row: UserRow): User {
    return User.create({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.password_hash,
      googleSub: row.google_sub,
      createdAt: new Date(row.created_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null
    });
  }
}
