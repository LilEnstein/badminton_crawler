import { Redis } from "@upstash/redis";

import type {
  BadmintonStore,
  FacebookBotRecord,
  FacebookGroupRecord,
  ParseFailureRecord,
  ParseQueueRecord,
  RawPostRecord,
  RefreshTokenRecord,
  SessionRecord,
  Store,
  UserProfileRecord,
  UserRecord
} from "./json-store";

const STORE_KEY = "badminton:store:v1";

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

function normalize(parsed: Partial<Store> | null): Store {
  if (!parsed) return emptyStore();
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

class KvStore implements BadmintonStore {
  private readonly client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  private async load(): Promise<Store> {
    const raw = await this.client.get<Store | string | null>(STORE_KEY);
    if (raw === null || raw === undefined) return emptyStore();
    if (typeof raw === "string") {
      try {
        return normalize(JSON.parse(raw) as Partial<Store>);
      } catch {
        return emptyStore();
      }
    }
    return normalize(raw);
  }

  private async persist(store: Store): Promise<void> {
    await this.client.set(STORE_KEY, JSON.stringify(store));
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
    await this.persist(store);
  }
}

export function createKvStore(): BadmintonStore {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN are required for KvStore");
  }
  return new KvStore(new Redis({ url, token }));
}

export function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}
