import { LoginWithEmailUseCase } from "@/application/auth/login-with-email.use-case";
import { LogoutUseCase } from "@/application/auth/logout.use-case";
import { RegisterUserUseCase } from "@/application/auth/register-user.use-case";
import { RotateRefreshTokenUseCase } from "@/application/auth/rotate-refresh-token.use-case";
import { AddBotUseCase } from "@/application/crawl/add-bot.use-case";
import { AddGroupUseCase } from "@/application/crawl/add-group.use-case";
import { CrawlGroupUseCase } from "@/application/crawl/crawl-group.use-case";
import { ListGroupsUseCase } from "@/application/crawl/list-groups.use-case";
import { RemoveGroupUseCase } from "@/application/crawl/remove-group.use-case";
import { RotateBotUseCase } from "@/application/crawl/rotate-bot.use-case";
import { UpdateGroupStatusUseCase } from "@/application/crawl/update-group-status.use-case";
import { InlineMatchScoreCalculator } from "@/application/match/inline-match-score.calculator";
import { ParsePostUseCase } from "@/application/parse/parse-post.use-case";
import { CreateProfileUseCase } from "@/application/profile/create-profile.use-case";
import { GetMyProfileUseCase } from "@/application/profile/get-my-profile.use-case";
import { UpdateProfileUseCase } from "@/application/profile/update-profile.use-case";
import { GetSessionDetailUseCase } from "@/application/session/get-session-detail.use-case";
import { SearchSessionsUseCase } from "@/application/session/search-sessions.use-case";

import { SeedDistrictCatalog } from "./catalogs/seed.district-catalog";
import { AesGcmFacebookSessionProvider, encryptCookie } from "./crawl/aes-gcm.facebook-session-provider";
import { ConsoleCrawlAlerter } from "./crawl/console.crawl-alerter";
import { JsonParseJobQueue } from "./crawl/json.parse-job-queue";
import { PlaywrightGroupPageScraper } from "./crawl/playwright.group-page-scraper";
import { StubFacebookAccessTester } from "./crawl/stub.facebook-access-tester";
import { createJsonStore, type BadmintonStore } from "./db/json-store";
import { createKvStore, isKvConfigured } from "./db/kv-store";
import { GeminiPostParser } from "./parse/gemini.post-parser";
import { JsonFacebookBotRepository } from "./repositories/json.facebook-bot.repository";
import { JsonFacebookGroupRepository } from "./repositories/json.facebook-group.repository";
import { JsonParseFailureRepository } from "./repositories/json.parse-failure.repository";
import { JsonRawPostRepository } from "./repositories/json.raw-post.repository";
import { JsonRefreshTokenRepository } from "./repositories/json.refresh-token.repository";
import { JsonSessionRepository } from "./repositories/json.session.repository";
import { JsonUserProfileRepository } from "./repositories/json.user-profile.repository";
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

export interface ProfileContainer {
  create: CreateProfileUseCase;
  update: UpdateProfileUseCase;
  get: GetMyProfileUseCase;
  districts: SeedDistrictCatalog;
}

export interface GroupContainer {
  add: AddGroupUseCase;
  list: ListGroupsUseCase;
  updateStatus: UpdateGroupStatusUseCase;
  remove: RemoveGroupUseCase;
  ids: UlidIdGenerator;
  clock: SystemClock;
}

export interface BotContainer {
  addBot: AddBotUseCase;
  listBots: () => Promise<{ id: string; label: string; status: string; lastUsedAt: string | null }[]>;
}

export interface CrawlContainer {
  crawlGroup: CrawlGroupUseCase;
  rotateBot: RotateBotUseCase;
  listGroups: ListGroupsUseCase;
}

export interface ParseContainer {
  parsePost: ParsePostUseCase;
}

export interface SessionContainer {
  search: SearchSessionsUseCase;
  detail: GetSessionDetailUseCase;
}

let cached: AuthContainer | null = null;
let cachedProfile: ProfileContainer | null = null;
let cachedGroup: GroupContainer | null = null;
let cachedBot: BotContainer | null = null;
let cachedCrawl: CrawlContainer | null = null;
let cachedParse: ParseContainer | null = null;
let cachedSession: SessionContainer | null = null;
let cachedStore: BadmintonStore | null = null;

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getStore(): BadmintonStore {
  if (cachedStore) return cachedStore;
  cachedStore = isKvConfigured() ? createKvStore() : createJsonStore();
  return cachedStore;
}

