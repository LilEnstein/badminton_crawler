import { RawPostNotFoundError } from "@/domain/crawl";
import { ParseFailure } from "@/domain/session/parse-failure.entity";
import { Session } from "@/domain/session/session.entity";

import type {
  ParseFailureRepository,
  PostParser,
  RawPostReadRepository,
  SessionRepository
} from "./ports";

const NEEDS_REVIEW_THRESHOLD = 0.6;

interface Deps {
  rawPostRepo: RawPostReadRepository;
  parser: PostParser;
  sessionRepo: SessionRepository;
  parseFailureRepo: ParseFailureRepository;
  ids: { generate(): string };
  clock: { now(): Date };
}

interface ParsePostResult {
  sessionId: string | null;
  needsReview: boolean;
  confidence: number;
}

export class ParsePostUseCase {
  constructor(private deps: Deps) {}

  async execute(rawPostId: string): Promise<ParsePostResult> {
    const rawPost = await this.deps.rawPostRepo.findById(rawPostId);
    if (!rawPost) throw new RawPostNotFoundError(rawPostId);

    let output;
    try {
      output = await this.deps.parser.parse(rawPost.text);
    } catch (err) {
      const failure = ParseFailure.create({
        id: this.deps.ids.generate(),
        rawPostId,
        reason: err instanceof Error ? err.message : String(err),
        providerRaw: "",
        failedAt: this.deps.clock.now()
      });
      await this.deps.parseFailureRepo.save(failure);
      rawPost.markFailed();
      await this.deps.rawPostRepo.save(rawPost);
      return { sessionId: null, needsReview: false, confidence: 0 };
    }

    const needsReview = output.confidence < NEEDS_REVIEW_THRESHOLD;

    const session = Session.create({
      id: this.deps.ids.generate(),
      rawPostId,
      location: output.location,
      datetime: output.datetime,
      skillLevel: output.skillLevel,
      budget: output.budget,
      gender: output.gender,
      playersNeeded: output.playersNeeded,
      totalPlayers: output.totalPlayers,
      shuttleType: output.shuttleType,
      contact: output.contact,
      status: output.status,
      type: output.type,
      confidence: output.confidence,
      needsReview,
      parsedAt: this.deps.clock.now()
    });

    await this.deps.sessionRepo.save(session);
    rawPost.markParsed();
    await this.deps.rawPostRepo.save(rawPost);

    return { sessionId: session.id, needsReview, confidence: output.confidence };
  }
}
