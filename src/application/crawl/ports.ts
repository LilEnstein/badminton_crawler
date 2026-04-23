import type { FacebookBot, FacebookGroup, GroupStatus, RawPost } from "@/domain/crawl";

export interface FacebookGroupRepository {
  findById(id: string): Promise<FacebookGroup | null>;
  findByFbGroupId(fbGroupId: string): Promise<FacebookGroup | null>;
  findAll(): Promise<FacebookGroup[]>;
  findActive(): Promise<FacebookGroup[]>;
  save(group: FacebookGroup): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface FacebookAccessTester {
  canAccess(url: string): Promise<boolean>;
}

export type UpdateableStatus = Exclude<GroupStatus, never>;

export interface RawPostCandidate {
  fbPostId: string;
  authorName: string;
  authorProfileUrl: string | null;
  text: string;
  postedAt: Date;
}

export interface ScrapeDiagnostics {
  finalUrl: string;
  pageTitle: string;
  htmlLength: number;
  postIdsFound: number;
  hasLoginForm: boolean;
  loginSelectorsMatched?: Array<{ selector: string; count: number; visible: number }>;
  isLoginWallUrl: boolean;
  navError: string | null;
  bodyPreview: string;
}

export interface ScrapeResult {
  candidates: RawPostCandidate[];
  diagnostics: ScrapeDiagnostics;
}

export interface FacebookBotRepository {
  findActive(): Promise<FacebookBot | null>;
  findById(id: string): Promise<FacebookBot | null>;
  save(bot: FacebookBot): Promise<void>;
}

export interface FacebookSessionProvider {
  getActiveSession(): Promise<{ botId: string; cookie: string } | null>;
}

export interface GroupPageScraper {
  scrape(groupId: string, cookie: string): Promise<ScrapeResult>;
}

export interface RawPostRepository {
  findByFbPostId(fbPostId: string): Promise<RawPost | null>;
  findById(id: string): Promise<RawPost | null>;
  findPending(): Promise<RawPost[]>;
  save(post: RawPost): Promise<void>;
}

export interface ParseJobQueue {
  enqueue(rawPostId: string): Promise<void>;
}

export interface CrawlAlerter {
  alert(message: string): Promise<void>;
}
