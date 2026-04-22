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

export interface FacebookGroupRecord {
  id: string;
  fbGroupId: string;
  name: string;
  url: string;
  status: string;
  addedAt: string;
}

export interface FacebookBotRecord {
  id: string;
  label: string;
  cookieEncrypted: string;
  status: string;
  lastUsedAt: string | null;
}

export interface RawPostRecord {
  id: string;
  fbPostId: string;
  groupId: string;
  authorName: string;
  authorProfileUrl: string | null;
  text: string;
  postedAt: string;
  fetchedAt: string;
  parseStatus: string;
}

export interface ParseQueueRecord {
  id: string;
  rawPostId: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

export interface SessionRecord {
  id: string;
  rawPostId: string;
  location: { district: string | null; city: string | null; address: string | null };
  datetime: {
    date: string | null;
    timeStart: string | null;
    timeEnd: string | null;
    isRecurring: boolean;
  };
  skillLevel: { min: number | null; max: number | null };
  budget: { amount: number | null; currency: string; per: string | null; negotiable: boolean };
  gender: string | null;
  playersNeeded: number | null;
  totalPlayers: number | null;
  shuttleType: string | null;
  contact: string | null;
  status: string;
  type: string;
  confidence: number;
  needsReview: boolean;
  parsedAt: string;
}

export interface ParseFailureRecord {
  id: string;
  rawPostId: string;
  reason: string;
  providerRaw: string;
  failedAt: string;
}

export interface Store {
  users: UserRecord[];
  refreshTokens: RefreshTokenRecord[];
  profiles: UserProfileRecord[];
  groups: FacebookGroupRecord[];
  facebookBots: FacebookBotRecord[];
  rawPosts: RawPostRecord[];
  parseQueue: ParseQueueRecord[];
  sessions: SessionRecord[];
  parseFailures: ParseFailureRecord[];
}

export interface BadmintonStore {
  users(): Promise<UserRecord[]>;
  refreshTokens(): Promise<RefreshTokenRecord[]>;
  profiles(): Promise<UserProfileRecord[]>;
  groups(): Promise<FacebookGroupRecord[]>;
  facebookBots(): Promise<FacebookBotRecord[]>;
  rawPosts(): Promise<RawPostRecord[]>;
  parseQueue(): Promise<ParseQueueRecord[]>;
  sessions(): Promise<SessionRecord[]>;
  parseFailures(): Promise<ParseFailureRecord[]>;
  mutate(fn: (store: Store) => void): Promise<void>;
}

const EMPTY: Store = {
  users: [],
  refreshTokens: [],
  profiles: [],
  groups: [],
  facebookBots: [],
  rawPosts: [],
  parseQueue: [],
  sessions: [],
  parseFailures: []
};

function emptyStore(): Store {
  return structuredClone(EMPTY);
}

function normalize(parsed: Partial<Store>): Store {
  return {
    users: parsed.users ?? [],
    refreshTokens: parsed.refreshTokens ?? [],
    profiles: parsed.profiles ?? [],
    groups: parsed.groups ?? [],
    facebookBots: parsed.facebookBots ?? [],
    rawPosts: parsed.rawPosts ?? [],
    parseQueue: parsed.parseQueue ?? [],
    sessions: parsed.sessions ?? [],
    parseFailures: parsed.parseFailures ?? []
  };
}

function defaultStorePath(): string {
  // Vercel's project fs is read-only; only /tmp is writable. Data is ephemeral —
  // use Vercel KV for durable storage.
  if (process.env.VERCEL) return "/tmp/badminton.json";
  return "./data/badminton.json";
}

function resolvePath(): string {
  const raw = process.env.JSON_STORE_PATH ?? defaultStorePath();
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

  async groups(): Promise<FacebookGroupRecord[]> {
    return (await this.load()).groups;
  }

  async facebookBots(): Promise<FacebookBotRecord[]> {
    return (await this.load()).facebookBots;
  }

  async rawPosts(): Promise<RawPostRecord[]> {
    return (await this.load()).rawPosts;
  }

  async parseQueue(): Promise<ParseQueueRecord[]> {
    return (await this.load()).parseQueue;
  }

  async sessions(): Promise<SessionRecord[]> {
    return (await this.load()).sessions;
  }

  async parseFailures(): Promise<ParseFailureRecord[]> {
    return (await this.load()).parseFailures;
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
