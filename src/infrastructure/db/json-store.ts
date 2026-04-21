import fs from "node:fs";
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

interface Store {
  users: UserRecord[];
  refreshTokens: RefreshTokenRecord[];
}

const EMPTY: Store = { users: [], refreshTokens: [] };

function resolvePath(): string {
  const raw = process.env.JSON_STORE_PATH ?? "./data/badminton.json";
  const abs = path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  return abs;
}

class JsonStore {
  private readonly filePath: string;
  private data: Store;

  constructor() {
    this.filePath = resolvePath();
    this.data = this.load();
  }

  private load(): Store {
    if (!fs.existsSync(this.filePath)) {
      return structuredClone(EMPTY);
    }
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<Store>;
      return {
        users: parsed.users ?? [],
        refreshTokens: parsed.refreshTokens ?? []
      };
    } catch {
      return structuredClone(EMPTY);
    }
  }

  private persist(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
  }

  users(): UserRecord[] {
    return this.data.users;
  }

  refreshTokens(): RefreshTokenRecord[] {
    return this.data.refreshTokens;
  }

  mutate(fn: (store: Store) => void): void {
    fn(this.data);
    this.persist();
  }
}

let instance: JsonStore | null = null;

export function getJsonStore(): JsonStore {
  if (!instance) instance = new JsonStore();
  return instance;
}

export type { JsonStore };
