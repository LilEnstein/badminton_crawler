import type { UserRepository } from "@/application/auth/ports";
import { Email } from "@/domain/user/email.value-object";
import { User } from "@/domain/user/user.entity";

import type { BadmintonStore, UserRecord } from "../db/json-store";

export class JsonUserRepository implements UserRepository {
  constructor(private readonly store: BadmintonStore) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    const rows = await this.store.users();
    const row = rows.find((u) => u.email === normalized);
    return row ? this.toEntity(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.store.users();
    const row = rows.find((u) => u.id === id);
    return row ? this.toEntity(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.store.mutate((s) => {
      const record: UserRecord = {
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash,
        googleSub: user.googleSub,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null
      };
      const idx = s.users.findIndex((u) => u.id === record.id);
      if (idx >= 0) s.users[idx] = record;
      else s.users.push(record);
    });
  }

  async touchLastLogin(id: string, at: Date): Promise<void> {
    await this.store.mutate((s) => {
      const row = s.users.find((u) => u.id === id);
      if (row) row.lastLoginAt = at.toISOString();
    });
  }

  private toEntity(row: UserRecord): User {
    return User.create({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      googleSub: row.googleSub,
      createdAt: new Date(row.createdAt),
      lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null
    });
  }
}
