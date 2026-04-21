import fs from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string | null;
  googleSub: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  replacedBy: string | null;
  createdAt: string;
}

export interface UserProfileRecord {
  userId: string;
  displayName: string;
  level: number;
  levelTolerance: 1 | 2;
  city: string;
  districts: string[];
  timeSlots: string[];
  budgetVnd: number;
  shuttleType: string;
  genderPreference: string;
  updatedAt: string;
}

export interface Store {
  users: UserRecord[];
  refreshTokens: RefreshTokenRecord[];
  profiles: UserProfileRecord[];
}

export interface BadmintonStore {
  users(): Promise<UserRecord[]>;
  refreshTokens(): Promise<RefreshTokenRecord[]>;
  profiles(): Promise<UserProfileRecord[]>;
  mutate(fn: (store: Store) => void): Promise<void>;
}

const EMPTY: Store = { users: [], refreshTokens: [], profiles: [] };

function emptyStore(): Store {
  return structuredClone(EMPTY);
}

function normalize(parsed: Partial<Store>): Store {
  return {
    users: parsed.users ?? [],
    refreshTokens: parsed.refreshTokens ?? [],
    profiles: parsed.profiles ?? []
  };
}

function resolvePath(): string {
  const raw = process.env.JSON_STORE_PATH ?? "./data/badminton.json";
  const abs = path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
  mkdirSync(path.dirname(abs), { recursive: true });
  return abs;
}

class JsonStore implements BadmintonStore {
  private readonly filePath: string;
  private cache: Store | null = null;

  constructor() {
    this.filePath = resolvePath();
  }

  private async load(): Promise<Store> {
    if (this.cache) return this.cache;
    if (!existsSync(this.filePath)) {
      this.cache = emptyStore();
      return this.cache;
    }
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      this.cache = normalize(JSON.parse(raw) as Partial<Store>);
    } catch {
      this.cache = emptyStore();
    }
    return this.cache;
  }

  private async persist(): Promise<void> {
    if (!this.cache) return;
    await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2), "utf8");
  }

  async users(): Promise<UserRecord[]> {
    return (await this.load()).users;
  }

  async refreshTokens(): Promise<RefreshTokenRecord[]> {
    return (await this.load()).refreshTokens;
  }

  async profiles(): Promise<UserProfileRecord[]> {
    return (await this.load()).profiles;
  }

  async mutate(fn: (store: Store) => void): Promise<void> {
    const store = await this.load();
    fn(store);
    await this.persist();
  }
}

export type { JsonStore };
export { JsonStore as JsonStoreClass };

export function createJsonStore(): BadmintonStore {
  return new JsonStore();
}
