import { RawPost } from "@/domain/crawl/raw-post.entity";
import type { ParseStatus } from "@/domain/crawl/raw-post.entity";
import type { RawPostRepository } from "@/application/crawl/ports";
import type { BadmintonStore, RawPostRecord } from "../db/json-store";

function toEntity(r: RawPostRecord): RawPost {
  return RawPost.create({
    id: r.id,
    fbPostId: r.fbPostId,
    groupId: r.groupId,
    authorName: r.authorName,
    authorProfileUrl: r.authorProfileUrl ?? null,
    text: r.text,
    postedAt: new Date(r.postedAt),
    fetchedAt: new Date(r.fetchedAt),
    parseStatus: r.parseStatus as ParseStatus
  });
}

function toRecord(post: RawPost): RawPostRecord {
  return {
    id: post.id,
    fbPostId: post.fbPostId,
    groupId: post.groupId,
    authorName: post.authorName,
    authorProfileUrl: post.authorProfileUrl,
    text: post.text,
    postedAt: post.postedAt.toISOString(),
    fetchedAt: post.fetchedAt.toISOString(),
    parseStatus: post.parseStatus
  };
}

export class JsonRawPostRepository implements RawPostRepository {
  constructor(private store: BadmintonStore) {}

  async findByFbPostId(fbPostId: string): Promise<RawPost | null> {
    const posts = await this.store.rawPosts();
    const record = posts.find((p) => p.fbPostId === fbPostId) ?? null;
    return record ? toEntity(record) : null;
  }

  async findById(id: string): Promise<RawPost | null> {
    const posts = await this.store.rawPosts();
    const record = posts.find((p) => p.id === id) ?? null;
    return record ? toEntity(record) : null;
  }

  async findPending(): Promise<RawPost[]> {
    const posts = await this.store.rawPosts();
    return posts.filter((p) => p.parseStatus === "pending").map(toEntity);
  }

  async save(post: RawPost): Promise<void> {
    await this.store.mutate((s) => {
      const idx = s.rawPosts.findIndex((p) => p.id === post.id);
      if (idx >= 0) {
        s.rawPosts[idx] = toRecord(post);
      } else {
        s.rawPosts.push(toRecord(post));
      }
    });
  }
}