export function getAuthContainer(): AuthContainer {
  if (cached) return cached;

  const store = getStore();
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

export function getProfileContainer(): ProfileContainer {
  if (cachedProfile) return cachedProfile;

  const store = getStore();
  const repo = new JsonUserProfileRepository(store);
  const districts = new SeedDistrictCatalog();
  const clock = new SystemClock();

  cachedProfile = {
    create: new CreateProfileUseCase({ repo, districts, clock }),
    update: new UpdateProfileUseCase({ repo, districts, clock }),
    get: new GetMyProfileUseCase({ repo }),
    districts
  };
  return cachedProfile;
}

export function getGroupContainer(): GroupContainer {
  if (cachedGroup) return cachedGroup;

  const store = getStore();
  const repo = new JsonFacebookGroupRepository(store);
  const accessTester = new StubFacebookAccessTester();
  const clock = new SystemClock();
  const ids = new UlidIdGenerator();

  cachedGroup = {
    add: new AddGroupUseCase({ repo, accessTester, clock }),
    list: new ListGroupsUseCase({ repo }),
    updateStatus: new UpdateGroupStatusUseCase({ repo }),
    remove: new RemoveGroupUseCase({ repo }),
    ids,
    clock
  };
  return cachedGroup;
}

export function getBotContainer(): BotContainer {
  if (cachedBot) return cachedBot;

  const store = getStore();
  const botRepo = new JsonFacebookBotRepository(store);
  const ids = new UlidIdGenerator();
  const keyHex = readEnv("BOT_COOKIE_KEY");

  const container: BotContainer = {
    addBot: new AddBotUseCase({
      botRepo,
      ids,
      encrypt: (plaintext) => encryptCookie(plaintext, keyHex)
    }),
    listBots: async () => {
      const bots = await store.facebookBots();
      return bots.map((b) => ({
        id: b.id,
        label: b.label,
        status: b.status,
        lastUsedAt: b.lastUsedAt ?? null
      }));
    }
  };
  cachedBot = container;
  return container;
}

export function getCrawlContainer(): CrawlContainer {
  if (cachedCrawl) return cachedCrawl;

  const store = getStore();
  const groupRepo = new JsonFacebookGroupRepository(store);
  const botRepo = new JsonFacebookBotRepository(store);
  const rawPostRepo = new JsonRawPostRepository(store);
  const clock = new SystemClock();
  const ids = new UlidIdGenerator();
  const alerter = new ConsoleCrawlAlerter();
  const sessionProvider = new AesGcmFacebookSessionProvider(botRepo);
  const scraper = new PlaywrightGroupPageScraper();
  const parseQueue = new JsonParseJobQueue(store, ids, clock);

  cachedCrawl = {
    crawlGroup: new CrawlGroupUseCase({
      sessionProvider,
      scraper,
      rawPostRepo,
      botRepo,
      parseQueue,
      alerter,
      ids,
      clock
    }),
    rotateBot: new RotateBotUseCase({ botRepo, alerter }),
    listGroups: new ListGroupsUseCase({ repo: groupRepo })
  };
  return cachedCrawl;
}

export function getParseContainer(): ParseContainer {
  if (cachedParse) return cachedParse;

  const store = getStore();
  const rawPostRepo = new JsonRawPostRepository(store);
  const sessionRepo = new JsonSessionRepository(store);
  const parseFailureRepo = new JsonParseFailureRepository(store);
  const clock = new SystemClock();
  const ids = new UlidIdGenerator();

  const geminiKey = readEnv("GEMINI_API_KEY");
  const parser = new GeminiPostParser(geminiKey);

  cachedParse = {
    parsePost: new ParsePostUseCase({ rawPostRepo, parser, sessionRepo, parseFailureRepo, ids, clock })
  };
  return cachedParse;
}

export function getSessionContainer(): SessionContainer {
  if (cachedSession) return cachedSession;

  const store = getStore();
  const sessionRepo = new JsonSessionRepository(store);
  const profileRepo = new JsonUserProfileRepository(store);
  const rawPostRepo = new JsonRawPostRepository(store);
  const scoreCalc = new InlineMatchScoreCalculator();

  cachedSession = {
    search: new SearchSessionsUseCase({ sessionRepo, profileRepo, scoreCalc }),
    detail: new GetSessionDetailUseCase({ sessionRepo, profileRepo, rawPostFinder: rawPostRepo, scoreCalc })
  };
  return cachedSession;
}
